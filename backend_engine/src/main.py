"""Document Hub — FastAPI Application.

Endpoints:
  POST   /api/documents/upload          Upload a PDF
  GET    /api/documents                 List all documents
  GET    /api/documents/{id}            Document detail + analysis + suggestions
  POST   /api/documents/{id}/analyze    Trigger AI analysis (background)
  GET    /api/documents/{id}/analyze/stream  SSE streaming analysis
  GET    /api/documents/{id}/tree       Get Neo4j graph tree
  PATCH  /api/suggestions/{id}/approve  Approve a suggestion → materialize
  PATCH  /api/suggestions/{id}/reject   Reject a suggestion
  GET    /api/audit/chain               Audit chain integrity check
  GET    /health                        Health check
"""

import json
import os
import prisma
import shutil
import tempfile
import typing
from contextlib import asynccontextmanager
from datetime import datetime, timezone

import uvicorn
from fastapi import (
    FastAPI,
    File,
    Request,
    UploadFile,
    HTTPException,
    Query,
    BackgroundTasks,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from loguru import logger
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from src.database import db, connect_db, disconnect_db
from src.graph_service import close_driver, traverse_for_query
from src.parser import (
    extract_document_text,
    analyze_document_stream,
    build_graph_and_suggestions,
)
import asyncio
import time
from src.audit_chain import record_audit, verify_chain_integrity
from src.settings import settings
from src.pipeline_task import run_pipeline_background, stream_pipeline_events


@asynccontextmanager
async def lifespan(app: FastAPI) -> typing.AsyncGenerator[None, None]:
    """Startup / shutdown lifecycle."""
    logger.add("backend-engine.log", serialize=True, rotation="10 MB")
    await connect_db()
    logger.info("Postgres connected.")
    yield
    await disconnect_db()
    await close_driver()
    logger.info("All connections closed.")


# 🛡️ Rate limiter — uses IP-based keying
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Document Hub API",
    version="0.1.0",
    lifespan=lifespan,
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore[arg-type]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────
# SSE Helper
# ──────────────────────────────────────────────


def _sse_event(event: str, data: dict[str, typing.Any]) -> str:
    """Format a single SSE event."""
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


# ──────────────────────────────────────────────
# Health
# ──────────────────────────────────────────────


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "document-hub"}


# ──────────────────────────────────────────────
# Document Upload
# ──────────────────────────────────────────────


@app.post("/api/pipeline/ingest")
@limiter.limit(f"{settings.rate_limit_rpm}/minute")
async def ingest_document(
    request: Request, file: UploadFile = File(...)
) -> dict[str, typing.Any]:
    """Upload a PDF. Stores text, returns document ID for subsequent analysis."""
    if not file.filename:
        raise HTTPException(400, "No filename provided.")

    # 🛡️ Sentinel: Sanitize filename to prevent path traversal
    safe_filename = os.path.basename(file.filename.replace("\\", "/"))

    ext = os.path.splitext(safe_filename)[1].lower()
    if ext not in settings.allowed_file_types:
        raise HTTPException(
            400, f"Unsupported file type: {ext}. Allowed: {settings.allowed_file_types}"
        )

    # Check file size
    contents: bytes = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > settings.max_upload_size_mb:
        raise HTTPException(
            413,
            f"File too large: {size_mb:.1f}MB. Max: {settings.max_upload_size_mb}MB",
        )

    try:
        # Save temp file for text extraction
        temp_dir = tempfile.mkdtemp()
        file_path = os.path.join(temp_dir, safe_filename)
        with open(file_path, "wb") as buffer:
            buffer.write(contents)

        # Extract text + page count
        raw_text, page_count = extract_document_text(file_path)

        # Clean up temp file
        shutil.rmtree(temp_dir, ignore_errors=True)

        # Store in Postgres
        document = await db.document.create(
            data={
                "name": os.path.splitext(safe_filename)[0],
                "file_name": safe_filename,
                "file_size": len(contents),
                "page_count": page_count,
                "raw_text": raw_text,
                "status": "uploaded",
            }
        )

        # Audit
        await record_audit(
            action="document_uploaded",
            entity_type="document",
            entity_id=document.id,
            data={
                "file_name": safe_filename,
                "size": len(contents),
                "pages": page_count,
            },
        )

        logger.info(
            f"Document uploaded: {document.id} — {safe_filename} ({page_count} pages)"
        )

        # 🚀 START PIPELINE: Create a ProcessingJob
        job = await db.processingjob.create(
            data={
                "document_id": document.id,
                "status": "queued",
                "current_pass": 0,
                "total_passes": 6,
            }
        )
        
        # Fire and forget the background pipeline
        asyncio.create_task(run_pipeline_background(job.id, document.id, raw_text))

        return {
            "id": document.id,
            "job_id": job.id,
            "name": document.name,
            "file_name": document.file_name,
            "file_size": document.file_size,
            "page_count": page_count,
            "status": "processing",
        }

    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(500, "Upload failed. Please try again.")

