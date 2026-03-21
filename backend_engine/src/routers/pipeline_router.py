from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

from src.database import db
from src.pipeline_task import stream_pipeline_events
from src.limiter import limiter

router = APIRouter(tags=["pipeline"])


@router.get("/api/pipeline/jobs/{job_id}/stream")
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
