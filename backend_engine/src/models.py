"""Pydantic V2 models for the Document Hub.

Strict typing for:
  - Gemini extraction schemas (structured output)
  - API request/response schemas
  - Suggestion workflow schemas
"""

from __future__ import annotations

import typing
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


# ──────────────────────────────────────────────
# Enums
# ──────────────────────────────────────────────


class DocumentStatus(str, Enum):
    UPLOADED = "uploaded"
    ANALYZING = "analyzing"
    ANALYZED = "analyzed"
    ERROR = "error"


class SuggestionType(str, Enum):
    CREATE_LEGISLATION = "create_legislation"
    CREATE_PROVISION = "create_provision"
    CREATE_COMPLIANCE_ITEM = "create_compliance_item"
    CREATE_PENALTY = "create_penalty"
    CREATE_DEFINITION = "create_definition"
    FLAG_REPEAL = "flag_repeal"
    UPDATE_PROVISION = "update_provision"


class SuggestionStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    EDITED = "edited"


# ──────────────────────────────────────────────
# Gemini Extraction Schemas (Structured Output)
# ──────────────────────────────────────────────


class ExtractedComplianceTask(BaseModel):
    task: str = Field(description="The compliance obligation or task")
    due_logic: str = Field(
        description="When this task is due (e.g. 'Within 30 days of registration')"
    )
    severity: str = Field(
        default="medium", description="low | medium | high | critical"
    )


class ExtractedPenalty(BaseModel):
    description: str = Field(description="Description of the penalty clause")
    fine_amount: str = Field(default="", description="Fine amount if specified")
    imprisonment: str = Field(
        default="", description="Imprisonment duration if specified"
    )
    applicable_section: str = Field(
        default="", description="Section this penalty applies to"
    )


class ExtractedDefinition(BaseModel):
    term: str = Field(description="The legal term being defined")
    definition: str = Field(description="The full legal definition")
    section_ref: str = Field(
        default="", description="Section reference for this definition"
    )


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
    summary: str = Field(
        description="Concise summary of the chapter for vectorless RAG traversal"
    )
    sections: list[ExtractedSection] = Field(default_factory=list)


class ExtractedChange(BaseModel):
    difference_type: str = Field(description="addition | modification | deletion")
    description: str = Field(
        description="Description of what changed compared to previous laws"
    )
    previous_reference: str = Field(
        default="", description="Reference to the old law/act it replaces"
    )
    new_reference: str = Field(
        default="", description="Reference to the new section/rule"
    )


class ExtractedLegislation(BaseModel):
    name: str = Field(description="Full name of the legislation/act")
    short_name: str = Field(description="Short name or acronym")
    year: int = Field(description="Year the legislation was passed")
    document_type: str = Field(
        default="act", description="act | rules | amendment | notification | code"
    )
    summary: str = Field(description="Executive overview for vectorless RAG traversal")
    chapters: list[ExtractedChapter] = Field(default_factory=list)
    definitions: list[ExtractedDefinition] = Field(default_factory=list)
    penalties: list[ExtractedPenalty] = Field(default_factory=list)
    key_changes: list[ExtractedChange] = Field(
        default_factory=list,
        description="Major differences or amendments compared to previous acts",
    )
    effective_date: str = Field(
        default="", description="Date of enforcement if mentioned"
    )
    repealed_acts: list[str] = Field(
        default_factory=list, description="Names of acts repealed by this legislation"
    )
    metadata: dict[str, typing.Any] = Field(
        default_factory=dict, description="Metadata for extraction (jurisdiction, etc)"
    )


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
    structured_data: dict[str, typing.Any] | None
    graph_stats: dict[str, typing.Any] | None
    created_at: datetime


class SuggestionResponse(BaseModel):
    id: str
    document_id: str
    type: SuggestionType
    target_module: str
    suggested_data: dict[str, typing.Any]
    confidence: float
    status: SuggestionStatus
    created_at: datetime


class DocumentDetailResponse(BaseModel):
    document: DocumentResponse
    analysis: AnalysisResponse | None = None
    suggestions: list[SuggestionResponse] = Field(default_factory=list)
    graph_stats: dict[str, typing.Any] | None = None


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


# ──────────────────────────────────────────────
# Pipeline Enrichment Schemas (New)
# ──────────────────────────────────────────────

class DocumentClassification(BaseModel):
    doc_type: str
    jurisdiction: str
    appropriate_govt: str
    parent_act_hint: str | None
    parent_act_year: int | None
    enabling_section_hint: str | None
    is_connector_act: bool
    is_amendment: bool
    confidence: float
    notes: list[str] = Field(default_factory=list)


class PenaltyExtract(BaseModel):
    fine_amount: str | None = None
    imprisonment: str | None = None
    liable_person: str | None = None
    description: str | None = None


class ObligationExtract(BaseModel):
    obligation_type: str = Field(description="filing | registration | disclosure | record_maintenance | payment | reporting | other")
    compliance_category: str = Field(description="event_based | annual | quarterly | ongoing | one_time")
    title: str
    description: str | None = None
    trigger_event: str | None = None
    due_date_rule: str | None = None
    responsible_person: str | None = None
    prescribed_form: str | None = None
    prescribed_authority: str | None = None
    penalties: list[PenaltyExtract] = Field(default_factory=list)


class ProvisionClassification(BaseModel):
    unit_id: str
    nature_tags: list[str] = Field(description="List of strings e.g. ['Substantive Obligation', 'Penal']")
    obligations: list[ObligationExtract] = Field(default_factory=list)


class ComplianceBatchResponse(BaseModel):
    results: list[ProvisionClassification]


class ApplicabilityExtract(BaseModel):
    unit_id: str
    entity_types: list[str] = Field(default_factory=list, description="e.g. ['Listed Company', 'employer']")
    thresholds: dict[str, typing.Any] = Field(default_factory=dict, description="e.g. {'net_worth_above': 5000000000}")
    exemptions: list[str] = Field(default_factory=list, description="e.g. ['Private Company']")
    description: str | None = None


class ApplicabilityBatchResponse(BaseModel):
    results: list[ApplicabilityExtract]
