"""Pipeline Orchestrator Task.

Wires together the 5 stages of the pipeline:
1. Ingestion (already done, creates ProcessingJob)
2. Classification
3. Extraction (Gemini)
4. Enrichment (6 passes)
5. Cross-Linking & Propagation (TBD, stubs for now)
"""
import asyncio
import json
import time
import typing

from loguru import logger
from prisma import Client

from src.database import db
from src.classifier import classify
from src.parser import analyze_document_stream
from src.enrichment import run_enrichment


# Global SSE state for the new pipeline
PIPELINE_EVENTS: dict[str, list[str]] = {}
PIPELINE_LISTENERS: dict[str, list[asyncio.Queue[str | None]]] = {}


def _sse_event(event: str, data: dict[str, typing.Any]) -> str:
    """Format a single SSE event."""
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


async def publish_pipeline_event(job_id: str, event_str: str) -> None:
    if job_id not in PIPELINE_EVENTS:
        PIPELINE_EVENTS[job_id] = []
    PIPELINE_EVENTS[job_id].append(event_str)

    if job_id in PIPELINE_LISTENERS:
        for q in PIPELINE_LISTENERS[job_id]:
            await q.put(event_str)


async def publish_pipeline_done(job_id: str) -> None:
    if job_id in PIPELINE_LISTENERS:
        for q in PIPELINE_LISTENERS[job_id]:
            await q.put(None)
        PIPELINE_LISTENERS.pop(job_id, None)


async def publish_progress(job_id: str, pass_num: int, label: str, status: str) -> None:
    """Callback for enrichment passes to publish SSE progress."""
    await publish_pipeline_event(
        job_id,
        _sse_event(
            "enrichment_progress",
            {
                "pass": pass_num,
                "label": label,
                "status": status,
            }
        )
    )


async def run_pipeline_background(job_id: str, document_id: str, raw_text: str) -> None:
    """The main background task spanning Stages 2 through 6."""
    start_time = time.time()
    
    def _elapsed() -> str:
        return f"{time.time() - start_time:.1f}s"
        
    try:
        # Update job status
        await db.processingjob.update(
            where={"id": job_id},
            data={"status": "processing"}
        )
        
        await publish_pipeline_event(job_id, _sse_event("pipeline_start", {"job_id": job_id, "status": "running"}))
        
        # ──────────────────────────────────────────────
        # Stage 2: Classification
        # ──────────────────────────────────────────────
        await publish_pipeline_event(job_id, _sse_event("stage_update", {"stage": "classification", "status": "running"}))
        
        classification = classify(raw_text)
        
        await publish_pipeline_event(job_id, _sse_event("stage_update", {"stage": "classification", "status": "done", "result": classification.__dict__}))

        # ──────────────────────────────────────────────
        # Stage 3: Extraction (Gemini)
        # ──────────────────────────────────────────────
        await publish_pipeline_event(job_id, _sse_event("stage_update", {"stage": "extraction", "status": "running"}))
        
        extraction_result: list[typing.Any] = []
        try:
            async for chunk in analyze_document_stream(document_id, raw_text):
                if isinstance(chunk, str):
                    await publish_pipeline_event(job_id, _sse_event("extraction_chunk", {"chunk": chunk}))
                else:
                    extraction_result.append(chunk)
        except Exception as exc:
            extraction_result.append(exc)
            
        if not extraction_result or isinstance(extraction_result[0], Exception):
            raise (extraction_result[0] if extraction_result else RuntimeError("Extraction returned no result"))
            
        extracted = extraction_result[0]
        
        await publish_pipeline_event(job_id, _sse_event("stage_update", {"stage": "extraction", "status": "done", "title": extracted.metadata.act_name if hasattr(extracted, 'metadata') else getattr(extracted, 'name', 'Unknown Document')}))
        
        # ──────────────────────────────────────────────
        # Stage 4: Enrichment (6 Passes)
        # ──────────────────────────────────────────────
        await publish_pipeline_event(job_id, _sse_event("stage_update", {"stage": "enrichment", "status": "running"}))
        
        legal_doc_id = await run_enrichment(
            job_id=job_id,
            source_doc_id=document_id,
            extracted=extracted,
            classification=classification,
            db=db,
            publish_progress=publish_progress
        )
        
        await publish_pipeline_event(job_id, _sse_event("stage_update", {"stage": "enrichment", "status": "done", "legal_doc_id": legal_doc_id}))
        
        # Update Job successful
        await db.processingjob.update(
            where={"id": job_id},
            data={
                "status": "completed",
                "completed_at": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                "result_doc_id": legal_doc_id
            }
        )
        
        await publish_pipeline_event(job_id, _sse_event("pipeline_complete", {"job_id": job_id, "legal_doc_id": legal_doc_id, "elapsed": _elapsed()}))

    except Exception as e:
        logger.error(f"Pipeline failed for job {job_id}: {e}")
        await db.processingjob.update(
            where={"id": job_id},
            data={
                "status": "failed",
                "error_log": str(e),
                "completed_at": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
            }
        )
        await publish_pipeline_event(job_id, _sse_event("pipeline_error", {"job_id": job_id, "error": str(e)}))
        
    finally:
        await publish_pipeline_done(job_id)
        
        # Cleanup routine
        async def _cleanup() -> None:
            await asyncio.sleep(300)
            PIPELINE_EVENTS.pop(job_id, None)
            
        asyncio.create_task(_cleanup())


async def stream_pipeline_events(job_id: str) -> typing.AsyncGenerator[str, None]:
    """Yields events for the StreamingResponse."""
    # Yield history first
    for evt in PIPELINE_EVENTS.get(job_id, []):
        yield evt

    # Check job status
    job = await db.processingjob.find_unique(where={"id": job_id})
    if not job or (job.status not in ("pending", "processing") and job_id not in PIPELINE_EVENTS):
        return

    q: asyncio.Queue[str | None] = asyncio.Queue()
    if job_id not in PIPELINE_LISTENERS:
        PIPELINE_LISTENERS[job_id] = []
    PIPELINE_LISTENERS[job_id].append(q)

    try:
        while True:
            stream_evt: str | None = await q.get()
            if stream_evt is None:
                break
            yield stream_evt
    finally:
        if job_id in PIPELINE_LISTENERS and q in PIPELINE_LISTENERS[job_id]:
            PIPELINE_LISTENERS[job_id].remove(q)

