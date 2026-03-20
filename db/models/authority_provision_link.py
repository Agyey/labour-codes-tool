import uuid
from typing import Optional
from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import Base

class AuthorityProvisionLink(Base):
    __tablename__ = "authority_provision_links"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    authority_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("authorities.id", ondelete="CASCADE"), nullable=False)
    structural_unit_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("structural_units.id", ondelete="CASCADE"), nullable=False)
    
    # Valid values: Administers, Empowered By, Appellate Authority For, Adjudicating Authority For, Receives Filing, Grants Approval, Issues License, Conducts Inspection, Imposes Penalty
    role: Mapped[str] = mapped_column(String, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text)

    # Relationships
    authority: Mapped["Authority"] = relationship("Authority")
    structural_unit: Mapped["StructuralUnit"] = relationship("StructuralUnit")
