from pydantic import BaseModel, Field
from uuid import UUID
from datetime import date, datetime
from typing import List, Optional, Any, Dict
from enum import Enum

# --- Enums ---

class DocumentType(str, Enum):
    ACT = "Act"
    RULE = "Rule"
    REGULATION = "Regulation"
    ORDINANCE = "Ordinance"
    NOTIFICATION = "Notification"
    CIRCULAR = "Circular"
    ORDER = "Order"
    GUIDELINES = "Guidelines"
    DIRECTIVE = "Directive"
    TREATY = "Treaty"
    CONVENTION = "Convention"
    SCHEME = "Scheme"
    POLICY = "Policy"
    CODE = "Code"
    MANUAL = "Manual"
    STANDARD = "Standard"

class DocumentStatus(str, Enum):
    ACTIVE = "Active"
    REPEALED = "Repealed"
    EXPIRED = "Expired"
    SUSPENDED = "Suspended"
    NOT_YET_COMMENCED = "Not Yet Commenced"
    PARTIALLY_COMMENCED = "Partially Commenced"
    SUPERSEDED = "Superseded"

class UnitType(str, Enum):
    PREAMBLE = "Preamble"
    PART = "Part"
    CHAPTER = "Chapter"
    SECTION = "Section"
    SUBSECTION = "Subsection"
    CLAUSE = "Clause"
    SUBCLAUSE = "Sub-clause"
    PARAGRAPH = "Paragraph"
    SUBPARAGRAPH = "Sub-paragraph"
    ITEM = "Item"
    POINT = "Point"
    RULE = "Rule"
    SUBRULE = "Sub-rule"
    ARTICLE = "Article"
    SCHEDULE = "Schedule"
    APPENDIX = "Appendix"
    ANNEXURE = "Annexure"
    TABLE = "Table"
    PROVISO = "Proviso"
    EXPLANATION = "Explanation"
    ILLUSTRATION = "Illustration"
    EXCEPTION = "Exception"
    NOTE = "Note"
    FORM = "Form"
    ENTRY = "Entry"

class ReferenceType(str, Enum):
    PARENT_ACT = "Parent Act"
    ENABLING_SECTION = "Enabling Section"
    AMENDED_BY = "Amended By"
    AMENDS = "Amends"
    REPEALED_BY = "Repealed By"
    REPEALS = "Repeals"
    OVERRIDES = "Overrides"
    SUBJECT_TO = "Subject To"
    READ_WITH = "Read With"
    PARI_MATERIA = "Pari Materia"
    INTRA_DOCUMENT = "Intra-document"
    INTER_DOCUMENT = "Inter-document"
    RELATED_SUBORDINATE = "Related Subordinate"
    RELATED_FORM = "Related Form"
    RELATED_CASE_LAW = "Related Case Law"
    DELEGATED_LEGISLATION = "Delegated Legislation"
    CONFLICT = "Conflict"
    SAVINGS_CLAUSE = "Savings Clause"
    CONNECTOR_ACT = "Connector Act"
    TRANSACTION_WORKFLOW = "Transaction Workflow"

# --- Base Schemas ---

class DocumentBase(BaseModel):
    title: str
    short_title: Optional[str] = None
    popular_name: Optional[str] = None
    document_type: Optional[DocumentType] = None
    document_number: Optional[str] = None
    year: Optional[int] = None
    jurisdiction_country: Optional[str] = "India"
    jurisdiction_state: Optional[str] = None
    jurisdiction_local: Optional[str] = None
    issuing_authority: Optional[str] = None
    gazette_reference: Optional[str] = None
    language: Optional[str] = "English"
    date_of_assent: Optional[date] = None
    date_of_publication: Optional[date] = None
    default_commencement_date: Optional[date] = None
    status: Optional[DocumentStatus] = DocumentStatus.ACTIVE
    sunset_date: Optional[date] = None
    subject_categories: Optional[List[str]] = []
    is_connector_act: Optional[bool] = False
    connector_act_type: Optional[str] = None
    plain_language_summary: Optional[str] = None
    preamble_text: Optional[str] = None
    enacting_formula: Optional[str] = None
    long_title: Optional[str] = None
    editor_notes: Optional[str] = None
    data_source: Optional[str] = None

