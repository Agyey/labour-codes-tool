"""Stage 3 / Pass 5: Applicability Mapping

Batch-processes StructuralUnits with the LLM to extract applicability conditions:
Entities, thresholds (e.g. net worth, employee count), and exemptions.
"""
from __future__ import annotations

import json
from loguru import logger
from google.genai import types
from prisma import Client

from src.models import (
    ApplicabilityBatchResponse,
)
from src.parser import _client as model_client

ASYNC_BATCH_SIZE = 20

SYSTEM_PROMPT = """You are an expert legal AI.
Given a batch of legal provisions (Structural Units), analyze each to determine WHO and WHAT it applies to.
Extract any applicability conditions:
1. entity_types: specific types of companies/persons (e.g., "Listed Company", "employer", "factory").
2. thresholds: any numerical thresholds triggering the provision (e.g., "employee_count_above": 20, "net_worth_above": 5000000000).
3. exemptions: who is explicitly excluded (e.g., "Private Company").

Output JSON tracking the exact unit_id provided.
If a provision is general with no specific applicability language, return empty lists.
"""

async def run_pass5(db: Client, legal_doc_id: str) -> None:
    """Classifies applicability conditions using Gemini."""
    logger.info(f"[Pass 5] Applicability extraction for doc {legal_doc_id}")
    
    # Usually only section 1 or specific applicability sections matter, but
    # scanning all for safety if they have substantive text
    from typing import Any, cast
    units = await db.structuralunit.find_many(
        where=cast(Any, {
            "legal_doc_id": legal_doc_id,
            "full_text": {"not": None}
        }),
        order={"sort_order": "asc"}
    )
    
    if not units:
        return
        
    processed_count = 0
    condition_count = 0
    
    for i in range(0, len(units), ASYNC_BATCH_SIZE):
        batch = units[i:i + ASYNC_BATCH_SIZE]
        
        batch_prompt = "Analyze these provisions for Applicability:\n\n"
        for u in batch:
            batch_prompt += f"--- UNIT_ID: {u.id} ---\n{u.full_text}\n\n"
            
        try:
            response = await model_client.aio.models.generate_content(
                model="gemini-2.0-flash",
                contents=batch_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    response_mime_type="application/json",
                    response_schema=ApplicabilityBatchResponse
                )
            )
            
            if not response.text:
                continue

            data = json.loads(response.text)
            
            # Process results
            for result in data.get("results", []):
                unit_id = result["unit_id"]
                
                # Check if there are actually conditions
                entities = result.get("entity_types", [])
                thresholds = result.get("thresholds", {})
                exemptions = result.get("exemptions", [])
                
                if not entities and not thresholds and not exemptions:
                    continue
                    
                await db.applicabilitycondition.create(
                    data={
                        "unit_id": unit_id,
                        "condition_type": "entity_type" if entities else "threshold",
                        "entity_types": json.dumps(entities),
                        "thresholds": json.dumps(thresholds),
                        "exemptions": json.dumps(exemptions),
                        "description": result.get("description")
                    }
                )
                
                condition_count += 1
                processed_count += 1
                        
        except Exception as e:
            logger.error(f"[Pass 5] Batch error: {e}")
            
    logger.info(f"[Pass 5] Extracted {condition_count} applicability conditions.")
