import uuid
from datetime import date
from typing import Optional, List
from sqlalchemy import String, Text, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from .base import Base

class NotificationCircular(Base):
    __tablename__ = "notifications_circulars"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    
    notification_number: Mapped[str] = mapped_column(String, nullable=False)
    
    # Valid values: Commencement, Exemption, Rate Change, Date Extension, Clarification, Amendment, Appointment of Authority, Delegation of Power, Form Prescription, Other
    notification_type: Mapped[str] = mapped_column(String, nullable=False)
    
    date_of_issue: Mapped[Optional[date]] = mapped_column(Date)
    issuing_authority: Mapped[Optional[str]] = mapped_column(String)
    subject: Mapped[Optional[str]] = mapped_column(String)
    full_text: Mapped[Optional[str]] = mapped_column(Text)
    
    provisions_affected: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    
    effective_from: Mapped[Optional[date]] = mapped_column(Date)
    effective_until: Mapped[Optional[date]] = mapped_column(Date)
    
    supersedes_notification_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("notifications_circulars.id", ondelete="SET NULL"))
    
    # Valid values: Active, Superseded, Withdrawn, Expired
    status: Mapped[str] = mapped_column(String, default="Active", nullable=False)

    # Relationships
    document: Mapped["Document"] = relationship("Document")
    supersedes_notification: Mapped[Optional["NotificationCircular"]] = relationship("NotificationCircular", remote_side=[id])