class DocumentCreate(DocumentBase):
    pass

class Document(DocumentBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class StructuralUnitBase(BaseModel):
    document_id: UUID
    parent_id: Optional[UUID] = None
    unit_type: Optional[UnitType] = None
    number: Optional[str] = None
    title: Optional[str] = None
    heading_note: Optional[str] = None
    full_text: Optional[str] = None
    plain_language_summary: Optional[str] = None
    sort_order: Optional[int] = 0
    depth_level: Optional[int] = 0
    commencement_date: Optional[date] = None
    status: Optional[str] = "Active"
    keywords: Optional[List[str]] = []
    provision_nature: Optional[List[str]] = []
    compliance_type: Optional[str] = None
    compliance_trigger_event: Optional[str] = None
    compliance_due_description: Optional[str] = None

class StructuralUnitCreate(StructuralUnitBase):
    pass

class StructuralUnit(StructuralUnitBase):
    id: UUID
    class Config:
        from_attributes = True

class DefinitionBase(BaseModel):
    structural_unit_id: Optional[UUID] = None
    document_id: Optional[UUID] = None
    term: str
    definition_text: str
    scope_note: Optional[str] = None
    is_inclusive: Optional[bool] = False
    is_exhaustive: Optional[bool] = False
    related_terms: Optional[List[str]] = []
    effective_from: Optional[date] = None
    effective_until: Optional[date] = None

class DefinitionCreate(DefinitionBase):
    pass

class Definition(DefinitionBase):
    id: UUID
    class Config:
        from_attributes = True

class CrossReferenceBase(BaseModel):
    source_unit_id: UUID
    target_unit_id: Optional[UUID] = None
    target_document_id: Optional[UUID] = None
    reference_type: Optional[ReferenceType] = None
    reference_text: Optional[str] = None
    notes: Optional[str] = None
    effective_date: Optional[date] = None
    is_active: Optional[bool] = True

class CrossReferenceCreate(CrossReferenceBase):
    pass

class CrossReference(CrossReferenceBase):
    id: UUID
    class Config:
        from_attributes = True

class AmendmentHistoryBase(BaseModel):
    structural_unit_id: Optional[UUID] = None
    amending_document_id: Optional[UUID] = None
    amending_reference: Optional[str] = None
    amendment_date: Optional[date] = None
    nature_of_change: Optional[str] = None
    previous_text: Optional[str] = None
    new_text: Optional[str] = None
    effective_from: Optional[date] = None
    effective_until: Optional[date] = None
    notification_reference: Optional[str] = None
    version_number: Optional[int] = 1

class AmendmentHistoryCreate(AmendmentHistoryBase):
    pass

class AmendmentHistory(AmendmentHistoryBase):
    id: UUID
    class Config:
        from_attributes = True

class AuthorityBase(BaseModel):
    name: str
    short_name: Optional[str] = None
    authority_type: Optional[str] = None
    parent_authority_id: Optional[UUID] = None
    jurisdiction: Optional[str] = None
    governing_act_id: Optional[UUID] = None
    website: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None

class AuthorityCreate(AuthorityBase):
    pass

class Authority(AuthorityBase):
    id: UUID
    class Config:
        from_attributes = True

class ComplianceObligationBase(BaseModel):
    structural_unit_id: Optional[UUID] = None
    obligation_type: Optional[str] = None
    compliance_category: Optional[str] = None
    trigger_event: Optional[str] = None
    due_date_rule: Optional[str] = None
    frequency_detail: Optional[str] = None
    penalty_description: Optional[str] = None
    responsible_role: Optional[str] = None
    prescribed_authority: Optional[str] = None
    notes: Optional[str] = None

class ComplianceObligationCreate(ComplianceObligationBase):
    pass

class ComplianceObligation(ComplianceObligationBase):
    id: UUID
    class Config:
        from_attributes = True

# --- Additional specialized schemas for Phase 2 ---

class StructuralUnitTree(StructuralUnit):
    children: List['StructuralUnitTree'] = []

# No need to call update_forward_refs in Pydantic V2 typically, but kept for compatibility
# StructuralUnitTree.model_rebuild() # Pydantic V2 style
