import uuid
from typing import Optional, List
from sqlalchemy import String, Text, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from .base import Base

class RightsAndRemedies(Base):
    __tablename__ = "rights_and_remedies"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    structural_unit_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("structural_units.id", ondelete="CASCADE"), nullable=False)
    
    # Valid values: Right, Remedy, Appeal, Revision, Review, Reference, Writ
    right_or_remedy_type: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    who_can_invoke: Mapped[Optional[str]] = mapped_column(String)
    
    first_forum: Mapped[Optional[str]] = mapped_column(String)
    first_forum_authority_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("authorities.id", ondelete="SET NULL"))
    first_forum_limitation: Mapped[Optional[str]] = mapped_column(String)
    
    first_appeal_forum: Mapped[Optional[str]] = mapped_column(String)
    first_appeal_authority_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("authorities.id", ondelete="SET NULL"))
    first_appeal_limitation: Mapped[Optional[str]] = mapped_column(String)
    
    second_appeal_forum: Mapped[Optional[str]] = mapped_column(String)
    second_appeal_authority_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("authorities.id", ondelete="SET NULL"))
    second_appeal_limitation: Mapped[Optional[str]] = mapped_column(String)
    
    high_court_jurisdiction: Mapped[Optional[str]] = mapped_column(String)
    supreme_court_route: Mapped[Optional[str]] = mapped_column(String)
    
    interim_relief_available: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    relief_types: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    notes: Mapped[Optional[str]] = mapped_column(Text)

    # Relationships
    structural_unit: Mapped["StructuralUnit"] = relationship("StructuralUnit")
    first_forum_auth: Mapped[Optional["Authority"]] = relationship("Authority", foreign_keys=[first_forum_authority_id])
    first_appeal_auth: Mapped[Optional["Authority"]] = relationship("Authority", foreign_keys=[first_appeal_authority_id])
    second_appeal_auth: Mapped[Optional["Authority"]] = relationship("Authority", foreign_keys=[second_appeal_authority_id])
