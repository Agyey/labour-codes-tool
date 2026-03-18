import enum
from datetime import date, datetime
from typing import List, Optional
from sqlalchemy import (
    Column, Integer, String, Text, Date, DateTime, Boolean, 
    Enum, ForeignKey, JSON, ARRAY, Numeric, Table
)
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY as PG_ARRAY
import uuid

Base = declarative_base()

class DocumentType(enum.Enum):
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

class DocumentStatus(enum.Enum):
    ACTIVE = "Active"
    REPEALED = "Repealed"
    EXPIRED = "Expired"
    SUSPENDED = "Suspended"
    NOT_YET_COMMENCED = "Not Yet Commenced"
    PARTIALLY_COMMENCED = "Partially Commenced"
    SUPERSEDED = "Superseded"

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(Text, nullable=False)
    short_title = Column(Text)
    popular_name = Column(Text)
    document_type = Column(Enum(DocumentType))
    document_number = Column(Text)
    year = Column(Integer)
    jurisdiction_country = Column(Text)
    jurisdiction_state = Column(Text)
    jurisdiction_local = Column(Text)
    issuing_authority = Column(Text)
    gazette_reference = Column(Text)
    language = Column(Text, default="English")
    date_of_assent = Column(Date)
    date_of_publication = Column(Date)
    default_commencement_date = Column(Date)
    status = Column(Enum(DocumentStatus))
    sunset_date = Column(Date)
    subject_categories = Column(PG_ARRAY(Text))
    is_connector_act = Column(Boolean, default=False)
    connector_act_type = Column(String)  # Enum handled via domain logic or constraint
    plain_language_summary = Column(Text)
    preamble_text = Column(Text)
    enacting_formula = Column(Text)
    long_title = Column(Text)
    created_by = Column(Text)
    updated_by = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    review_status = Column(String) 
    editor_notes = Column(Text)
    data_source = Column(Text)

    structural_units = relationship("StructuralUnit", back_populates="document")
    definitions = relationship("Definition", back_populates="document")

class UnitType(enum.Enum):
    PREAMBLE = "Preamble"
    PART = "Part"
    CHAPTER = "Chapter"
    SECTION = "Section"
    SUBSECTION = "Sub-section"
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

class StructuralUnit(Base):
    __tablename__ = "structural_units"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("structural_units.id"))
    unit_type = Column(Enum(UnitType))
    number = Column(Text)
    title = Column(Text)
    heading_note = Column(Text)
    full_text = Column(Text)
    plain_language_summary = Column(Text)
    sort_order = Column(Integer)
    depth_level = Column(Integer)
    commencement_date = Column(Date)
    status = Column(Text)
    keywords = Column(PG_ARRAY(Text))
    provision_nature = Column(PG_ARRAY(Text))
    compliance_type = Column(Text, default="None")
    compliance_trigger_event = Column(Text)
    compliance_due_description = Column(Text)

    document = relationship("Document", back_populates="structural_units")
    parent = relationship("StructuralUnit", remote_side=[id], backref="children")
    definitions = relationship("Definition", back_populates="structural_unit")
    cross_references_source = relationship("CrossReference", foreign_keys="[CrossReference.source_unit_id]", back_populates="source_unit")
    cross_references_target = relationship("CrossReference", foreign_keys="[CrossReference.target_unit_id]", back_populates="target_unit")

class Definition(Base):
    __tablename__ = "definitions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    structural_unit_id = Column(UUID(as_uuid=True), ForeignKey("structural_units.id"))
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"))
    term = Column(Text, nullable=False)
    definition_text = Column(Text, nullable=False)
    scope_note = Column(Text)
    is_inclusive = Column(Boolean)
    is_exhaustive = Column(Boolean)
    related_terms = Column(PG_ARRAY(Text))
    effective_from = Column(Date)
    effective_until = Column(Date)

    document = relationship("Document", back_populates="definitions")
    structural_unit = relationship("StructuralUnit", back_populates="definitions")

