import uuid
from datetime import date
from typing import Optional, List
from sqlalchemy import String, Date, Boolean, Text, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY, TSVECTOR
from .base import Base

class Definition(Base):
    __tablename__ = "definitions"
    __table_args__ = (
        Index("ix_def_doc_term", "document_id", "term"),
        Index("ix_def_term_tsvector", "term_search", postgresql_using="gin"),
        Index("ix_def_text_tsvector", "def_text_search", postgresql_using="gin"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    structural_unit_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("structural_units.id", ondelete="CASCADE"), nullable=False)
    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    
    term: Mapped[str] = mapped_column(String, nullable=False)
    definition_text: Mapped[str] = mapped_column(Text, nullable=False)
    scope_note: Mapped[Optional[str]] = mapped_column(String)
    
    is_inclusive: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_exhaustive: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    related_terms: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    
    effective_from: Mapped[Optional[date]] = mapped_column(Date)
    effective_until: Mapped[Optional[date]] = mapped_column(Date)

    # Postgres TSVECTOR columns for search
    term_search = mapped_column(TSVECTOR)
    def_text_search = mapped_column(TSVECTOR)

    # Relationships
    document: Mapped["Document"] = relationship("Document")
    structural_unit: Mapped["StructuralUnit"] = relationship("StructuralUnit")
