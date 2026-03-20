import uuid
from typing import Optional
from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import Base

class Authority(Base):
    __tablename__ = "authorities"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, nullable=False)
    short_name: Mapped[Optional[str]] = mapped_column(String)
    
    # Valid values: Regulatory Body, Court, Tribunal, Government Ministry, Government Department, Statutory Authority, Officer, Local Body, International Body
    authority_type: Mapped[str] = mapped_column(String, nullable=False)
    
    parent_authority_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("authorities.id", ondelete="SET NULL"))
    jurisdiction: Mapped[Optional[str]] = mapped_column(String)
    
    governing_act_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("documents.id", ondelete="SET NULL"))
    
    website: Mapped[Optional[str]] = mapped_column(String)
    address: Mapped[Optional[str]] = mapped_column(Text)
    notes: Mapped[Optional[str]] = mapped_column(Text)

    # Relationships
    parent_authority: Mapped[Optional["Authority"]] = relationship("Authority", remote_side=[id])
    governing_act: Mapped[Optional["Document"]] = relationship("Document")
