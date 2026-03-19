"""Document Parser — Gemini-powered extraction + Neo4j graph builder.

Flow:
  1. Extract raw text from PDF (PyMuPDF)
  2. Send to Gemini 2.5 Pro with strict Pydantic schema
  3. Build vectorless RAG tree in Neo4j
  4. Generate suggestions (NOT auto-inject)
  5. Record audit trail
"""

import json

import typing
import prisma
import fitz
from loguru import logger
from google import genai
from google.genai import types

from src.settings import settings
from src.models import (
    ExtractedLegislation,
    SuggestionType,
)
from src.database import db
from src.graph_service import create_document_tree
from src.audit_chain import record_audit

# Initialize Gemini Client
_client = genai.Client(api_key=settings.gemini_api_key.get_secret_value())

SYSTEM_INSTRUCTION = """You are an expert Indian legal document parser with deep knowledge of labour codes, acts, and rules.

Your task is to extract the COMPLETE hierarchical structure of the provided legal document.

Rules:
1. Extract EVERY chapter, section, and sub-section. Do not skip any.
2. For each node, provide a concise summary suitable for hierarchical RAG traversal.
3. Identify ALL compliance obligations (things an employer/organization MUST do).
4. Extract ALL penalty clauses with fine amounts and imprisonment terms.
5. Extract ALL legal definitions.
6. Note any acts that this legislation repeals or amends.
7. Preserve exact section numbers and legal citations.
8. The summary at each level should be self-contained enough for an LLM to decide whether to drill deeper.
9. CRITICAL: Identify major differences, additions, or deletions compared to previous laws (if mentioned or deducible). Map these to 'key_changes'.
"""


def extract_text_from_pdf(file_path: str) -> tuple[str, int]:
    """Extract text and page count from a PDF file."""
    text_content = ""
    page_count = 0
    with fitz.open(file_path) as doc:
        page_count = len(doc)
        for page in doc:
            text_content += page.get_text() + "\n"
    return text_content, page_count


async def analyze_document_stream(
    document_id: str, raw_text: str
) -> typing.AsyncGenerator[str | ExtractedLegislation, None]:
    """Send document text to Gemini and stream thoughts, then structured extraction."""
    logger.info(f"Analyzing document {document_id}: {len(raw_text)} characters")

    schema_json = json.dumps(ExtractedLegislation.model_json_schema(), indent=2)
    prompt = (
        "First, think step-by-step about this document to prepare for extraction. Write your detailed analysis inside <think> and </think> tags.\n"
        "Break down your thoughts logically. Identify chapters, compliance items, definitions, and penalties. Keep your thinking extremely concise to save tokens.\n\n"
        'CRITICAL: To prevent exceeding output limits, set the `full_text` field of EVERY section and sub_section to an empty string "" in the JSON. We only need the `summary`.\n\n'
        f"REQUIRED JSON SCHEMA:\n```json\n{schema_json}\n```\n\n"
        "After closing the </think> tag, output the precise JSON matching the required schema enclosed in ```json and ``` tags.\n\n"
        f"Document text:\n{raw_text}"
    )

    response_stream = await _client.aio.models.generate_content_stream(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            temperature=0.2,
        ),
    )

    full_text = ""
    thought_buffer = ""

    import re

    try:
        async for chunk in response_stream:
            text = chunk.text or ""
            full_text += text

            # If we haven't reached </think> yet, we process the stream as thoughts
            if "</think>" not in full_text:
                if "<think>" in full_text:
                    # Strip out <think> and accumulate
                    clean_text = text.replace("<think>", "").replace("\n", " ")
                    thought_buffer += clean_text

                    # Yield complete sentences to the UI
                    while ". " in thought_buffer:
                        split_idx = thought_buffer.index(". ") + 2
                        sentence = thought_buffer[:split_idx].strip()
                        thought_buffer = thought_buffer[split_idx:]
                        if sentence:
                            yield sentence
            else:
                # We have reached </think>, we might have a final thought to flush
                if thought_buffer.strip():
                    yield thought_buffer.strip() + "..."
                    thought_buffer = ""

    except Exception as e:
        logger.error(f"Stream error: {e}")
        raise e

    # Extract JSON out of the full result
    json_match = re.search(r"```json\s*(.*?)\s*```", full_text, re.DOTALL)
    if not json_match:
        json_match = re.search(r"(\{.*\})", full_text, re.DOTALL)

    if not json_match:
        raise ValueError("Failed to extract JSON from Gemini response.")

    json_str = json_match.group(1)
    try:
        import json_repair
        decoded = json_repair.loads(json_str)
        extracted = ExtractedLegislation.model_validate(decoded)
    except Exception as parse_e:
        logger.warning(f"json_repair failed, falling back to raw json parsing: {parse_e}")
        extracted = ExtractedLegislation.model_validate_json(json_str)

    logger.info(
        f"Extraction complete: {extracted.name} — "
        f"{len(extracted.chapters)} chapters, "
        f"{len(extracted.definitions)} definitions, "
        f"{len(extracted.key_changes)} key changes, "
        f"{len(extracted.penalties)} penalties"
    )
    yield extracted


