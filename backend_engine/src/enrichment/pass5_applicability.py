"""Stage 3 / Pass 5: Applicability Mapping

Batch-processes StructuralUnits with the LLM to extract applicability conditions:
Entities, thresholds (e.g. net worth, employee count), and exemptions.
"""
from __future__ import annotations

import json
from typing import Any, cast
from loguru import logger
from google.genai import types

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

async def run_pass5(db: Any, legal_doc_id: str) -> None:
    """Classifies applicability conditions using Gemini."""
    logger.info(f"[Pass 5] Applicability extraction for doc {legal_doc_id}")
    
    # Usually only section 1 or specific applicability sections matter, but
    # scanning all for safety if they have substantive text
    # Usually only section 1 or specific applicability sections matter, but
    # scanning all for safety if they have substantive text
    units = cast(list[Any], await db.structuralunit.find_many(
        where={
            "legal_doc_id": legal_doc_id,
            "unit_type": "section"
        },
        order={"sort_order": "asc"}
    ))
    
    if not units:
        return
        
    processed_count = 0
    condition_count = 0
    
    for i in range(0, len(units), ASYNC_BATCH_SIZE):
        batch: list[Any] = units[i:i + ASYNC_BATCH_SIZE]
        
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

            # Use the model's structure if possible, or parse safely
            try:
                # If the SDK supports automatic parsing to the schema:
                batch_data = ApplicabilityBatchResponse.model_validate_json(response.text)
                results: list[Any] = batch_data.results
            except Exception:
                # Fallback to manual parse if schema validation on response text fails
                data: dict[str, Any] = json.loads(response.text)
                results = cast(list[Any], data.get("results", []))
            
            # Process results
            for result in results:
                # Handle both dict and Pydantic model
                if hasattr(result, "model_dump"):
                    res_dict = result.model_dump()
                else:
                    res_dict = cast(dict[str, Any], result)
                    
                unit_id = res_dict.get("unit_id")
                if not unit_id:
                    continue
                
                # Check if there are actually conditions
                entities = res_dict.get("entity_types", [])
                thresholds = res_dict.get("thresholds", {})
                exemptions = res_dict.get("exemptions", [])
                
                if not entities and not thresholds and not exemptions:
                    continue
                    
                await db.applicabilitycondition.create(
                    data={
                        "unit_id": str(unit_id),
                        "condition_type": "entity_type" if entities else "threshold",
                        "entity_types": json.dumps(entities),
                        "thresholds": json.dumps(thresholds),
                        "exemptions": json.dumps(exemptions),
                        "description": res_dict.get("description")
                    }
                )
                
                condition_count += 1
                processed_count += 1
                        
        except Exception as e:
            logger.error(f"[Pass 5] Batch error: {e}")
            
    logger.info(f"[Pass 5] Extracted {condition_count} applicability conditions.")
