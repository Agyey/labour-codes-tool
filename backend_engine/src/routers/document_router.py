import os
import shutil
import tempfile

from fastapi import APIRouter, File, UploadFile, HTTPException, Request
from loguru import logger

from src.database import db
from src.parser import extract_document_text
from src.audit_chain import record_audit
from src.settings import settings
from src.tasks import process_document_task
from src.limiter import limiter
from src.graph import traverse_for_query

router = APIRouter(tags=["documents"])


@router.post("/api/pipeline/ingest")
@limiter.limit(f"{settings.rate_limit_rpm}/minute")
async def ingest_document(
    request: Request, file: UploadFile = File(...)
) -> dict[str, object]:
    """Upload a PDF. Stores text, returns document ID for subsequent analysis."""
    if not file.filename:
        raise HTTPException(400, "No filename provided.")

    safe_filename = os.path.basename(file.filename.replace("\\", "/"))
    ext = os.path.splitext(safe_filename)[1].lower()
    if ext not in settings.allowed_file_types:
        raise HTTPException(
            400, f"Unsupported file type: {ext}. Allowed: {settings.allowed_file_types}"
        )

    contents: bytes = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > settings.max_upload_size_mb:
        raise HTTPException(
            413,
            f"File too large: {size_mb:.1f}MB. Max: {settings.max_upload_size_mb}MB",
        )

    try:
        temp_dir = tempfile.mkdtemp()
        file_path = os.path.join(temp_dir, safe_filename)
        with open(file_path, "wb") as buffer:
            buffer.write(contents)

        raw_text, page_count = extract_document_text(file_path)
        shutil.rmtree(temp_dir, ignore_errors=True)

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

        job = await db.processingjob.create(
            data={
                "document_id": document.id,
                "status": "queued",
                "current_pass": 0,
                "total_passes": 6,
            }
        )

        process_document_task.delay(job.id, document.id, raw_text)

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


@router.get("/api/documents")
async def list_documents() -> list[dict[str, object]]:
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
            "status": "processing"
            if d.id in job_map and job_map[d.id].status in ["queued", "running"]
            else (
                job_map[d.id].status
                if d.id in job_map and job_map[d.id].status == "failed"
                else d.status
            ),
            "uploaded_at": d.uploaded_at.isoformat() if d.uploaded_at else None,
            "analyzed_at": d.analyzed_at.isoformat() if d.analyzed_at else None,
            "job_id": job_map[d.id].id if d.id in job_map else None,
        }
        for d in docs
    ]


@router.get("/api/documents/{document_id}")
async def get_document(document_id: str) -> dict[str, object]:
    """Get document detail with analysis and suggestions."""
    doc = await db.document.find_unique(where={"id": document_id})
    if not doc:
        raise HTTPException(404, "Document not found.")

    analysis = await db.documentanalysis.find_first(
        where={"document_id": document_id},
        order={"created_at": "desc"},
    )

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


@router.delete("/api/documents/{document_id}")
async def delete_document(document_id: str) -> dict[str, str]:
    """Delete a document and all associated analysis, suggestions, and audit records."""
    doc = await db.document.find_unique(where={"id": document_id})
    if not doc:
        raise HTTPException(404, "Document not found.")

    await db.documentsuggestion.delete_many(where={"document_id": document_id})
    await db.documentanalysis.delete_many(where={"document_id": document_id})
    await db.processingjob.delete_many(where={"document_id": document_id})
    await db.document.delete(where={"id": document_id})

    await record_audit(
        action="document_deleted",
        entity_type="document",
        entity_id=document_id,
        data={"name": doc.name, "file_name": doc.file_name},
    )

    logger.info(f"Document deleted: {document_id} ({doc.name})")
    return {"message": "Document deleted.", "id": document_id}


@router.patch("/api/documents/{document_id}/cancel")
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


@router.get("/api/documents/{document_id}/tree")
async def get_tree(document_id: str, chapter: str | None = None) -> dict[str, object]:
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
