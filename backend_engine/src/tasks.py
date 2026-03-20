import asyncio
from datetime import datetime, timezone
from loguru import logger
from src.celery_app import celery_app
import time
import typing

from src.parser import analyze_document_stream, build_graph_and_suggestions
from src.database import connect_db, disconnect_db, db
from src.redis_client import publish_sse_event, publish_sse_done
from src.graph_service import close_driver


async def _async_run_analysis(document_id: str, raw_text: str) -> None:
    """Core analysis logic running inside the Celery worker's event loop."""
    await connect_db()
    start_time = time.time()

    def _elapsed() -> str:
        elasped_sec = time.time() - start_time
        return f"{elasped_sec:.1f}s"

    try:
        await publish_sse_event(
            document_id,
            "progress",
            {
                "phase": "init",
                "status": "done",
                "message": "Initializing document analysis on Celery worker...",
                "detail": f"Document ID: {str(document_id)[:8]}... | {len(raw_text):,} characters",
                "elapsed": _elapsed(),
            },
        )

        await publish_sse_event(
            document_id,
            "progress",
            {
                "phase": "extraction",
                "status": "running",
                "message": "Sending document to Gemini 2.5 Flash...",
                "detail": "Beginning thought process and extraction...",
                "elapsed": _elapsed(),
            },
        )

        extraction_result: list[typing.Any] = []

        try:
            async for chunk in analyze_document_stream(document_id, raw_text):
                if isinstance(chunk, str):
                    await publish_sse_event(
                        document_id,
                        "progress",
                        {
                            "phase": "extraction",
                            "status": "running",
                            "message": "Gemini Analysis",
                            "detail": f"🤔 {chunk}",
                            "elapsed": _elapsed(),
                        },
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

        await publish_sse_event(
            document_id,
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
        )

        await publish_sse_event(
            document_id,
            "progress",
            {
                "phase": "structure",
                "status": "running",
                "message": "Constructing document structure tree...",
                "detail": "Building vectorless RAG hierarchy for intelligent traversal",
                "elapsed": _elapsed(),
            },
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

        await publish_sse_event(
            document_id,
            "tree",
            {
                "phase": "structure",
                "status": "done",
                "message": f"Document tree: {len(tree_preview)} chapters mapped",
                "chapters": tree_preview,
                "elapsed": _elapsed(),
            },
        )

        await publish_sse_event(
            document_id,
            "progress",
            {
                "phase": "graph",
                "status": "running",
                "message": "Building knowledge graph in Neo4j...",
                "detail": f"Creating nodes for {len(extracted.chapters)} chapters",
                "elapsed": _elapsed(),
            },
        )

        # Call the parser graph builder
        result = await build_graph_and_suggestions(document_id, extracted)

        await publish_sse_event(
            document_id,
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
        )

        await publish_sse_event(
            document_id,
            "progress",
            {
                "phase": "finalize",
                "status": "running",
                "message": "Finalizing analysis and recording audit trail...",
                "detail": "Updating document status and creating tamper-proof audit record",
                "elapsed": _elapsed(),
            },
        )

        # Mark as finally analyzed
        await db.document.update(
            where={"id": document_id},
            data={"status": "analyzed", "analyzed_at": datetime.now(timezone.utc)},
        )

        await publish_sse_event(
            document_id,
            "progress",
            {
                "phase": "finalize",
                "status": "done",
                "message": "Analysis complete!",
                "detail": f"{result['suggestion_count']} suggestions ready for your review",
                "elapsed": _elapsed(),
            },
        )

        # Final event
        await publish_sse_event(
            document_id,
            "complete",
            {
                "suggestion_count": result["suggestion_count"],
                "graph_nodes": result["graph_stats"]["nodes"],
                "graph_relationships": result["graph_stats"]["relationships"],
                "analysis_id": result["analysis_id"],
                "elapsed": _elapsed(),
            },
        )

    except Exception as e:
        logger.exception(f"Background analysis failed for {document_id}")
        await publish_sse_event(
            document_id,
            "error",
            {
                "phase": "failed",
                "status": "error",
                "message": "Analysis Failed",
                "detail": str(e),
                "elapsed": _elapsed(),
            },
        )
        await db.document.update(where={"id": document_id}, data={"status": "error"})

    finally:
        await publish_sse_done(document_id)
        await close_driver()
        await disconnect_db()


@celery_app.task(name="process_document_task")
def process_document_task(document_id: str, raw_text: str) -> bool:
    """Synchronous Celery task entrypoint."""
    logger.info(f"Starting Celery background task for {document_id}")
    asyncio.run(_async_run_analysis(document_id, raw_text))
    return True