class ApplicabilityCondition(Base):
    __tablename__ = "applicability_conditions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    structural_unit_id = Column(UUID(as_uuid=True), ForeignKey("structural_units.id"))
    geographic_scope = Column(Text)
    geographic_scope_tags = Column(PG_ARRAY(Text))
    applicability_start_date = Column(Date)
    applicability_end_date = Column(Date)
    entity_types = Column(PG_ARRAY(Text))
    applicable_industries = Column(PG_ARRAY(Text))
    threshold_conditions = Column(JSONB)
    exempt_categories = Column(PG_ARRAY(Text))
    exemption_notification_refs = Column(PG_ARRAY(Text))
    conditional_logic = Column(Text)
    notes = Column(Text)

    structural_unit = relationship("StructuralUnit")

class ReferenceType(enum.Enum):
    PARENT_ACT = "Parent Act"
    ENABLING_SECTION = "Enabling Section"
    AMENDED_BY = "Amended By"
    AMENDS = "Amends"
    REPEALED_BY = "Repealed By"
    REPEALS = "Repeals"
    OVERRIDES = "Overrides / Non-obstante"
    SUBJECT_TO = "Subject To"
    READ_WITH = "Read With"
    PARI_MATERIA = "Pari Materia"
    INTRA_DOCUMENT = "Intra-document Ref"
    INTER_DOCUMENT = "Inter-document Ref"
    RELATED_SUBORDINATE = "Related Subordinate Legislation"
    RELATED_FORM = "Related Form"
    RELATED_CASE_LAW = "Related Case Law"
    DELEGATED_LEGISLATION = "Delegated Legislation"
    CONFLICT = "Conflict / Inconsistency"
    SAVINGS_CLAUSE = "Savings Clause"
    CONNECTOR_ACT = "Connector Act Link"
    TRANSACTION_WORKFLOW = "Transaction Workflow Link"

class CrossReference(Base):
    __tablename__ = "cross_references"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_unit_id = Column(UUID(as_uuid=True), ForeignKey("structural_units.id"), nullable=False)
    target_unit_id = Column(UUID(as_uuid=True), ForeignKey("structural_units.id"))
    target_document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"))
    reference_type = Column(Enum(ReferenceType))
    reference_text = Column(Text)
    notes = Column(Text)
    effective_date = Column(Date)
    is_active = Column(Boolean, default=True)

    source_unit = relationship("StructuralUnit", foreign_keys=[source_unit_id], back_populates="cross_references_source")
    target_unit = relationship("StructuralUnit", foreign_keys=[target_unit_id], back_populates="cross_references_target")

class AmendmentHistory(Base):
    __tablename__ = "amendment_history"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    structural_unit_id = Column(UUID(as_uuid=True), ForeignKey("structural_units.id"))
    amending_document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"))
    amending_reference = Column(Text)
    amendment_date = Column(Date)
    nature_of_change = Column(Text)
    previous_text = Column(Text)
    new_text = Column(Text)
    effective_from = Column(Date)
    effective_until = Column(Date)
    notification_reference = Column(Text)
    version_number = Column(Integer)

class ComplianceObligation(Base):
    __tablename__ = "compliance_obligations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    structural_unit_id = Column(UUID(as_uuid=True), ForeignKey("structural_units.id"))
    obligation_type = Column(Text)
    compliance_category = Column(Text)
    trigger_event = Column(Text)
    due_date_rule = Column(Text)
    frequency_detail = Column(Text)
    penalty_section_ref = Column(Text)
    penalty_description = Column(Text)
    penalty_type = Column(Text)
    penalty_amount_or_formula = Column(Text)
    compounding_allowed = Column(Boolean)
    compounding_authority = Column(Text)
    limitation_period = Column(Text)
    responsible_role = Column(Text)
    prescribed_form_id = Column(UUID(as_uuid=True), ForeignKey("structural_units.id"))
    prescribed_form_name = Column(Text)
    prescribed_fee = Column(Text)
    prescribed_fee_formula = Column(Text)
    prescribed_authority = Column(Text)
    appellate_authority = Column(Text)
    appeal_limitation = Column(Text)
    procedural_steps = Column(JSONB)
    second_appeal_authority = Column(Text)
    second_appeal_limitation = Column(Text)
    notes = Column(Text)

class Authority(Base):
    __tablename__ = "authorities"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(Text, nullable=False)
    short_name = Column(Text)
    authority_type = Column(Text)
    parent_authority_id = Column(UUID(as_uuid=True), ForeignKey("authorities.id"))
    jurisdiction = Column(Text)
    governing_act_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"))
    website = Column(Text)
    address = Column(Text)
    notes = Column(Text)

