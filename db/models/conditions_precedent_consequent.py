import uuid
from typing import Optional, List, Dict, Any
from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
from .base import Base

class ConditionsPrecedentConsequent(Base):
    __tablename__ = "conditions_precedent_consequent"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    structural_unit_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("structural_units.id", ondelete="CASCADE"), nullable=False)
    
    # Valid values: Condition Precedent, Condition Subsequent, Trigger Event, Deeming Event
    condition_type: Mapped[str] = mapped_column(String, nullable=False)
    
    condition_text: Mapped[str] = mapped_column(Text, nullable=False)
    consequence_text: Mapped[str] = mapped_column(Text, nullable=False)
    
    consequence_unit_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("structural_units.id", ondelete="SET NULL"))
    
    time_window: Mapped[Optional[str]] = mapped_column(String)
    applicable_entities: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    
    parseable_condition: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB)

    # Relationships
    structural_unit: Mapped["StructuralUnit"] = relationship("StructuralUnit", foreign_keys=[structural_unit_id])
    consequence_unit: Mapped[Optional["StructuralUnit"]] = relationship("StructuralUnit", foreign_keys=[consequence_unit_id])
