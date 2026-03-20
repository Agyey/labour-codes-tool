import uuid
from datetime import date
from typing import Optional, List
from sqlalchemy import String, Date, Text, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY, TSVECTOR
from .base import Base

class StructuralUnit(Base):
    """Hierarchical tree of all provisions (self-referencing)"""
    __tablename__ = "structural_units"
    __table_args__ = (
        Index("ix_su_doc_sort", "document_id", "sort_order"),
        Index("ix_su_doc_type", "document_id", "unit_type"),
        Index("ix_su_keywords_gin", "keywords", postgresql_using="gin"),
        Index("ix_su_provision_nature_gin", "provision_nature", postgresql_using="gin"),
        Index("ix_su_full_text_tsvector", "full_text_search", postgresql_using="gin"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    parent_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("structural_units.id", ondelete="CASCADE"))
    
    # Valid values: Preamble, Part, Chapter, Section, Sub-section, Clause, Sub-clause, Paragraph, Sub-paragraph, Item, Point, Rule, Sub-rule, Article, Schedule, Appendix, Annexure, Table, Proviso, Explanation, Illustration, Exception, Note, Form, Entry
    unit_type: Mapped[str] = mapped_column(String, nullable=False)
    
    number: Mapped[Optional[str]] = mapped_column(String)
    title: Mapped[Optional[str]] = mapped_column(String)
    heading_note: Mapped[Optional[str]] = mapped_column(String)
    
    full_text: Mapped[Optional[str]] = mapped_column(Text)
    plain_language_summary: Mapped[Optional[str]] = mapped_column(Text)
    
    sort_order: Mapped[int] = mapped_column(nullable=False, default=0)
    depth_level: Mapped[int] = mapped_column(nullable=False, default=0)
    
    commencement_date: Mapped[Optional[date]] = mapped_column(Date)
    
    # Valid values: Active, Repealed, Expired, Suspended, Not Yet Commenced, Omitted, Substituted
    status: Mapped[str] = mapped_column(String, default="Active", nullable=False)
    
    keywords: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    provision_nature: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    
    # Valid values: None, Event-based, Annual, Quarterly, Monthly, Ongoing, One-time, Periodic-Other
    compliance_type: Mapped[str] = mapped_column(String, default="None", nullable=False)
    compliance_trigger_event: Mapped[Optional[str]] = mapped_column(String)
    compliance_due_description: Mapped[Optional[str]] = mapped_column(Text)

    # Postgres TSVECTOR column for full text search
    full_text_search = mapped_column(TSVECTOR)

    # Relationships
    document: Mapped["Document"] = relationship("Document", back_populates="structural_units")
    
    # Adjacency list for hierarchical tree
    children: Mapped[List["StructuralUnit"]] = relationship(
        "StructuralUnit", back_populates="parent", cascade="all, delete-orphan",
        order_by="StructuralUnit.sort_order"
    )
    parent: Mapped[Optional["StructuralUnit"]] = relationship("StructuralUnit", back_populates="children", remote_side=[id])
