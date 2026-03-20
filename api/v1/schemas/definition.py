from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import date

class DefinitionBase(BaseModel):
    term: str
    definition_text: str
    scope_note: Optional[str] = None
    is_inclusive: bool = False
    is_exhaustive: bool = False
    related_terms: Optional[List[str]] = None
    effective_from: Optional[date] = None
    effective_until: Optional[date] = None

class DefinitionCreate(DefinitionBase):
    structural_unit_id: UUID
    document_id: UUID

class DefinitionInDB(DefinitionBase):
    id: UUID
    structural_unit_id: UUID
    document_id: UUID

    model_config = ConfigDict(from_attributes=True)
