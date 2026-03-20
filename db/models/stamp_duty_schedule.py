import uuid
from datetime import date
from typing import Optional
from decimal import Decimal
from sqlalchemy import String, Text, Date, Numeric, Boolean, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import Base

class StampDutySchedule(Base):
    __tablename__ = "stamp_duty_schedules"
    __table_args__ = (
        Index("ix_sds_state_cat_date", "state", "instrument_category", "effective_from"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    structural_unit_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("structural_units.id", ondelete="CASCADE"), nullable=False)
    
    article_number: Mapped[str] = mapped_column(String, nullable=False)
    instrument_description: Mapped[str] = mapped_column(Text, nullable=False)
    instrument_category: Mapped[str] = mapped_column(String, nullable=False)
    state: Mapped[str] = mapped_column(String, nullable=False)
    
    proper_stamp_duty: Mapped[str] = mapped_column(Text, nullable=False)
    duty_formula: Mapped[Optional[str]] = mapped_column(String)
    
    duty_amount_fixed: Mapped[Optional[Decimal]] = mapped_column(Numeric(14, 2))
    duty_percentage: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 4))
    duty_on_value_of: Mapped[Optional[str]] = mapped_column(String)
    maximum_cap: Mapped[Optional[Decimal]] = mapped_column(Numeric(14, 2))
    minimum_floor: Mapped[Optional[Decimal]] = mapped_column(Numeric(14, 2))
    
    who_pays: Mapped[Optional[str]] = mapped_column(String)
    
    effective_from: Mapped[Optional[date]] = mapped_column(Date)
    effective_until: Mapped[Optional[date]] = mapped_column(Date)
    
    exemptions: Mapped[Optional[str]] = mapped_column(Text)
    related_transaction_type_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("transaction_types.id", ondelete="SET NULL"))
    notification_reference: Mapped[Optional[str]] = mapped_column(String)
    
    e_stamping_available: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    adjudication_required: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    penalty_for_deficit: Mapped[Optional[str]] = mapped_column(Text)
    notes: Mapped[Optional[str]] = mapped_column(Text)

    # Relationships
    document: Mapped["Document"] = relationship("Document")
    structural_unit: Mapped["StructuralUnit"] = relationship("StructuralUnit")
    related_transaction_type: Mapped[Optional["TransactionType"]] = relationship("TransactionType")
