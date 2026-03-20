import uuid
from typing import Optional, Dict, Any
from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from .base import Base

class FormTemplate(Base):
    __tablename__ = "form_templates"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    structural_unit_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("structural_units.id", ondelete="CASCADE"), nullable=False)
    
    form_number: Mapped[str] = mapped_column(String, nullable=False)
    form_name: Mapped[str] = mapped_column(String, nullable=False)
    
    prescribed_under_section: Mapped[Optional[str]] = mapped_column(String)
    filing_authority_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("authorities.id", ondelete="SET NULL"))
    
    # Valid values: One-time, Annual, Event-based, Quarterly, Monthly
    filing_frequency: Mapped[Optional[str]] = mapped_column(String)
    trigger_event: Mapped[Optional[str]] = mapped_column(String)
    
    fields_required: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB)
    
    template_file_path: Mapped[Optional[str]] = mapped_column(String)
    e_filing_url: Mapped[Optional[str]] = mapped_column(String)
    
    fee: Mapped[Optional[str]] = mapped_column(String)
    late_fee_formula: Mapped[Optional[str]] = mapped_column(String)
    notes: Mapped[Optional[str]] = mapped_column(Text)

    # Relationships
    structural_unit: Mapped["StructuralUnit"] = relationship("StructuralUnit")
    filing_authority: Mapped[Optional["Authority"]] = relationship("Authority")
