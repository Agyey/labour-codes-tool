"""Pydantic V2 models for the Document Hub.

Strict typing for:
  - Gemini extraction schemas (structured output)
  - API request/response schemas
  - Suggestion workflow schemas
"""
from __future__ import annotations

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, Field


# ──────────────────────────────────────────────
# Enums
# ──────────────────────────────────────────────

class DocumentStatus(StrEnum):
    UPLOADED = "uploaded"
    ANALYZING = "analyzing"
    ANALYZED = "analyzed"
    ERROR = "error"


class SuggestionType(StrEnum):
    CREATE_LEGISLATION = "create_legislation"
    CREATE_PROVISION = "create_provision"
    CREATE_COMPLIANCE_ITEM = "create_compliance_item"
    CREATE_PENALTY = "create_penalty"
    CREATE_DEFINITION = "create_definition"
    FLAG_REPEAL = "flag_repeal"
    UPDATE_PROVISION = "update_provision"


class SuggestionStatus(StrEnum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    EDITED = "edited"


# ──────────────────────────────────────────────
# Gemini Extraction Schemas (Structured Output)
# ──────────────────────────────────────────────

class ExtractedComplianceTask(BaseModel):
    task: str = Field(description="The compliance obligation or task")
    due_logic: str = Field(description="When this task is due (e.g. 'Within 30 days of registration')")
    severity: str = Field(default="medium", description="low | medium | high | critical")


class ExtractedPenalty(BaseModel):
    description: str = Field(description="Description of the penalty clause")
    fine_amount: str = Field(default="", description="Fine amount if specified")
    imprisonment: str = Field(default="", description="Imprisonment duration if specified")
    applicable_section: str = Field(default="", description="Section this penalty applies to")


class ExtractedDefinition(BaseModel):
    term: str = Field(description="The legal term being defined")
    definition: str = Field(description="The full legal definition")
    section_ref: str = Field(default="", description="Section reference for this definition")


class ExtractedSubSection(BaseModel):
    sub_section_number: str = Field(description="Number/letter of the sub-section")
    full_text: str = Field(description="Exact full text of the sub-section")
    summary: str = Field(description="Concise summary for vectorless RAG traversal")
    compliance_tasks: list[ExtractedComplianceTask] = Field(default_factory=list)


class ExtractedSection(BaseModel):
    section_number: str = Field(description="Number of the section (e.g. '21')")
    title: str = Field(description="Title or heading of the section")
    full_text: str = Field(description="Exact full text of the section")
    summary: str = Field(description="Concise summary for vectorless RAG traversal")
    sub_sections: list[ExtractedSubSection] = Field(default_factory=list)
    compliance_tasks: list[ExtractedComplianceTask] = Field(default_factory=list)
    penalties: list[ExtractedPenalty] = Field(default_factory=list)


class ExtractedChapter(BaseModel):
    chapter_number: str = Field(description="Number of the chapter (e.g. 'III')")
    chapter_name: str = Field(description="Name or title of the chapter")
    summary: str = Field(description="Concise summary of the chapter for vectorless RAG traversal")
    sections: list[ExtractedSection] = Field(default_factory=list)


class ExtractedLegislation(BaseModel):
    name: str = Field(description="Full name of the legislation/act")
    short_name: str = Field(description="Short name or acronym")
    year: int = Field(description="Year the legislation was passed")
    document_type: str = Field(default="act", description="act | rules | amendment | notification | code")
    summary: str = Field(description="Executive overview for vectorless RAG traversal")
    chapters: list[ExtractedChapter] = Field(default_factory=list)
    definitions: list[ExtractedDefinition] = Field(default_factory=list)
    penalties: list[ExtractedPenalty] = Field(default_factory=list)
    effective_date: str = Field(default="", description="Date of enforcement if mentioned")
    repealed_acts: list[str] = Field(default_factory=list, description="Names of acts repealed by this legislation")


# ──────────────────────────────────────────────
# API Response Schemas
# ──────────────────────────────────────────────

class DocumentResponse(BaseModel):
    id: str
    name: str
    file_name: str
    file_size: int
    page_count: int
    status: DocumentStatus
    uploaded_at: datetime
    analyzed_at: datetime | None = None


class AnalysisResponse(BaseModel):
    id: str
    document_id: str
    summary: str | None
    document_type: str | None
    structured_data: dict | None
    graph_stats: dict | None
    created_at: datetime


class SuggestionResponse(BaseModel):
    id: str
    document_id: str
    type: SuggestionType
    target_module: str
    suggested_data: dict
    confidence: float
    status: SuggestionStatus
    created_at: datetime


class DocumentDetailResponse(BaseModel):
    document: DocumentResponse
    analysis: AnalysisResponse | None = None
    suggestions: list[SuggestionResponse] = Field(default_factory=list)
    graph_stats: dict | None = None


# ──────────────────────────────────────────────
# Audit Chain (Blockchain-style tamper proof log)
# ──────────────────────────────────────────────

class AuditEntry(BaseModel):
    action: str
    entity_type: str
    entity_id: str
    data_hash: str
    previous_hash: str
    user_id: str | None = None
    timestamp: datetime
