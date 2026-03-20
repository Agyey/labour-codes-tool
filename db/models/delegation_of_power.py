import uuid
from typing import Optional
from sqlalchemy import Text, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import Base

class DelegationOfPower(Base):
    __tablename__ = "delegation_of_powers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    delegating_unit_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("structural_units.id", ondelete="CASCADE"), nullable=False)
    
    delegated_power: Mapped[str] = mapped_column(Text, nullable=False)
    delegate_authority_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("authorities.id", ondelete="CASCADE"), nullable=False)
    
    conditions_on_exercise: Mapped[Optional[str]] = mapped_column(Text)
    
    has_been_exercised: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    exercised_via_notification: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("notifications_circulars.id", ondelete="SET NULL"))
    exercised_via_document_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("documents.id", ondelete="SET NULL"))
    
    sub_delegation_allowed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text)

    # Relationships
    delegating_unit: Mapped["StructuralUnit"] = relationship("StructuralUnit")
    delegate_authority: Mapped["Authority"] = relationship("Authority")
    notification: Mapped[Optional["NotificationCircular"]] = relationship("NotificationCircular")
    exercised_document: Mapped[Optional["Document"]] = relationship("Document")
