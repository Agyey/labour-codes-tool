import fitz  # PyMuPDF
import json
from loguru import logger
from openai import AsyncOpenAI
from src.settings import settings
from src.models import ExtractedLegislation
from src.database import db

# Initialize OpenAI Client
client = AsyncOpenAI(api_key=settings.openai_api_key)

async def process_pdf(file_path: str, framework_id: str) -> ExtractedLegislation:
    logger.info(f"Starting PDF extraction for {file_path}")
    text_content = ""
    with fitz.open(file_path) as doc:
        for page in doc:
            text_content += page.get_text() + "\n"

    logger.info(f"Extracted {len(text_content)} characters. Contacting LLM for structured extraction.")

    # Using OpenAI's structured outputs with Pydantic
    completion = await client.beta.chat.completions.parse(
        model="gpt-4o",  # or gpt-4o-mini depending on cost/performance
        messages=[
            {
                "role": "system",
                "content": "You are an expert Indian legal document parser. Extract the full hierarchy, including all actionable compliance tasks."
            },
            {
                "role": "user",
                "content": text_content
            }
        ],
        response_format=ExtractedLegislation,
    )

    extracted_data = completion.choices[0].message.parsed
    if not extracted_data:
        raise ValueError("Failed to extract structured data from PDF.")

    logger.info(f"Successfully extracted: {extracted_data.name} with {len(extracted_data.chapters)} chapters.")

    # Save to Database using Prisma (Vectorless RAG Hierarchy)
    legislation = await db.legislation.create(
        data={
            "name": extracted_data.name,
            "short_name": extracted_data.short_name,
            "year": extracted_data.year,
            "framework_id": framework_id,
            "type": "act",
        }
    )

    for chapter in extracted_data.chapters:
        for section in chapter.sections:
            # Consolidate all section compliance constraints
            all_tasks = section.compliance_tasks
            
            section_fulltext = section.full_text
            
            # Sub-sections
            sub_sections_json = []
            for sub in section.sub_sections:
                sub_data = {
                    "number": sub.sub_section_number,
                    "text": sub.full_text,
                    "summary": sub.summary
                }
                sub_sections_json.append(sub_data)
                all_tasks.extend(sub.compliance_tasks)

            # Insert Provision
            provision = await db.provision.create(
                data={
                    "legislation_id": legislation.id,
                    "code": extracted_data.short_name,
                    "chapter": chapter.chapter_number,
                    "chapter_name": chapter.chapter_name,
                    "section": section.section_number,
                    "sub_section": "1", # Default fallback if missing
                    "title": section.title,
                    "summary": section.summary,
                    "full_text": section_fulltext,
                    "sub_sections": json.dumps(sub_sections_json),
                    "impact": "Pending Review",
                    "rule_authority": "Appropriate Government",
                    "status": "active",
                    "provision_type": "section"
                }
            )

            # Insert Compliance Items
            for ext_task in all_tasks:
                await db.complianceitem.create(
                    data={
                        "provision_id": provision.id,
                        "task": f"{ext_task.task} ({ext_task.due_logic})",
                        "status": "Not Started"
                    }
                )

    logger.info(f"Finished saving legislation and provisions for {extracted_data.name}.")
    return extracted_data
