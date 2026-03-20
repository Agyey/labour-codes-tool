import uuid
from datetime import date
from typing import Optional, List, Dict, Any
from sqlalchemy import String, Date, Text, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
from .base import Base

class ApplicabilityCondition(Base):
    __tablename__ = "applicability_conditions"
    __table_args__ = (
        Index("ix_app_entity_types_gin", "entity_types", postgresql_using="gin"),
        Index("ix_app_industries_gin", "applicable_industries", postgresql_using="gin"),
        Index("ix_app_geotags_gin", "geographic_scope_tags", postgresql_using="gin"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    structural_unit_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("structural_units.id", ondelete="CASCADE"), nullable=False)
    
    geographic_scope: Mapped[Optional[str]] = mapped_column(String)
    geographic_scope_tags: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    
    applicability_start_date: Mapped[Optional[date]] = mapped_column(Date)
    applicability_end_date: Mapped[Optional[date]] = mapped_column(Date)
    
    entity_types: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    applicable_industries: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    
    threshold_conditions: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB)
    
    exempt_categories: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    exemption_notification_refs: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    
    conditional_logic: Mapped[Optional[str]] = mapped_column(Text)
    notes: Mapped[Optional[str]] = mapped_column(Text)

    # Relationships
    structural_unit: Mapped["StructuralUnit"] = relationship("StructuralUnit")
