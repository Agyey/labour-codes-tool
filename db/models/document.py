import uuid
from datetime import date
from typing import Optional, List
from sqlalchemy import String, Date, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from .base import Base, TimestampMixin

class Document(Base, TimestampMixin):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String, nullable=False)
    short_title: Mapped[Optional[str]] = mapped_column(String)
    popular_name: Mapped[Optional[str]] = mapped_column(String)
    
    # Enums generally implemented as String for simplicity & flexibility unless strictly required 
    # Valid values: Act, Rule, Regulation, Ordinance, Notification, Circular, Order, Guidelines, Directive, Treaty, Convention, Scheme, Policy, Code, Manual, Standard
    document_type: Mapped[Optional[str]] = mapped_column(String)
    
    document_number: Mapped[Optional[str]] = mapped_column(String)
    year: Mapped[Optional[int]] = mapped_column()
    
    jurisdiction_country: Mapped[Optional[str]] = mapped_column(String)
    jurisdiction_state: Mapped[Optional[str]] = mapped_column(String)
    jurisdiction_local: Mapped[Optional[str]] = mapped_column(String)
    
    issuing_authority: Mapped[Optional[str]] = mapped_column(String)
    gazette_reference: Mapped[Optional[str]] = mapped_column(String)
    language: Mapped[str] = mapped_column(String, default="English", nullable=False)
    
    date_of_assent: Mapped[Optional[date]] = mapped_column(Date)
    date_of_publication: Mapped[Optional[date]] = mapped_column(Date)
    default_commencement_date: Mapped[Optional[date]] = mapped_column(Date)
    
    # Valid values: Active, Repealed, Expired, Suspended, Not Yet Commenced, Partially Commenced, Superseded
    status: Mapped[str] = mapped_column(String, default="Active", nullable=False)
    sunset_date: Mapped[Optional[date]] = mapped_column(Date)
    
    subject_categories: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    
    is_connector_act: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    # Valid values: Stamp Duty, Registration Fee, Court Fee, Filing Fee, Notarization, Other
    connector_act_type: Mapped[Optional[str]] = mapped_column(String)
    
    plain_language_summary: Mapped[Optional[str]] = mapped_column(Text)
    preamble_text: Mapped[Optional[str]] = mapped_column(Text)
    enacting_formula: Mapped[Optional[str]] = mapped_column(Text)
    long_title: Mapped[Optional[str]] = mapped_column(Text)
    
    created_by: Mapped[Optional[str]] = mapped_column(String)
    updated_by: Mapped[Optional[str]] = mapped_column(String)
    
    # Valid values: Draft, Verified, Published
    review_status: Mapped[str] = mapped_column(String, default="Draft", nullable=False)
    editor_notes: Mapped[Optional[str]] = mapped_column(Text)
    data_source: Mapped[Optional[str]] = mapped_column(String)

    # Relationships
    structural_units: Mapped[List["StructuralUnit"]] = relationship(
        "StructuralUnit", back_populates="document", cascade="all, delete-orphan"
    )
