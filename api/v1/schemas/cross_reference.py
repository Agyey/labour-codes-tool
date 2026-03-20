from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import date

class CrossReferenceBase(BaseModel):
    reference_type: str
    reference_text: Optional[str] = None
    notes: Optional[str] = None
    effective_date: Optional[date] = None
    is_active: bool = True

class CrossReferenceCreate(CrossReferenceBase):
    source_unit_id: UUID
    target_unit_id: Optional[UUID] = None
    target_document_id: Optional[UUID] = None

class CrossReferenceInDB(CrossReferenceBase):
    id: UUID
    source_unit_id: UUID
    target_unit_id: Optional[UUID] = None
    target_document_id: Optional[UUID] = None

    model_config = ConfigDict(from_attributes=True)
