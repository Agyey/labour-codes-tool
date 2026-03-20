import uuid
from datetime import date
from typing import Optional
from decimal import Decimal
from sqlalchemy import String, Text, Date, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import Base

class RateSlabSchedule(Base):
    __tablename__ = "rate_slab_schedules"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    structural_unit_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("structural_units.id", ondelete="CASCADE"), nullable=False)
    
    schedule_name: Mapped[str] = mapped_column(String, nullable=False)
    
    slab_from: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    slab_to: Mapped[Optional[Decimal]] = mapped_column(Numeric(14, 2))
    
    rate_percentage: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 4))
    rate_fixed_amount: Mapped[Optional[Decimal]] = mapped_column(Numeric(14, 2))
    rate_formula: Mapped[Optional[str]] = mapped_column(String)
    
    applicable_category: Mapped[Optional[str]] = mapped_column(String)
    surcharge: Mapped[Optional[str]] = mapped_column(String)
    cess: Mapped[Optional[str]] = mapped_column(String)
    
    effective_from: Mapped[Optional[date]] = mapped_column(Date)
    effective_until: Mapped[Optional[date]] = mapped_column(Date)
    
    amending_notification: Mapped[Optional[str]] = mapped_column(Text)
    notes: Mapped[Optional[str]] = mapped_column(Text)

    # Relationships
    structural_unit: Mapped["StructuralUnit"] = relationship("StructuralUnit")
