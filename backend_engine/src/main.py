"""Document Hub — FastAPI Application.

Endpoints:
  POST   /api/documents/upload          Upload a PDF
  GET    /api/documents                 List all documents
  GET    /api/documents/{id}            Document detail + analysis + suggestions
  POST   /api/documents/{id}/analyze    Trigger AI analysis
  GET    /api/documents/{id}/tree       Get Neo4j graph tree
  PATCH  /api/suggestions/{id}/approve  Approve a suggestion → materialize
  PATCH  /api/suggestions/{id}/reject   Reject a suggestion
  GET    /api/audit/chain               Audit chain integrity check
  GET    /health                        Health check
"""
import json
import os
import shutil
import tempfile
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from src.database import db, connect_db, disconnect_db
from src.graph_service import close_driver, get_document_tree, traverse_for_query
from src.parser import extract_text_from_pdf, analyze_document, build_graph_and_suggestions
from src.audit_chain import record_audit, verify_chain_integrity
from src.settings import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    logger.add("backend-engine.log", serialize=True, rotation="10 MB")
    await connect_db()
    logger.info("Postgres connected.")
    yield
    await disconnect_db()
    await close_driver()
    logger.info("All connections closed.")


app = FastAPI(
    title="Labour Codes Document Hub",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────
# Health
# ──────────────────────────────────────────────

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "document-hub"}


# ──────────────────────────────────────────────
# Document Upload
# ──────────────────────────────────────────────

