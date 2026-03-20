"""Stage 3 / Pass 4: Cross-Reference Extraction.

Regex-based scan of all full_text fields for intra-document and
inter-document references.
"""
from __future__ import annotations

import re
from loguru import logger
from prisma import Client


# Common reference patterns
INTRA_DOC_PATTERN = re.compile(
    r'\b(?:section|sub-section|clause|proviso|schedule)\s+(\d+[A-Z]*|\([a-z\d]+\))\b',
    re.IGNORECASE
)

INTER_DOC_PATTERN = re.compile(
    r'\b(?:under|in|of)\s+(?:the\s+)?([A-Z][a-zA-Z\s]+(?:Act|Code|Rules?|Regulations?),\s+\d{4})',
    re.IGNORECASE
)

# Reference sub-types
SUBTYPES = {
    re.compile(r'\bnotwithstanding anything\b', re.IGNORECASE): "non_obstante",
    re.compile(r'\bsubject to\b', re.IGNORECASE): "subject_to",
    re.compile(r'\bread with\b', re.IGNORECASE): "read_with",
    re.compile(r'\bwithout prejudice to\b', re.IGNORECASE): "general",
}

async def run_pass4(db: Client, legal_doc_id: str) -> None:
    """Extracts references and records CrossReference objects."""
    logger.info(f"[Pass 4] Extracting cross-references for doc {legal_doc_id}")
    
    from typing import Any, cast
    units = await db.structuralunit.find_many(
        where=cast(Any, {
            "legal_doc_id": legal_doc_id,
            "full_text": {"not": None}
        })
    )
    
    if not units:
        return
        
    ref_count = 0
    resolved_count = 0

    for unit in units:
        text = unit.full_text or ""
        if not text:
            continue
            
        subtype = _detect_subtype(text)
            
        # 1. Intra-document refs ("section 45", "sub-section (2)")
        for match in INTRA_DOC_PATTERN.finditer(text):
            ref_typeword = text[match.start():match.span()[0] + 15].split()[0].lower() # hacky way to get word
            ref_val = match.group(1)
            raw_text = match.group(0)
            
            # Simple heuristic target resolution: search for a unit in the same doc with that number
            # Real resolution is more complex (finding the correct parent context)
            target = await db.structuralunit.find_first(where={
                "legal_doc_id": legal_doc_id,
                "unit_number": ref_val,
                "unit_type": ref_typeword
            })
            
            target_doc_id = target.legal_doc_id if target else None
            target_unit_id = target.id if target else None
            
            await db.crossreference.create(data={
                "source_doc_id": legal_doc_id,
                "source_unit_id": unit.id,
                "reference_type": "intra_doc",
                "reference_subtype": subtype,
                "ref_type": "section",  # Added field
                "raw_text": raw_text,
                "is_resolved": target is not None,
                "target_doc_id": target_doc_id,
                "target_unit_id": target_unit_id,
                "target_section_ref": f"{ref_typeword} {ref_val}" if target is None else None
            })
            ref_count += 1
            if target:
                resolved_count += 1
            
        # 2. Inter-document refs ("the Companies Act, 2013")
        for match in INTER_DOC_PATTERN.finditer(text):
            target_act_name = match.group(1).strip()
            raw_text = match.group(0)
            
            if "this Act" in target_act_name:
                continue
                
            # Attempt to find the target document in our DB
            target_doc = await db.legaldocument.find_first(where={
                "title": {"contains": target_act_name.split(",")[0], "mode": "insensitive"},
                "status": "active"
            })
            
            target_doc_id_val = target_doc.id if target_doc else None

            await db.crossreference.create(data={
                "source_doc_id": legal_doc_id,
                "source_unit_id": unit.id,
                "reference_type": "inter_doc",
                "reference_subtype": subtype,
                "ref_type": "act",  # Added field
                "raw_text": raw_text,
                "is_resolved": target_doc is not None,
                "target_doc_id": target_doc_id_val,
                "target_act_name": target_act_name if target_doc is None else None
            })
            ref_count += 1
            if target_doc:
                resolved_count += 1
            
    logger.info(f"[Pass 4] Found {ref_count} references. Resolved {resolved_count}.")


def _detect_subtype(text: str) -> str:
    for regex, subtype in SUBTYPES.items():
        if regex.search(text):
            return subtype
    return "general"