class AuthorityProvisionLink(Base):
    __tablename__ = "authority_provision_links"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    authority_id = Column(UUID(as_uuid=True), ForeignKey("authorities.id"))
    structural_unit_id = Column(UUID(as_uuid=True), ForeignKey("structural_units.id"))
    role = Column(Text)
    notes = Column(Text)

class TransactionType(Base):
    __tablename__ = "transaction_types"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(Text, nullable=False)
    category = Column(Text)
    description = Column(Text)
    parent_transaction_id = Column(UUID(as_uuid=True), ForeignKey("transaction_types.id"))
    keywords = Column(PG_ARRAY(Text))

class TransactionProvisionLink(Base):
    __tablename__ = "transaction_provision_links"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transaction_type_id = Column(UUID(as_uuid=True), ForeignKey("transaction_types.id"))
    structural_unit_id = Column(UUID(as_uuid=True), ForeignKey("structural_units.id"))
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"))
    relevance_type = Column(Text)
    notes = Column(Text)
    sort_order = Column(Integer)

class StampDutySchedule(Base):
    __tablename__ = "stamp_duty_schedules"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"))
    structural_unit_id = Column(UUID(as_uuid=True), ForeignKey("structural_units.id"))
    article_number = Column(Text)
    instrument_description = Column(Text)
    instrument_category = Column(Text)
    state = Column(Text)
    proper_stamp_duty = Column(Text)
    duty_formula = Column(Text)
    duty_amount_fixed = Column(Numeric)
    duty_percentage = Column(Numeric)
    duty_on_value_of = Column(Text)
    maximum_cap = Column(Numeric)
    minimum_floor = Column(Numeric)
    who_pays = Column(Text)
    effective_from = Column(Date)
    effective_until = Column(Date)
    exemptions = Column(Text)
    related_transaction_type_id = Column(UUID(as_uuid=True), ForeignKey("transaction_types.id"))
    notification_reference = Column(Text)
    e_stamping_available = Column(Boolean)
    adjudication_required = Column(Boolean)
    penalty_for_deficit = Column(Text)
    notes = Column(Text)

class FeeSchedule(Base):
    __tablename__ = "fee_schedules"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"))
    structural_unit_id = Column(UUID(as_uuid=True), ForeignKey("structural_units.id"))
    fee_type = Column(Text)
    description = Column(Text)
    state = Column(Text)
    slab_from = Column(Numeric)
    slab_to = Column(Numeric)
    fee_amount_fixed = Column(Numeric)
    fee_percentage = Column(Numeric)
    fee_formula = Column(Text)
    payable_to = Column(Text)
    effective_from = Column(Date)
    effective_until = Column(Date)
    notification_reference = Column(Text)

class RateSlabSchedule(Base):
    __tablename__ = "rate_slab_schedules"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    structural_unit_id = Column(UUID(as_uuid=True), ForeignKey("structural_units.id"))
    schedule_name = Column(Text)
    slab_from = Column(Numeric)
    slab_to = Column(Numeric)
    rate_percentage = Column(Numeric)
    rate_fixed_amount = Column(Numeric)
    rate_formula = Column(Text)
    applicable_category = Column(Text)
    surcharge = Column(Text)
    cess = Column(Text)
    effective_from = Column(Date)
    effective_until = Column(Date)
    amending_notification = Column(Text)
    notes = Column(Text)

class NotificationCircular(Base):
    __tablename__ = "notifications_circulars"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"))
    notification_number = Column(Text)
    notification_type = Column(Text)
    date_of_issue = Column(Date)
    issuing_authority = Column(Text)
    subject = Column(Text)
    full_text = Column(Text)
    provisions_affected = Column(PG_ARRAY(Text))
    effective_from = Column(Date)
    effective_until = Column(Date)
    supersedes_notification_id = Column(UUID(as_uuid=True), ForeignKey("notifications_circulars.id"))
    status = Column(Text)

class DelegationOfPower(Base):
    __tablename__ = "delegation_of_powers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    delegating_unit_id = Column(UUID(as_uuid=True), ForeignKey("structural_units.id"))
    delegated_power = Column(Text)
    delegate_authority_id = Column(UUID(as_uuid=True), ForeignKey("authorities.id"))
    conditions_on_exercise = Column(Text)
    has_been_exercised = Column(Boolean)
    exercised_via_notification = Column(UUID(as_uuid=True), ForeignKey("notifications_circulars.id"))
    exercised_via_document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"))
    sub_delegation_allowed = Column(Boolean, default=False)
    notes = Column(Text)

