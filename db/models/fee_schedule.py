import uuid
from datetime import date
from typing import Optional
from decimal import Decimal
from sqlalchemy import String, Text, Date, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import Base

class FeeSchedule(Base):
    __tablename__ = "fee_schedules"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    structural_unit_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("structural_units.id", ondelete="CASCADE"), nullable=False)
    
    # Valid values: Court Fee, Filing Fee, Registration Fee, Late Fee, Additional Fee, Compounding Fee, Processing Fee, License Fee
    fee_type: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    state: Mapped[Optional[str]] = mapped_column(String)
    
    slab_from: Mapped[Optional[Decimal]] = mapped_column(Numeric(14, 2))
    slab_to: Mapped[Optional[Decimal]] = mapped_column(Numeric(14, 2))
    
    fee_amount_fixed: Mapped[Optional[Decimal]] = mapped_column(Numeric(14, 2))
    fee_percentage: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 4))
    fee_formula: Mapped[Optional[str]] = mapped_column(String)
    
    payable_to: Mapped[Optional[str]] = mapped_column(String)
    
    effective_from: Mapped[Optional[date]] = mapped_column(Date)
    effective_until: Mapped[Optional[date]] = mapped_column(Date)
    notification_reference: Mapped[Optional[str]] = mapped_column(String)

    # Relationships
    document: Mapped["Document"] = relationship("Document")
    structural_unit: Mapped["StructuralUnit"] = relationship("StructuralUnit")
