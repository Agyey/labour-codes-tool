import asyncio
from loguru import logger
from src.celery_app import celery_app
from src.pipeline_task import run_pipeline_background


@celery_app.task(name="process_document_task")
def process_document_task(job_id: str, document_id: str, raw_text: str) -> bool:
    """Synchronous Celery task entrypoint for complex pipeline extraction."""
    logger.info(f"Starting Celery background pipeline {job_id} for doc {document_id}")
    asyncio.run(run_pipeline_background(job_id, document_id, raw_text))
    return True
