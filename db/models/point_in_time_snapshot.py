import uuid
from datetime import date
from typing import Optional, List
from sqlalchemy import String, Text, Date, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from .base import Base

class PointInTimeSnapshot(Base):
    __tablename__ = "point_in_time_snapshots"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    structural_unit_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("structural_units.id", ondelete="CASCADE"), nullable=False)
    
    snapshot_date: Mapped[date] = mapped_column(Date, nullable=False)
    full_text_as_on_date: Mapped[str] = mapped_column(Text, nullable=False)
    status_as_on_date: Mapped[str] = mapped_column(String, nullable=False)
    
    applicable_amendments: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    generated_from_amendments: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    structural_unit: Mapped["StructuralUnit"] = relationship("StructuralUnit")
