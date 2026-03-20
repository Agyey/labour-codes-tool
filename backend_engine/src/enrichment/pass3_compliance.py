"""Stage 3 / Pass 3: Compliance Detection

Batch-processes StructuralUnits with the LLM to classify their nature
and extract ObligationRecords and PenaltyRecords.
"""
from __future__ import annotations

import json
from typing import Any, cast
from loguru import logger
from google.genai import types
from prisma import Client # type: ignore[attr-defined]

from src.models import (
    ComplianceBatchResponse,
)
from src.parser import _client as model_client


ASYNC_BATCH_SIZE = 20

SYSTEM_PROMPT = """You are an expert legal AI.
Given a batch of legal provisions (Structural Units), analyze each to:
1. Determine its nature/purpose (e.g. Substantive Obligation, Penal, Enabling, Definitions).
2. Extract any compliance obligations (filing, registration, disclosure, etc.).
3. Extract any associated penalties.

Output JSON tracking the exact unit_id provided.
"""

async def run_pass3(db: Client, legal_doc_id: str) -> None:
    """Classifies provisions and extracts obligations using Gemini."""
    logger.info(f"[Pass 3] Compliance extraction for doc {legal_doc_id}")
    
    # Fetch units that haven't been processed yet
    # Fetch units that haven't been processed yet
    units = cast(list[Any], await db.structuralunit.find_many(
        where={
            "legal_doc_id": legal_doc_id,
            "unit_type": "section"
        }
    ))
    
    if not units:
        return
        
    # Process in batches of 20
    processed_count = 0
    obligation_count = 0
    
    for i in range(0, len(units), ASYNC_BATCH_SIZE):
        batch: list[Any] = units[i:i + ASYNC_BATCH_SIZE]
        
        batch_prompt = "Analyze these provisions:\n\n"
        for u in batch:
            batch_prompt += f"--- UNIT_ID: {u.id} ---\n{u.full_text}\n\n"
            
        try:
            response = await model_client.aio.models.generate_content(
                model="gemini-2.0-flash",
                contents=batch_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    response_mime_type="application/json",
                    response_schema=ComplianceBatchResponse
                )
            )
            
            if not response.text:
                continue
                
            # Use the model's structure if possible, or parse safely
            try:
                # If the SDK supports automatic parsing to the schema:
                batch_data = ComplianceBatchResponse.model_validate_json(response.text)
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
                
                # 1. Update Unit Nature
                nature_tags = res_dict.get("nature_tags", [])
                await db.structuralunit.update(
                    where={"id": str(unit_id)},
                    data={
                        "provision_nature": json.dumps(nature_tags)
                    }
                )
                
                processed_count += 1
                
                # 2. Insert Obligations
                for ob in res_dict.get("obligations", []):
                    created_ob = await db.obligationrecord.create(
                        data={
                            "unit_id": str(unit_id),
                            "obligation_type": ob.get("obligation_type", "compliance"),
                            "compliance_category": ob.get("compliance_category", "ongoing"),
                            "title": ob.get("title", "Untitled Obligation"),
                            "description": ob.get("description"),
                            "trigger_event": ob.get("trigger_event"),
                            "due_date_rule": ob.get("due_date_rule"),
                            "responsible_person": ob.get("responsible_person"),
                            "prescribed_form": ob.get("prescribed_form"),
                            "prescribed_authority": ob.get("prescribed_authority"),
                            "status": "active"
                        }
                    )
                    
                    obligation_count += 1
                    
                    # 3. Insert Penalties
                    for pen in ob.get("penalties", []):
                        await db.penaltyrecord.create(
                            data={
                                "unit_id": str(unit_id),
                                "obligation_id": created_ob.id,
                                "fine_amount": str(pen.get("fine_amount", "")) if pen.get("fine_amount") else None,
                                "imprisonment": pen.get("imprisonment"),
                                "liable_person": pen.get("liable_person", ob.get("responsible_person")),
                                "description": pen.get("description")
                            }
                        )
                        
        except Exception as e:
            logger.error(f"[Pass 3] Batch error: {e}")
            
    logger.info(f"[Pass 3] Processed {processed_count} units, {obligation_count} obligations.")
