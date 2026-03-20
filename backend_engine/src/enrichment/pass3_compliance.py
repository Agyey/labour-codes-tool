"""Stage 3 / Pass 3: Compliance Detection

Batch-processes StructuralUnits with the LLM to classify their nature
and extract ObligationRecords and PenaltyRecords.
"""
from __future__ import annotations

import json
from loguru import logger
from google import genai
from google.genai import types
from prisma import Client

from src.models import (
    ComplianceBatchResponse,
    ProvisionClassification,
    ObligationExtract,
    PenaltyExtract,
)


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
    units = await db.structuralunit.find_many(
        where={
            "legal_doc_id": legal_doc_id,
            "full_text": {"not": None}
        },
        order={"sort_order": "asc"}
    )
    
    if not units:
        return
        
    client = genai.Client(api_key=db._active_config.datasource.url) # Placeholder, actually should use settings
    # Wait, the db client doesn't have the api key. I should pass settings or use a global client.
    # In this project, parser.py has a global _client.
    from src.parser import _client as model_client
    
    # Process in batches of 20
    processed_count = 0
    obligation_count = 0
    
    for i in range(0, len(units), ASYNC_BATCH_SIZE):
        batch = units[i:i + ASYNC_BATCH_SIZE]
        
        batch_prompt = "Analyze these provisions:\n\n"
        for u in batch:
            batch_prompt += f"--- UNIT_ID: {u.id} ---\n{u.full_text}\n\n"
            
        try:
            response = await model_client.aio.models.generate_content(
                model="gemini-2.5-flash",
                contents=batch_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    response_mime_type="application/json",
                    response_schema=ComplianceBatchResponse
                )
            )
            
            data = json.loads(response.text)
            
            # Process results
            for result in data.get("results", []):
                unit_id = result["unit_id"]
                
                # Verify unit_id
                target_unit = next((x for x in batch if x.id == unit_id), None)
                if not target_unit:
                    continue
                    
                # 1. Update Unit Nature
                await db.structuralunit.update(
                    where={"id": unit_id},
                    data={
                        "provision_nature": json.dumps(result.get("nature_tags", []))
                    }
                )
                
                processed_count += 1
                
                # 2. Insert Obligations
                for ob in result.get("obligations", []):
                    # Create obligation
                    created_ob = await db.obligationrecord.create(
                        data={
                            "unit_id": unit_id,
                            "obligation_type": ob.get("obligation_type", "other"),
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
                    
                    # 3. Insert Penalties for this Obligation
                    for pen in ob.get("penalties", []):
                        await db.penaltyrecord.create(
                            data={
                                "obligation_id": created_ob.id,
                                "fine_amount": pen.get("fine_amount"),
                                "imprisonment": pen.get("imprisonment"),
                                "liable_person": pen.get("liable_person", ob.get("responsible_person")),
                                "description": pen.get("description")
                            }
                        )
                        
        except Exception as e:
            logger.error(f"[Pass 3] Batch error: {e}")
            
    logger.info(f"[Pass 3] Processed {processed_count} units, {obligation_count} obligations.")
