from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date
from uuid import UUID

class DocumentBase(BaseModel):
    title: str
    short_title: Optional[str] = None
    popular_name: Optional[str] = None
    document_type: Optional[str] = None
    document_number: Optional[str] = None
    year: Optional[int] = None
    jurisdiction_country: Optional[str] = None
    jurisdiction_state: Optional[str] = None
    issuing_authority: Optional[str] = None
    status: str = "Active"
    language: str = "English"

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(DocumentBase):
    title: Optional[str] = None

class DocumentInDB(DocumentBase):
    id: UUID
    date_of_assent: Optional[date] = None
    created_by: Optional[str] = None
    review_status: str
    
    model_config = ConfigDict(from_attributes=True)