@app.post("/api/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload a PDF. Stores text, returns document ID for subsequent analysis."""
    if not file.filename:
        raise HTTPException(400, "No filename provided.")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in settings.allowed_file_types:
        raise HTTPException(400, f"Unsupported file type: {ext}. Allowed: {settings.allowed_file_types}")

    # Check file size
    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > settings.max_upload_size_mb:
        raise HTTPException(413, f"File too large: {size_mb:.1f}MB. Max: {settings.max_upload_size_mb}MB")

    try:
        # Save temp file for text extraction
        temp_dir = tempfile.mkdtemp()
        file_path = os.path.join(temp_dir, file.filename)
        with open(file_path, "wb") as buffer:
            buffer.write(contents)

        # Extract text + page count
        raw_text, page_count = extract_text_from_pdf(file_path)

        # Clean up temp file
        shutil.rmtree(temp_dir, ignore_errors=True)

        # Store in Postgres
        document = await db.document.create(
            data={
                "name": os.path.splitext(file.filename)[0],
                "file_name": file.filename,
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
            data={"file_name": file.filename, "size": len(contents), "pages": page_count},
        )

        logger.info(f"Document uploaded: {document.id} — {file.filename} ({page_count} pages)")

        return {
            "id": document.id,
            "name": document.name,
            "file_name": document.file_name,
            "file_size": document.file_size,
            "page_count": page_count,
            "status": document.status,
        }

    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(500, f"Upload failed: {str(e)}")


# ──────────────────────────────────────────────
# Document List / Detail
# ──────────────────────────────────────────────

@app.get("/api/documents")
async def list_documents():
    """List all uploaded documents."""
    docs = await db.document.find_many(order={"uploaded_at": "desc"})
    return [
        {
            "id": d.id,
            "name": d.name,
            "file_name": d.file_name,
            "file_size": d.file_size,
            "page_count": d.page_count,
            "status": d.status,
            "uploaded_at": d.uploaded_at.isoformat() if d.uploaded_at else None,
            "analyzed_at": d.analyzed_at.isoformat() if d.analyzed_at else None,
        }
        for d in docs
    ]


@app.get("/api/documents/{document_id}")
async def get_document(document_id: str):
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
            "created_at": analysis.created_at.isoformat() if analysis.created_at else None,
        } if analysis else None,
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
# AI Analysis (Trigger)
# ──────────────────────────────────────────────

@app.post("/api/documents/{document_id}/analyze")
async def trigger_analysis(document_id: str):
    """Trigger Gemini analysis on an uploaded document."""
    doc = await db.document.find_unique(where={"id": document_id})
    if not doc:
        raise HTTPException(404, "Document not found.")
    if not doc.raw_text:
        raise HTTPException(400, "Document has no extracted text.")

    # Update status
    await db.document.update(where={"id": document_id}, data={"status": "analyzing"})

    try:
        # 1. AI extraction
        extracted = await analyze_document(document_id, doc.raw_text)

        # 2. Build graph + generate suggestions
        result = await build_graph_and_suggestions(document_id, extracted)

        # 3. Mark as analyzed
        from datetime import datetime, timezone
        await db.document.update(
            where={"id": document_id},
            data={"status": "analyzed", "analyzed_at": datetime.now(timezone.utc)},
        )

        return {
            "message": "Analysis complete. Suggestions generated for review.",
            "analysis_id": result["analysis_id"],
            "graph_stats": result["graph_stats"],
            "suggestion_count": result["suggestion_count"],
        }

    except Exception as e:
        await db.document.update(where={"id": document_id}, data={"status": "error"})
        logger.error(f"Analysis failed for {document_id}: {e}")
        raise HTTPException(500, f"Analysis failed: {str(e)}")


# ──────────────────────────────────────────────
# Neo4j Graph Tree
# ──────────────────────────────────────────────

@app.get("/api/documents/{document_id}/tree")
async def get_tree(document_id: str, chapter: str | None = None):
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
async def approve_suggestion(suggestion_id: str, framework_id: str = Query(default="")):
    """Approve a suggestion and materialize it into the target module."""
    suggestion = await db.documentsuggestion.find_unique(where={"id": suggestion_id})
    if not suggestion:
        raise HTTPException(404, "Suggestion not found.")
    if suggestion.status != "pending":
        raise HTTPException(400, f"Suggestion already {suggestion.status}.")

    data = suggestion.suggested_data
    from datetime import datetime, timezone

    try:
        if suggestion.type == "create_legislation":
            await db.legislation.create(
                data={
                    "name": data["name"],
                    "short_name": data["short_name"],
                    "year": data["year"],
                    "type": data.get("type", "act"),
                    "framework_id": framework_id,
                }
            )

        elif suggestion.type == "create_provision":
            await db.provision.create(
                data={
                    "code": data.get("short_name", ""),
                    "chapter": data["chapter"],
                    "chapter_name": data["chapter_name"],
                    "section": data["section"],
                    "sub_section": "1",
                    "title": data["title"],
                    "summary": data["summary"],
                    "full_text": data["full_text"],
                    "sub_sections": json.dumps(data.get("sub_sections", [])),
                    "impact": "Pending Review",
                    "rule_authority": "Appropriate Government",
                    "status": "active",
                    "provision_type": "section",
                }
            )

        elif suggestion.type == "create_compliance_item":
            await db.complianceitem.create(
                data={
                    "task": f"{data['task']} ({data['due_logic']})",
                    "status": "Not Started",
                }
            )

        elif suggestion.type == "flag_repeal":
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

        return {"message": "Suggestion approved and materialized.", "status": "approved"}

    except Exception as e:
        logger.error(f"Approval failed: {e}")
        raise HTTPException(500, f"Approval failed: {str(e)}")


@app.patch("/api/suggestions/{suggestion_id}/reject")
async def reject_suggestion(suggestion_id: str, reason: str = Query(default="")):
    """Reject a suggestion with optional reason."""
    suggestion = await db.documentsuggestion.find_unique(where={"id": suggestion_id})
    if not suggestion:
        raise HTTPException(404, "Suggestion not found.")

    from datetime import datetime, timezone

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
async def verify_audit():
    """Verify the integrity of the audit chain."""
    result = await verify_chain_integrity()
    return result


if __name__ == "__main__":
    uvicorn.run("src.main:app", host="0.0.0.0", port=8001, reload=True)
