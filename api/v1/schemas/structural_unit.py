from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import date

class StructuralUnitBase(BaseModel):
    unit_type: str
    number: Optional[str] = None
    title: Optional[str] = None
    heading_note: Optional[str] = None
    full_text: Optional[str] = None
    sort_order: int
    depth_level: int
    status: str = "Active"
    compliance_type: str = "None"

class StructuralUnitCreate(StructuralUnitBase):
    document_id: UUID
    parent_id: Optional[UUID] = None

class StructuralUnitUpdate(StructuralUnitBase):
    unit_type: Optional[str] = None
    sort_order: Optional[int] = None
    depth_level: Optional[int] = None

class StructuralUnitInDB(StructuralUnitBase):
    id: UUID
    document_id: UUID
    parent_id: Optional[UUID] = None
    
    model_config = ConfigDict(from_attributes=True)

class StructuralUnitTreeNode(StructuralUnitInDB):
    """Recursive schema output representing nested API provision trees."""
    children: List["StructuralUnitTreeNode"] = []
    
    model_config = ConfigDict(from_attributes=True)
