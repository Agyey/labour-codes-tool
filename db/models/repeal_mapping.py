import uuid
from datetime import date
from typing import Optional
from sqlalchemy import String, Text, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import Base

class RepealMapping(Base):
    __tablename__ = "repeal_mappings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    repealed_unit_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("structural_units.id", ondelete="CASCADE"), nullable=False)
    replacing_unit_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("structural_units.id", ondelete="CASCADE"), nullable=False)
    repealing_document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    
    # Valid values: Direct Replacement, Partial Replacement, Split Into Multiple, Merged From Multiple, No Equivalent, Substantially Similar, New Provision
    mapping_type: Mapped[str] = mapped_column(String, nullable=False)
    
    mapping_notes: Mapped[Optional[str]] = mapped_column(Text)
    savings_clause_ref: Mapped[Optional[str]] = mapped_column(Text)
    transitional_provision_ref: Mapped[Optional[str]] = mapped_column(Text)
    
    effective_date: Mapped[Optional[date]] = mapped_column(Date)

    # Relationships
    repealed_unit: Mapped["StructuralUnit"] = relationship("StructuralUnit", foreign_keys=[repealed_unit_id])
    replacing_unit: Mapped["StructuralUnit"] = relationship("StructuralUnit", foreign_keys=[replacing_unit_id])
    repealing_document: Mapped["Document"] = relationship("Document")
