import uuid
from typing import Optional, Dict, Any
from sqlalchemy import String, Text, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from .base import Base

class ComplianceObligation(Base):
    __tablename__ = "compliance_obligations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    structural_unit_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("structural_units.id", ondelete="CASCADE"), nullable=False)
    
    # Valid values: Filing, Registration, Disclosure, Reporting, Record Maintenance, Obtaining Approval, Obtaining License, Payment, Intimation, Return Filing, Audit, Meeting, Publication
    obligation_type: Mapped[str] = mapped_column(String, nullable=False)
    
    # Valid values: Event-based, Annual, Quarterly, Monthly, Ongoing, One-time, Periodic-Other
    compliance_category: Mapped[str] = mapped_column(String, nullable=False)
    
    trigger_event: Mapped[Optional[str]] = mapped_column(String)
    due_date_rule: Mapped[Optional[str]] = mapped_column(String)
    frequency_detail: Mapped[Optional[str]] = mapped_column(String)
    
    penalty_section_ref: Mapped[Optional[str]] = mapped_column(String)
    penalty_description: Mapped[Optional[str]] = mapped_column(Text)
    
    # Valid values: Fine, Imprisonment, Both, Disqualification, Cancellation, Additional Fee, Prosecution
    penalty_type: Mapped[Optional[str]] = mapped_column(String)
    penalty_amount_or_formula: Mapped[Optional[str]] = mapped_column(String)
    
    compounding_allowed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    compounding_authority: Mapped[Optional[str]] = mapped_column(String)
    limitation_period: Mapped[Optional[str]] = mapped_column(String)
    responsible_role: Mapped[Optional[str]] = mapped_column(String)
    
    prescribed_form_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("structural_units.id", ondelete="SET NULL"))
    prescribed_form_name: Mapped[Optional[str]] = mapped_column(String)
    prescribed_fee: Mapped[Optional[str]] = mapped_column(String)
    prescribed_fee_formula: Mapped[Optional[str]] = mapped_column(String)
    
    prescribed_authority: Mapped[Optional[str]] = mapped_column(String)
    appellate_authority: Mapped[Optional[str]] = mapped_column(String)
    appeal_limitation: Mapped[Optional[str]] = mapped_column(String)
    
    procedural_steps: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB)
    
    second_appeal_authority: Mapped[Optional[str]] = mapped_column(String)
    second_appeal_limitation: Mapped[Optional[str]] = mapped_column(String)
    notes: Mapped[Optional[str]] = mapped_column(Text)

    # Relationships
    structural_unit: Mapped["StructuralUnit"] = relationship("StructuralUnit", foreign_keys=[structural_unit_id])
    prescribed_form_unit: Mapped[Optional["StructuralUnit"]] = relationship("StructuralUnit", foreign_keys=[prescribed_form_id])
