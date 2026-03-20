"""Stage 3 / Pass 6: Authority & Remedy Mapping.

Detect authorities mentioned in text and build the appeal chains (RightsAndRemedy).
"""
from __future__ import annotations

import re
from loguru import logger
from prisma import Client


# Simple rule-based extraction for known authorities
KNOWN_AUTHORITIES = {
    "Registrar": "regulatory",
    "Registrar of Companies": "regulatory",
    "National Company Law Tribunal": "judicial",
    "NCLT": "judicial",
    "National Company Law Appellate Tribunal": "appellate",
    "NCLAT": "appellate",
    "Securities and Exchange Board of India": "regulatory",
    "SEBI": "regulatory",
    "Reserve Bank of India": "regulatory",
    "RBI": "regulatory",
    "High Court": "judicial",
    "Supreme Court": "judicial",
    "Central Government": "ministry",
    "State Government": "ministry",
    "Inspector": "regulatory",
    "Assessing Officer": "regulatory",
    "Appellate Tribunal": "appellate",
}

async def run_pass6(db: Client, legal_doc_id: str) -> None:
    """Extracts authorities and remedies by scanning text for Keywords."""
    logger.info(f"[Pass 6] Authority extraction for doc {legal_doc_id}")
    
    from typing import Any, cast
    units = await db.structuralunit.find_many(
        where=cast(Any, {
            "legal_doc_id": legal_doc_id,
            "full_text": {"not": None}
        })
    )
    
    if not units:
        return
        
    auth_links = 0
    remedy_count = 0
    
    for unit in units:
        text = unit.full_text or ""
        if not text:
            continue
            
        # 1. Look for authorities
        for auth_name, auth_type in KNOWN_AUTHORITIES.items():
            if re.search(r'\b' + re.escape(auth_name) + r'\b', text, re.IGNORECASE):
                # Ensure authority exists in DB
                db_auth = await db.legalauthority.upsert(
                    where={"name": auth_name},
                    data={
                        "create": {
                            "name": auth_name,
                            "authority_type": auth_type,
                            "jurisdiction": "Central"  # Simplified default
                        },
                        "update": {}
                    }
                )
                
                # Determine role
                role = "adjudicating"
                if "appeal" in text.lower():
                    role = "appellate"
                elif "file" in text.lower() or "submit" in text.lower():
                    role = "filing_recipient"
                elif "license" in text.lower() or "register" in text.lower():
                    role = "licensing"
                    
                # Link authority to unit
                try:
                    await db.authoritylink.create(
                        data={
                            "authority_id": db_auth.id,
                            "related_unit_id": unit.id,
                            "role": role
                        }
                    )
                    auth_links += 1
                except Exception:
                    # Ignore unique constraint violations
                    pass
                    
        # 2. Look for explicit appeal/remedy language
        # Example: "appeal to the Tribunal within sixty days"
        appeal_match = re.search(r'appeal\s+to\s+(?:the\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+within\s+(\w+\s+(?:days|months|years))', text)
        if appeal_match:
            forum_name = appeal_match.group(1).strip()
            limitation = appeal_match.group(2).strip()
            
            await db.rightsandremedy.create(
                data={
                    "unit_id": unit.id,
                    "right_holder": "aggrieved_person",  # Default if not extracted
                    "summary": f"Appeal against decision to {forum_name}",
                    "forum_level": "1",
                    "forum_name": forum_name,
                    "limitation_period": limitation
                }
            )
            remedy_count += 1
            
    logger.info(f"[Pass 6] Created {auth_links} authority links and {remedy_count} remedies.")
