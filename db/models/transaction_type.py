import uuid
from typing import Optional, List
from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from .base import Base

class TransactionType(Base):
    __tablename__ = "transaction_types"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String)
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    parent_transaction_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("transaction_types.id", ondelete="SET NULL"))
    keywords: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))

    # Relationships
    parent_transaction: Mapped[Optional["TransactionType"]] = relationship("TransactionType", remote_side=[id])
