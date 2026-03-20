"""Stage 3 / Pass 1: Structural Population.

Takes the output from the Gemini extractor (ExtractedLegislation) and creates
the LegalDocument + StructuralUnit tree in the database.
"""
from __future__ import annotations

import uuid
from typing import Any

from loguru import logger
from prisma import Client # type: ignore[attr-defined]

from src.models import ExtractedLegislation, DocumentClassification


async def run_pass1(
    db: Client,
    source_doc_id: str | None,
    extracted: ExtractedLegislation,
    classification: DocumentClassification,
    job_id: str | None = None,
) -> str:
    """Populates the database with the LegalDocument and StructuralUnit tree.
    
    Returns:
        The ID of the newly created LegalDocument.
    """
    logger.info(f"[Pass 1] Creating structure for '{extracted.name}'")
    
    # 1. Create the LegalDocument hub
    doc_id = str(uuid.uuid4())
    current_year = extracted.year if extracted.year else 2025
    
    await db.legaldocument.create(
        data={
            "id": doc_id,
            "title": extracted.name,
            "short_title": extracted.short_name,
            "year": current_year,
            "doc_type": classification.doc_type,
            "jurisdiction": classification.jurisdiction,
            "appropriate_govt": classification.appropriate_govt,
            "is_connector_act": classification.is_connector_act,
            "source_doc_id": source_doc_id,
            "processing_job_id": job_id,
            "status": "published",
        }
    )
    
    # 2. Build the StructuralUnit tree hierarchically
    sort_counter: list[int] = [0]
    
    async def process_sections(
        sections: list[Any], parent_id: str | None = None
    ) -> None:
        for sec in sections:
            unit_id = str(uuid.uuid4())
            sort_counter[0] += 1
            
            await db.structuralunit.create(
                data={
                    "id": unit_id,
                    "legal_doc_id": doc_id,
                    "parent_unit_id": parent_id,
                    "unit_type": "section",
                    "unit_number": str(sec.section_number),
                    "title": sec.title,
                    "full_text": sec.full_text,
                    "summary": sec.summary,
                    "sort_order": sort_counter[0],
                    "status": "active",
                    "confidence_score": 1.0,
                }
            )
            
            # Sub-sections
            sub_sections = getattr(sec, "sub_sections", [])
            if sub_sections:
                for sub in sub_sections:
                    sort_counter[0] += 1
                    await db.structuralunit.create(
                        data={
                            "legal_doc_id": doc_id,
                            "parent_unit_id": unit_id,
                            "unit_type": "sub_section",
                            "unit_number": str(sub.sub_section_number),
                            "full_text": sub.full_text,
                            "summary": sub.summary,
                            "sort_order": sort_counter[0],
                            "status": "active",
                        }
                    )

    # Walk the chapters -> sections
    for chapter in extracted.chapters:
        chapter_id = str(uuid.uuid4())
        sort_counter[0] += 1
        
        await db.structuralunit.create(
            data={
                "id": chapter_id,
                "legal_doc_id": doc_id,
                "parent_unit_id": None,
                "unit_type": "chapter",
                "unit_number": str(chapter.chapter_number),
                "title": chapter.chapter_name,
                "full_text": None,
                "summary": chapter.summary,
                "sort_order": sort_counter[0],
                "status": "active",
                "confidence_score": 1.0,
            }
        )
        
        await process_sections(chapter.sections, chapter_id)
        
    logger.info(f"[Pass 1] Created LegalDocument {doc_id} with {sort_counter[0]} structural units.")
    return doc_id
