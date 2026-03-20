import uuid
from datetime import date
from typing import Optional
from sqlalchemy import String, Date, Text, Integer, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import Base

class AmendmentHistory(Base):
    __tablename__ = "amendment_history"
    __table_args__ = (
        Index("ix_amend_hist_unit_date", "structural_unit_id", "effective_from"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    structural_unit_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("structural_units.id", ondelete="CASCADE"), nullable=False)
    amending_document_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("documents.id", ondelete="RESTRICT"))
    
    amending_reference: Mapped[Optional[str]] = mapped_column(String)
    amendment_date: Mapped[Optional[date]] = mapped_column(Date)
    
    # Valid values: Inserted, Substituted, Omitted, Renumbered, Added Proviso, Added Explanation, Added Sub-section, Words Substituted, Words Inserted, Words Omitted, Section Substituted, Schedule Amended
    nature_of_change: Mapped[str] = mapped_column(String, nullable=False)
    
    previous_text: Mapped[Optional[str]] = mapped_column(Text)
    new_text: Mapped[Optional[str]] = mapped_column(Text)
    
    effective_from: Mapped[Optional[date]] = mapped_column(Date)
    effective_until: Mapped[Optional[date]] = mapped_column(Date)
    
    notification_reference: Mapped[Optional[str]] = mapped_column(String)
    version_number: Mapped[Optional[int]] = mapped_column(Integer)

    # Relationships
    structural_unit: Mapped["StructuralUnit"] = relationship("StructuralUnit")
    amending_document: Mapped[Optional["Document"]] = relationship("Document")