class RightAndRemedy(Base):
    __tablename__ = "rights_and_remedies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    structural_unit_id = Column(UUID(as_uuid=True), ForeignKey("structural_units.id"))
    right_or_remedy_type = Column(Text)
    description = Column(Text)
    who_can_invoke = Column(Text)
    first_forum = Column(Text)
    first_forum_authority_id = Column(UUID(as_uuid=True), ForeignKey("authorities.id"))
    first_forum_limitation = Column(Text)
    first_appeal_forum = Column(Text)
    first_appeal_authority_id = Column(UUID(as_uuid=True), ForeignKey("authorities.id"))
    first_appeal_limitation = Column(Text)
    second_appeal_forum = Column(Text)
    second_appeal_authority_id = Column(UUID(as_uuid=True), ForeignKey("authorities.id"))
    second_appeal_limitation = Column(Text)
    high_court_jurisdiction = Column(Text)
    supreme_court_route = Column(Text)
    interim_relief_available = Column(Boolean)
    relief_types = Column(PG_ARRAY(Text))
    notes = Column(Text)

class ConditionPrecedentConsequent(Base):
    __tablename__ = "conditions_precedent_consequent"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    structural_unit_id = Column(UUID(as_uuid=True), ForeignKey("structural_units.id"))
    condition_type = Column(Text)
    condition_text = Column(Text)
    consequence_text = Column(Text)
    consequence_unit_id = Column(UUID(as_uuid=True), ForeignKey("structural_units.id"))
    time_window = Column(Text)
    applicable_entities = Column(PG_ARRAY(Text))
    parseable_condition = Column(JSONB)

class RepealMapping(Base):
    __tablename__ = "repeal_mappings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repealed_unit_id = Column(UUID(as_uuid=True), ForeignKey("structural_units.id"))
    replacing_unit_id = Column(UUID(as_uuid=True), ForeignKey("structural_units.id"))
    repealing_document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"))
    mapping_type = Column(Text)
    mapping_notes = Column(Text)
    savings_clause_ref = Column(Text)
    transitional_provision_ref = Column(Text)
    effective_date = Column(Date)

class FormTemplate(Base):
    __tablename__ = "form_templates"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    structural_unit_id = Column(UUID(as_uuid=True), ForeignKey("structural_units.id"))
    form_number = Column(Text)
    form_name = Column(Text)
    prescribed_under_section = Column(Text)
    filing_authority_id = Column(UUID(as_uuid=True), ForeignKey("authorities.id"))
    filing_frequency = Column(Text)
    trigger_event = Column(Text)
    fields_required = Column(JSONB)
    template_file_path = Column(Text)
    e_filing_url = Column(Text)
    fee = Column(Text)
    late_fee_formula = Column(Text)
    notes = Column(Text)

class JudicialInterpretation(Base):
    __tablename__ = "judicial_interpretations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    structural_unit_id = Column(UUID(as_uuid=True), ForeignKey("structural_units.id"))
    case_name = Column(Text)
    citation = Column(Text)
    court = Column(Text)
    court_authority_id = Column(UUID(as_uuid=True), ForeignKey("authorities.id"))
    date_of_judgment = Column(Date)
    bench_strength = Column(Text)
    ratio_decidendi = Column(Text)
    obiter_dicta = Column(Text)
    interpretation_type = Column(Text)
    is_good_law = Column(Boolean, default=True)
    overruled_by_case_id = Column(UUID(as_uuid=True), ForeignKey("judicial_interpretations.id"))
    distinguished_in = Column(PG_ARRAY(Text))
    followed_in = Column(PG_ARRAY(Text))
    keywords = Column(PG_ARRAY(Text))
    notes = Column(Text)

class PointInTimeSnapshot(Base):
    __tablename__ = "point_in_time_snapshots"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    structural_unit_id = Column(UUID(as_uuid=True), ForeignKey("structural_units.id"))
    snapshot_date = Column(Date)
    full_text_as_on_date = Column(Text)
    status_as_on_date = Column(Text)
    applicable_amendments = Column(PG_ARRAY(Text))
    generated_from_amendments = Column(Boolean, default=True)

# ... Remaining 19 tables will follow in separate logic or continues below
