import uuid
from datetime import date
from typing import Optional, List
from sqlalchemy import String, Text, Date, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from .base import Base

class JudicialInterpretation(Base):
    __tablename__ = "judicial_interpretations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    structural_unit_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("structural_units.id", ondelete="CASCADE"), nullable=False)
    
    case_name: Mapped[str] = mapped_column(String, nullable=False)
    citation: Mapped[Optional[str]] = mapped_column(String)
    court: Mapped[Optional[str]] = mapped_column(String)
    court_authority_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("authorities.id", ondelete="SET NULL"))
    
    date_of_judgment: Mapped[Optional[date]] = mapped_column(Date)
    bench_strength: Mapped[Optional[str]] = mapped_column(String)
    
    ratio_decidendi: Mapped[str] = mapped_column(Text, nullable=False)
    obiter_dicta: Mapped[Optional[str]] = mapped_column(Text)
    
    # Valid values: Literal, Purposive, Harmonious Construction, Ejusdem Generis, Mischief Rule, Golden Rule, Other
    interpretation_type: Mapped[Optional[str]] = mapped_column(String)
    
    is_good_law: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    overruled_by_case_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("judicial_interpretations.id", ondelete="SET NULL"))
    
    distinguished_in: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    followed_in: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    keywords: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    
    notes: Mapped[Optional[str]] = mapped_column(Text)

    # Relationships
    structural_unit: Mapped["StructuralUnit"] = relationship("StructuralUnit")
    court_authority: Mapped[Optional["Authority"]] = relationship("Authority")
    overruled_by_case: Mapped[Optional["JudicialInterpretation"]] = relationship("JudicialInterpretation", remote_side=[id])
