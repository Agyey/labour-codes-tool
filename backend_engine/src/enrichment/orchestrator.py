"""Stage 3: Enrichment Orchestrator.

Runs the 6 passes sequentially on a fully extracted document tree.
Publishes Server-Sent Events (SSE) progress via a callback.
"""

import time
from typing import Awaitable, Callable
from loguru import logger
from prisma import Client

from ..models import ExtractedLegislation, DocumentClassification
from .pass1_structure import run_pass1
from .pass2_definitions import run_pass2
from .pass3_compliance import run_pass3
from .pass4_xrefs import run_pass4
from .pass5_applicability import run_pass5
from .pass6_authority import run_pass6


PASSES = [
    (1, "Structural Population"),
    (2, "Definitions Extraction"),
    (3, "Compliance & Obligations"),
    (4, "Cross-Reference Resolution"),
    (5, "Applicability Mapping"),
    (6, "Authority & Remedy Routing"),
]


async def run_enrichment(
    job_id: str,
    source_doc_id: str | None,
    extracted: ExtractedLegislation,
    classification: DocumentClassification,
    db: Client,
    publish_progress: Callable[[str, int, str, str], Awaitable[None]],
) -> str:
    """Runs all 6 enrichment passes sequentially.

    Args:
        job_id: The UUID of the ProcessingJob
        source_doc_id: The original uploaded Document ID (from Stage 1)
        extracted: The Gemini-extracted JSON model
        classification: The Stage 2 classifier result
        db: Prisma client
        publish_progress: Async callback(job_id, pass_num, label, status)

    Returns:
        The new LegalDocument ID.
    """
    logger.info(f"Starting enrichment orchestration for job {job_id}")
    start_time = time.time()

    # Pass 1 creates the base document in the DB; we need its ID for all subsequent passes
    await publish_progress(job_id, 1, PASSES[0][1], "running")
    legal_doc_id = await run_pass1(db, source_doc_id, extracted, classification, job_id)
    await publish_progress(job_id, 1, PASSES[0][1], "done")

    # Run passes 2 through 6
    pass_functions: list[Callable[[Client, str], Awaitable[None]]] = [
        run_pass2,
        run_pass3,
        run_pass4,
        run_pass5,
        run_pass6,
    ]

    for i, pass_func in enumerate(pass_functions, start=2):
        label = PASSES[i - 1][1]
        await publish_progress(job_id, i, label, "running")

        try:
            await pass_func(db, legal_doc_id)
            await publish_progress(job_id, i, label, "done")
        except Exception as e:
            logger.exception(f"Pass {i} ({label}) failed: {e}")
            await publish_progress(job_id, i, label, f"failed: {e}")
            # Depending on strictness, we might raise or continue.
            # In a robust pipeline, failure of cross-refs shouldn't kill the whole document.

    elapsed = time.time() - start_time
    logger.success(f"Enrichment completed in {elapsed:.1f}s for doc {legal_doc_id}")

    return legal_doc_id
