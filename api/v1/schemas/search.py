from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from uuid import UUID

class SearchQuery(BaseModel):
    """Input for the full-text search endpoint."""
    q: str
    document_type: Optional[str] = None
    jurisdiction_country: Optional[str] = None
    jurisdiction_state: Optional[str] = None
    status: Optional[str] = None
    page: int = 1
    per_page: int = 20

class SearchResultItem(BaseModel):
    id: UUID
    document_id: UUID
    document_title: Optional[str] = None
    unit_type: str
    number: Optional[str] = None
    title: Optional[str] = None
    snippet: Optional[str] = None
    rank: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)

class SearchResponse(BaseModel):
    results: List[SearchResultItem]
    total: int
    page: int
    per_page: int
    query: str