# ──────────────────────────────────────────────
# Pipeline Streaming
# ──────────────────────────────────────────────

@app.get("/api/pipeline/jobs/{job_id}/stream")
@limiter.limit("20/minute")
async def stream_pipeline(request: Request, job_id: str) -> StreamingResponse:
    """SSE endpoint that streams real-time pipeline progress across all 6 stages."""
    job = await db.processingjob.find_unique(where={"id": job_id})
    if not job:
        raise HTTPException(404, "Job not found.")
        
    return StreamingResponse(
        stream_pipeline_events(job_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ──────────────────────────────────────────────
# Document List / Detail
# ──────────────────────────────────────────────


@app.get("/api/documents")
async def list_documents() -> list[dict[str, typing.Any]]:
    """List all uploaded documents."""
    docs = await db.document.find_many(order={"uploaded_at": "desc"})
    jobs = await db.processingjob.find_many(
        where={"document_id": {"in": [d.id for d in docs]}}
    )
    job_map = {j.document_id: j for j in jobs if j.document_id}

    return [
        {
            "id": d.id,
            "name": d.name,
            "file_name": d.file_name,
            "file_size": d.file_size,
            "page_count": d.page_count,
            "status": "processing" if d.id in job_map and job_map[d.id].status in ["queued", "running"] else (job_map[d.id].status if d.id in job_map and job_map[d.id].status == "failed" else d.status),
            "uploaded_at": d.uploaded_at.isoformat() if d.uploaded_at else None,
            "analyzed_at": d.analyzed_at.isoformat() if d.analyzed_at else None,
            "job_id": job_map[d.id].id if d.id in job_map else None,
        }
        for d in docs
    ]


@app.get("/api/documents/{document_id}")
async def get_document(document_id: str) -> dict[str, typing.Any]:
    """Get document detail with analysis and suggestions."""
    doc = await db.document.find_unique(where={"id": document_id})
    if not doc:
        raise HTTPException(404, "Document not found.")

    # Get analysis if exists
    analysis = await db.documentanalysis.find_first(
        where={"document_id": document_id},
        order={"created_at": "desc"},
    )

    # Get suggestions
    suggestions = await db.documentsuggestion.find_many(
        where={"document_id": document_id},
        order={"created_at": "asc"},
    )

    return {
        "document": {
            "id": doc.id,
            "name": doc.name,
            "file_name": doc.file_name,
            "file_size": doc.file_size,
            "page_count": doc.page_count,
            "status": doc.status,
            "raw_text": doc.raw_text,
            "uploaded_at": doc.uploaded_at.isoformat() if doc.uploaded_at else None,
            "analyzed_at": doc.analyzed_at.isoformat() if doc.analyzed_at else None,
        },
        "analysis": {
            "id": analysis.id,
            "summary": analysis.summary,
            "document_type": analysis.document_type,
            "structured_data": analysis.structured_data,
            "graph_nodes": analysis.graph_nodes,
            "graph_relationships": analysis.graph_relationships,
            "created_at": analysis.created_at.isoformat()
            if analysis.created_at
            else None,
        }
        if analysis
        else None,
        "suggestions": [
            {
                "id": s.id,
                "type": s.type,
                "target_module": s.target_module,
                "suggested_data": s.suggested_data,
                "confidence": s.confidence,
                "status": s.status,
                "created_at": s.created_at.isoformat() if s.created_at else None,
            }
            for s in suggestions
        ],
    }


# ──────────────────────────────────────────────
# Document Delete & Cancel Analysis
# ──────────────────────────────────────────────


@app.delete("/api/documents/{document_id}")
async def delete_document(document_id: str) -> dict[str, str]:
    """Delete a document and all associated analysis, suggestions, and audit records."""
    doc = await db.document.find_unique(where={"id": document_id})
    if not doc:
        raise HTTPException(404, "Document not found.")

    # Manual Cascade: we must manually delete all children due to lack of DB-level ON DELETE CASCADE
    await db.document.delete(where={"id": document_id})

    await record_audit(
        action="document_deleted",
        entity_type="document",
        entity_id=document_id,
        data={"name": doc.name, "file_name": doc.file_name},
    )

    logger.info(f"Document deleted: {document_id} ({doc.name})")
    return {"message": "Document deleted.", "id": document_id}


@app.patch("/api/documents/{document_id}/cancel")
async def cancel_analysis(document_id: str) -> dict[str, str]:
    """Cancel an in-progress analysis by resetting status to 'uploaded'."""
    doc = await db.document.find_unique(where={"id": document_id})
    if not doc:
        raise HTTPException(404, "Document not found.")
    if doc.status != "analyzing":
        raise HTTPException(
            400, f"Document is not currently analyzing (status: {doc.status})."
        )

    await db.document.update(where={"id": document_id}, data={"status": "uploaded"})

    logger.info(f"Analysis cancelled for document: {document_id}")
    return {"message": "Analysis cancelled.", "status": "uploaded"}


@app.post("/api/documents/{document_id}/analyze")
async def trigger_analysis(
    document_id: str, background_tasks: BackgroundTasks
) -> dict[str, str]:
    """Trigger Gemini analysis on an uploaded document (Background)."""
    doc = await db.document.find_unique(where={"id": document_id})
    if not doc:
        raise HTTPException(404, "Document not found.")
    if not doc.raw_text:
        raise HTTPException(400, "Document has no extracted text.")

    if document_id not in ANALYSIS_EVENTS and doc.status != "analyzed":
        await db.document.update(
            where={"id": document_id}, data={"status": "analyzing"}
        )
        asyncio.create_task(_run_analysis_background(document_id, doc.raw_text))

    return {
        "message": "Analysis started in background. Please poll for status or connect to stream.",
        "document_id": document_id,
        "status": "analyzing",
    }


# ──────────────────────────────────────────────
# AI Analysis — SSE Streaming
# ──────────────────────────────────────────────

# Global state for resilient streaming across page reloads
ANALYSIS_EVENTS: dict[str, list[str]] = {}
ANALYSIS_LISTENERS: dict[str, list[asyncio.Queue[str | None]]] = {}


async def _publish_event(document_id: str, event_str: str) -> None:
    if document_id not in ANALYSIS_EVENTS:
        ANALYSIS_EVENTS[document_id] = []
    ANALYSIS_EVENTS[document_id].append(event_str)

    if document_id in ANALYSIS_LISTENERS:
        for q in ANALYSIS_LISTENERS[document_id]:
            await q.put(event_str)


async def _publish_done(document_id: str) -> None:
    if document_id in ANALYSIS_LISTENERS:
        for q in ANALYSIS_LISTENERS[document_id]:
            await q.put(None)
        ANALYSIS_LISTENERS.pop(document_id, None)


async def _stream_reader(document_id: str) -> typing.AsyncGenerator[str, None]:
    # Yield history first
    for evt in ANALYSIS_EVENTS.get(document_id, []):
        yield evt

    doc = await db.document.find_unique(where={"id": document_id})
    if not doc or (doc.status != "analyzing" and document_id not in ANALYSIS_EVENTS):
        return

    q: asyncio.Queue[str | None] = asyncio.Queue()
    if document_id not in ANALYSIS_LISTENERS:
        ANALYSIS_LISTENERS[document_id] = []
    ANALYSIS_LISTENERS[document_id].append(q)

    try:
        while True:
            stream_evt: str | None = await q.get()
            if stream_evt is None:
                break
            yield stream_evt
    finally:
        if document_id in ANALYSIS_LISTENERS and q in ANALYSIS_LISTENERS[document_id]:
            ANALYSIS_LISTENERS[document_id].remove(q)


async def _run_analysis_background(document_id: str, raw_text: str) -> None:
    """Runs the document analysis in a background task, detached from the HTTP lifecycle."""
    start_time = time.time()

    def _elapsed() -> str:
        elasped_sec = time.time() - start_time
        return f"{elasped_sec:.1f}s"

    try:
        await _publish_event(
            document_id,
            _sse_event(
                "progress",
                {
                    "phase": "init",
                    "status": "done",
                    "message": "Initializing document analysis pipeline...",
                    "detail": f"Document ID: {str(document_id)[:8]}... | {len(raw_text):,} characters to process",
                    "elapsed": _elapsed(),
                },
            ),
        )

        await _publish_event(
            document_id,
            _sse_event(
                "progress",
                {
                    "phase": "extraction",
                    "status": "running",
                    "message": "Sending document to Gemini 2.5 Flash...",
                    "detail": "Beginning thought process and extraction...",
                    "elapsed": _elapsed(),
                },
            ),
        )

        extraction_result: list[typing.Any] = []

        try:
            async for chunk in analyze_document_stream(document_id, raw_text):
                if isinstance(chunk, str):
                    await _publish_event(
                        document_id,
                        _sse_event(
                            "progress",
                            {
                                "phase": "extraction",
                                "status": "running",
                                "message": "Gemini Analysis",
                                "detail": f"🤔 {chunk}",
                                "elapsed": _elapsed(),
                            },
                        ),
                    )
                else:
                    extraction_result.append(chunk)
        except Exception as exc:
            extraction_result.append(exc)

        if not extraction_result or isinstance(extraction_result[0], Exception):
            raise (
                extraction_result[0]
                if extraction_result
                else RuntimeError("Extraction returned no result")
            )

        extracted = extraction_result[0]

        await _publish_event(
            document_id,
            _sse_event(
                "progress",
                {
                    "phase": "extraction",
                    "status": "done",
                    "message": f"Extraction complete — {extracted.name}",
                    "detail": (
                        f"{len(extracted.chapters)} chapters · "
                        f"{sum(len(ch.sections) for ch in extracted.chapters)} sections · "
                        f"{len(extracted.definitions)} definitions · "
                        f"{len(extracted.penalties)} penalties · "
                        f"{len(extracted.key_changes)} key changes"
                    ),
                    "elapsed": _elapsed(),
                },
            ),
        )

        await _publish_event(
            document_id,
            _sse_event(
                "progress",
                {
                    "phase": "structure",
                    "status": "running",
                    "message": "Constructing document structure tree...",
                    "detail": "Building vectorless RAG hierarchy for intelligent traversal",
                    "elapsed": _elapsed(),
                },
            ),
        )

        tree_preview: list[dict[str, typing.Any]] = []
        for ch in extracted.chapters:
            sections_preview = [
                {"number": s.section_number, "title": s.title} for s in ch.sections
            ]
            tree_preview.append(
                {
                    "chapter": ch.chapter_number,
                    "name": ch.chapter_name,
                    "sections": sections_preview,
                }
            )

        await _publish_event(
            document_id,
            _sse_event(
                "tree",
                {
                    "phase": "structure",
                    "status": "done",
                    "message": f"Document tree: {len(tree_preview)} chapters mapped",
                    "chapters": tree_preview,
                    "elapsed": _elapsed(),
                },
            ),
        )

        await _publish_event(
            document_id,
            _sse_event(
                "progress",
                {
                    "phase": "graph",
                    "status": "running",
                    "message": "Building knowledge graph in Neo4j...",
                    "detail": f"Creating nodes for {len(extracted.chapters)} chapters",
                    "elapsed": _elapsed(),
                },
            ),
        )

        result = await build_graph_and_suggestions(document_id, extracted)

        await _publish_event(
            document_id,
            _sse_event(
                "progress",
                {
                    "phase": "graph",
                    "status": "done",
                    "message": "Knowledge graph built successfully",
                    "detail": (
                        f"{result['graph_stats']['nodes']} nodes · "
                        f"{result['graph_stats']['relationships']} relationships · "
                        f"{result['suggestion_count']} suggestions generated"
                    ),
                    "elapsed": _elapsed(),
                },
            ),
        )

        await _publish_event(
            document_id,
            _sse_event(
                "progress",
                {
                    "phase": "finalize",
                    "status": "running",
                    "message": "Finalizing analysis and recording audit trail...",
                    "detail": "Updating document status and creating tamper-proof audit record",
                    "elapsed": _elapsed(),
                },
            ),
        )

        await db.document.update(
            where={"id": document_id},
            data={"status": "analyzed", "analyzed_at": datetime.now(timezone.utc)},
        )

        await _publish_event(
            document_id,
            _sse_event(
                "progress",
                {
                    "phase": "finalize",
                    "status": "done",
                    "message": "Analysis complete!",
                    "detail": f"{result['suggestion_count']} suggestions ready for your review",
                    "elapsed": _elapsed(),
                },
            ),
        )

        # Final event
        await _publish_event(
            document_id,
            _sse_event(
                "complete",
                {
                    "suggestion_count": result["suggestion_count"],
                    "graph_nodes": result["graph_stats"]["nodes"],
                    "graph_relationships": result["graph_stats"]["relationships"],
                    "analysis_id": result["analysis_id"],
                    "elapsed": _elapsed(),
                },
            ),
        )

    except Exception as e:
        logger.error(f"Background analysis failed for {document_id}: {e}")
        await db.document.update(where={"id": document_id}, data={"status": "error"})
        await _publish_event(
            document_id,
            _sse_event(
                "error",
                {
                    "message": "Analysis failed. Please try again.",
                },
            ),
        )
    finally:
        await _publish_done(document_id)

        # Self-clean up after 5 minutes
        async def _cleanup() -> None:
            await asyncio.sleep(300)
            ANALYSIS_EVENTS.pop(document_id, None)

        asyncio.create_task(_cleanup())


@app.get("/api/documents/{document_id}/analyze/stream")
@limiter.limit("5/minute")
async def stream_analysis(request: Request, document_id: str) -> StreamingResponse:
    """SSE endpoint that streams real-time analysis progress."""
    doc = await db.document.find_unique(where={"id": document_id})
    if not doc:
        raise HTTPException(404, "Document not found.")
    if not doc.raw_text:
        raise HTTPException(400, "Document has no extracted text.")

    # Only start background task if not already tracking
    if document_id not in ANALYSIS_EVENTS and doc.status != "analyzed":
        await db.document.update(
            where={"id": document_id}, data={"status": "analyzing"}
        )
        asyncio.create_task(_run_analysis_background(document_id, doc.raw_text))

    return StreamingResponse(
        _stream_reader(document_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ──────────────────────────────────────────────
# Neo4j Graph Tree
# ──────────────────────────────────────────────


@app.get("/api/documents/{document_id}/tree")
async def get_tree(
    document_id: str, chapter: str | None = None
) -> dict[str, typing.Any]:
    """Get the vectorless RAG tree from Neo4j."""
    try:
        if chapter:
            data = await traverse_for_query(document_id, target_chapter=chapter)
        else:
            data = await traverse_for_query(document_id)
        return {"tree": data}
    except Exception as e:
        logger.error(f"Graph query failed: {e}")
        raise HTTPException(500, f"Graph query failed: {str(e)}")


# ──────────────────────────────────────────────
# Suggestion Approval / Rejection
# ──────────────────────────────────────────────


@app.patch("/api/suggestions/{suggestion_id}/approve")
@limiter.limit(f"{settings.rate_limit_rpm}/minute")
async def approve_suggestion(
    request: Request,
    suggestion_id: str,
    framework_id: str = Query(default=""),
    provision_id: str = Query(default=""),
) -> dict[str, str]:
    """Approve a suggestion and materialize it into the target module."""
    suggestion = await db.documentsuggestion.find_unique(where={"id": suggestion_id})
    if not suggestion:
        raise HTTPException(404, "Suggestion not found.")
    if suggestion.status != "pending":
        raise HTTPException(400, f"Suggestion already {suggestion.status}.")

    if suggestion.suggested_data is None:
        raise HTTPException(400, "Suggestion data is empty.")

    data = typing.cast(dict[str, typing.Any], suggestion.suggested_data)
    try:
        match suggestion.type:
            case "create_legislation":
                if not framework_id:
                    raise HTTPException(
                        400, "framework_id is required to create legislation."
                    )
                await db.legislation.create(
                    data={
                        "name": str(data.get("name", "")),
                        "short_name": str(data.get("short_name", "")),
                        "year": int(data.get("year", 0)),
                        "type": str(data.get("type", "act")),
                        "framework_id": framework_id,
                    }
                )

            case "create_provision":
                await db.provision.create(
                    data={
                        "code": str(data.get("short_name", "")),
                        "chapter": str(data.get("chapter", "")),
                        "chapter_name": str(data.get("chapter_name", "")),
                        "section": str(data.get("section", "")),
                        "sub_section": "1",
                        "title": str(data.get("title", "")),
                        "summary": str(data.get("summary", "")),
                        "full_text": str(data.get("full_text", "")),
                        "sub_sections": prisma.Json(data.get("sub_sections", [])),
                        "impact": "Pending Review",
                        "rule_authority": "Appropriate Government",
                        "status": "active",
                        "provision_type": "section",
                    }
                )

            case "create_compliance_item":
                if not provision_id:
                    raise HTTPException(
                        400, "provision_id is required to create a compliance item."
                    )
                await db.complianceitem.create(
                    data={
                        "provision_id": provision_id,
                        "task": f"{data.get('task')} ({data.get('due_logic')})",
                        "status": "Not Started",
                    }
                )

            case "create_penalty":
                logger.info(
                    f"Penalty suggestion approved. Modifying provision tracking for section {data.get('section')}"
                )
                # Real implementation would update the associated Provision or Penalty module

            case "create_definition":
                logger.info(f"Definition suggestion approved: {data.get('term')}")
                # Real implementation would store the definition in a Knowledge Base or Glossary

            case "flag_repeal":
                logger.info(f"Flagging repeal: {data.get('repealed_act_name')}")

        # Update suggestion status
        await db.documentsuggestion.update(
            where={"id": suggestion_id},
            data={
                "status": "approved",
                "reviewed_at": datetime.now(timezone.utc),
            },
        )

        # Audit trail
        await record_audit(
            action="suggestion_approved",
            entity_type="suggestion",
            entity_id=suggestion_id,
            data={"type": suggestion.type, "target": suggestion.target_module},
        )

        return {
            "message": "Suggestion approved and materialized.",
            "status": "approved",
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Approval failed: {e}")
        raise HTTPException(500, f"Approval failed: {str(e)}")


@app.patch("/api/suggestions/{suggestion_id}/reject")
async def reject_suggestion(
    suggestion_id: str, reason: str = Query(default="")
) -> dict[str, str]:
    """Reject a suggestion with optional reason."""
    suggestion = await db.documentsuggestion.find_unique(where={"id": suggestion_id})
    if not suggestion:
        raise HTTPException(404, "Suggestion not found.")

    await db.documentsuggestion.update(
        where={"id": suggestion_id},
        data={
            "status": "rejected",
            "rejection_reason": reason,
            "reviewed_at": datetime.now(timezone.utc),
        },
    )

    await record_audit(
        action="suggestion_rejected",
        entity_type="suggestion",
        entity_id=suggestion_id,
        data={"type": suggestion.type, "reason": reason},
    )

    return {"message": "Suggestion rejected.", "status": "rejected"}


# ──────────────────────────────────────────────
# Audit Chain
# ──────────────────────────────────────────────


@app.get("/api/audit/verify")
async def verify_audit() -> dict[str, typing.Any]:
    """Verify the integrity of the audit chain."""
    result = await verify_chain_integrity()
    return result


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run("src.main:app", host="0.0.0.0", port=port, reload=False)  # nosec B104
