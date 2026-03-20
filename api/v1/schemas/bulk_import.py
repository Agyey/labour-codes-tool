from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from uuid import UUID

class BulkStructuralUnit(BaseModel):
    """Represents a single provision in a bulk import payload."""
    unit_type: str
    number: Optional[str] = None
    title: Optional[str] = None
    full_text: Optional[str] = None
    sort_order: int
    depth_level: int
    status: str = "Active"
    children: List["BulkStructuralUnit"] = []

class BulkDefinition(BaseModel):
    term: str
    definition_text: str
    scope_note: Optional[str] = None
    is_inclusive: bool = False
    is_exhaustive: bool = False

class BulkImportPayload(BaseModel):
    """
    Top-level payload for POST /documents/{id}/import.
    Accepts the entire hierarchical tree + definitions in one shot.
    """
    title: str
    short_title: Optional[str] = None
    document_type: Optional[str] = None
    document_number: Optional[str] = None
    year: Optional[int] = None
    jurisdiction_country: Optional[str] = None
    jurisdiction_state: Optional[str] = None
    status: str = "Active"
    structural_units: List[BulkStructuralUnit] = []
    definitions: List[BulkDefinition] = []

class BulkImportResult(BaseModel):
    document_id: UUID
    units_created: int
    definitions_created: int
    message: str
