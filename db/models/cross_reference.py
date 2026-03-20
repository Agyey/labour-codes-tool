import uuid
from datetime import date
from typing import Optional
from sqlalchemy import String, Date, Text, Boolean, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import Base

class CrossReference(Base):
    __tablename__ = "cross_references"
    __table_args__ = (
        Index("ix_xref_source", "source_unit_id"),
        Index("ix_xref_target", "target_unit_id"),
        Index("ix_xref_type", "reference_type"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    source_unit_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("structural_units.id", ondelete="CASCADE"), nullable=False)
    # Target may be null if referring to an external act not currently parsed
    target_unit_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("structural_units.id", ondelete="RESTRICT"))
    target_document_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("documents.id", ondelete="RESTRICT"))
    
    # Valid values: Parent Act, Enabling Section, Amended By, Amends, Repealed By, Repeals, Overrides, Subject To, Read With, Pari Materia, Intra-document Ref, Inter-document Ref, Related Subordinate Legislation, Related Form, Related Case Law, Delegated Legislation, Conflict, Savings Clause, Connector Act Link, Transaction Workflow Link
    reference_type: Mapped[str] = mapped_column(String, nullable=False)
    
    reference_text: Mapped[Optional[str]] = mapped_column(Text)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    
    effective_date: Mapped[Optional[date]] = mapped_column(Date)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    source_unit: Mapped["StructuralUnit"] = relationship("StructuralUnit", foreign_keys=[source_unit_id])
    target_unit: Mapped[Optional["StructuralUnit"]] = relationship("StructuralUnit", foreign_keys=[target_unit_id])
    target_document: Mapped[Optional["Document"]] = relationship("Document", foreign_keys=[target_document_id])
