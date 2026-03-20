"""Stage 3 / Pass 2: Definitions Extraction

Finds the definitions section (usually Section 2). 
Extracts defined terms, their scopes, and inserts LegalDefinition records.
"""
import re
from loguru import logger
from prisma import Client


async def run_pass2(db: Client, legal_doc_id: str) -> None:
    """Extracts defined terms and populates LegalDefinition.
    
    Operates directly on the database state created by Pass 1.
    """
    logger.info(f"[Pass 2] Extracting definitions for doc {legal_doc_id}")
    
    # 1. Look for the typical definitions section (usually unit_number "2")
    def_sections = await db.structuralunit.find_many(
        where={
            "legal_doc_id": legal_doc_id,
            "unit_type": "section",
            "OR": [
                {"unit_number": "2"},
                {"title": {"contains": "Definitions", "mode": "insensitive"}}
            ]
        },
        include={"child_units": True}
    )
    
    if not def_sections:
        logger.info(f"[Pass 2] No distinct definitions section found.")
        return
        
    def_count = 0
    for section in def_sections:
        # Check sub-units (clauses)
        units_to_check = section.child_units if section.child_units else [section]
        
        for unit in units_to_check:
            text = unit.full_text or ""
            if not text:
                continue
                
            # Regex to find: (a) "company" means... or (b) "employee" includes...
            # Looks for quotes followed by means/includes
            match = re.search(r'["\']([^"\']+)["\']\s+(means|includes|means and includes)\s+(.+)', text, re.IGNORECASE | re.DOTALL)
            
            if match:
                term = match.group(1).strip()
                def_type = match.group(2).strip().lower()
                definition_text = match.group(3).strip()
                
                await db.legaldefinition.create(
                    data={
                        "legal_doc_id": legal_doc_id,
                        "unit_id": unit.id,
                        "term": term,
                        "definition_text": definition_text,
                        "definition_type": def_type.replace(" ", "_"),
                        "section_ref": f"Section {section.unit_number}({unit.unit_number})" if unit.id != section.id else f"Section {section.unit_number}"
                    }
                )
                def_count += 1
                
    logger.info(f"[Pass 2] Extracted {def_count} definitions.")
