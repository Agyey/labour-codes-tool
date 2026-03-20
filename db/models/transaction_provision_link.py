import uuid
from typing import Optional
from sqlalchemy import String, Text, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import Base

class TransactionProvisionLink(Base):
    __tablename__ = "transaction_provision_links"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transaction_type_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("transaction_types.id", ondelete="CASCADE"), nullable=False)
    structural_unit_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("structural_units.id", ondelete="CASCADE"), nullable=False)
    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    
    # Valid values: Primary, Secondary, Stamp Duty, Registration, Tax Implication, Filing Requirement, Approval Required, Restriction, Penalty, Exemption
    relevance_type: Mapped[str] = mapped_column(String, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    transaction_type: Mapped["TransactionType"] = relationship("TransactionType")
    structural_unit: Mapped["StructuralUnit"] = relationship("StructuralUnit")
    document: Mapped["Document"] = relationship("Document")