async def build_graph_and_suggestions(
    document_id: str, extracted: ExtractedLegislation
) -> dict[str, typing.Any]:
    """Build Neo4j tree and generate approval-pending suggestions."""
    # 1. Build the vectorless RAG tree in Neo4j
    graph_stats = await create_document_tree(document_id, extracted.model_dump())

    # 2. Store the analysis in Postgres
    analysis = await db.documentanalysis.create(
        data={
            "document_id": document_id,
            "summary": extracted.summary,
            "document_type": extracted.document_type,
            "structured_data": json.loads(extracted.model_dump_json()),
            "graph_nodes": graph_stats["nodes"],
            "graph_relationships": graph_stats["relationships"],
        }
    )

    # 3. Generate suggestions (AI suggests, human validates)
    suggestion_count: int = 0

    # Suggestion: Create legislation entry
    await db.documentsuggestion.create(
        data={
            "document_id": document_id,
            "analysis_id": analysis.id,
            "type": SuggestionType.CREATE_LEGISLATION,
            "target_module": "knowledge_base",
            "suggested_data": prisma.Json(
                {
                    "name": extracted.name,
                    "short_name": extracted.short_name,
                    "year": extracted.year,
                    "type": extracted.document_type,
                }
            ),
            "confidence": 0.95,
            "status": "pending",
        }
    )
    suggestion_count += 1

    # Suggestion: Key differences / amendments
    for change in extracted.key_changes:
        await db.documentsuggestion.create(
            data={
                "document_id": document_id,
                "analysis_id": analysis.id,
                "type": SuggestionType.UPDATE_PROVISION,
                "target_module": "knowledge_base",
                "suggested_data": prisma.Json(
                    {
                        "difference_type": change.difference_type,
                        "description": change.description,
                        "previous_reference": change.previous_reference,
                        "new_reference": change.new_reference,
                    }
                ),
                "confidence": 0.88,
                "status": "pending",
            }
        )
        suggestion_count += 1

    # Suggestion: Create provisions for each section
    for chapter in extracted.chapters:
        for section in chapter.sections:
            sub_sections_data = [
                {
                    "number": sub.sub_section_number,
                    "text": sub.full_text,
                    "summary": sub.summary,
                }
                for sub in section.sub_sections
            ]
            await db.documentsuggestion.create(
                data={
                    "document_id": document_id,
                    "analysis_id": analysis.id,
                    "type": SuggestionType.CREATE_PROVISION,
                    "target_module": "knowledge_base",
                    "suggested_data": prisma.Json(
                        {
                            "chapter": chapter.chapter_number,
                            "chapter_name": chapter.chapter_name,
                            "section": section.section_number,
                            "title": section.title,
                            "summary": section.summary,
                            "full_text": section.full_text,
                            "sub_sections": sub_sections_data,
                        }
                    ),
                    "confidence": 0.85,
                    "status": "pending",
                }
            )
            suggestion_count += 1

            # Suggestion: Compliance items from this section
            all_tasks = list(section.compliance_tasks)
            for sub in section.sub_sections:
                all_tasks.extend(sub.compliance_tasks)

            for task in all_tasks:
                await db.documentsuggestion.create(
                    data={
                        "document_id": document_id,
                        "analysis_id": analysis.id,
                        "type": SuggestionType.CREATE_COMPLIANCE_ITEM,
                        "target_module": "compliance_tracker",
                        "suggested_data": prisma.Json(
                            {
                                "section": section.section_number,
                                "task": task.task,
                                "due_logic": task.due_logic,
                                "severity": task.severity,
                            }
                        ),
                        "confidence": 0.80,
                        "status": "pending",
                    }
                )
                suggestion_count += 1

            # Suggestion: Penalties
            for penalty in section.penalties:
                await db.documentsuggestion.create(
                    data={
                        "document_id": document_id,
                        "analysis_id": analysis.id,
                        "type": SuggestionType.CREATE_PENALTY,
                        "target_module": "knowledge_base",
                        "suggested_data": prisma.Json(
                            {
                                "section": section.section_number,
                                "description": penalty.description,
                                "fine_amount": penalty.fine_amount,
                                "imprisonment": penalty.imprisonment,
                            }
                        ),
                        "confidence": 0.90,
                        "status": "pending",
                    }
                )
                suggestion_count += 1

    # Suggestion: Flag repealed acts
    for act_name in extracted.repealed_acts:
        await db.documentsuggestion.create(
            data={
                "document_id": document_id,
                "analysis_id": analysis.id,
                "type": SuggestionType.FLAG_REPEAL,
                "target_module": "knowledge_base",
                "suggested_data": prisma.Json({"repealed_act_name": act_name}),
                "confidence": 0.92,
                "status": "pending",
            }
        )
        suggestion_count += 1

    # Suggestion: Create definitions
    for defn in extracted.definitions:
        await db.documentsuggestion.create(
            data={
                "document_id": document_id,
                "analysis_id": analysis.id,
                "type": SuggestionType.CREATE_DEFINITION,
                "target_module": "knowledge_base",
                "suggested_data": prisma.Json(
                    {
                        "term": defn.term,
                        "definition": defn.definition,
                        "section_ref": defn.section_ref,
                    }
                ),
                "confidence": 0.90,
                "status": "pending",
            }
        )
        suggestion_count += 1

    # 4. Record in audit chain
    await record_audit(
        action="document_analyzed",
        entity_type="document",
        entity_id=document_id,
        data={
            "name": extracted.name,
            "chapters": len(extracted.chapters),
            "suggestions_generated": suggestion_count,
            "graph_nodes": graph_stats["nodes"],
        },
    )

    logger.info(f"Generated {suggestion_count} suggestions for document {document_id}")

    return {
        "analysis_id": analysis.id,
        "graph_stats": graph_stats,
        "suggestion_count": suggestion_count,
    }
