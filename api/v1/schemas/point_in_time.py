from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import date

class PointInTimeRequest(BaseModel):
    as_on_date: date

class PointInTimeResult(BaseModel):
    structural_unit_id: UUID
    as_on_date: date
    full_text_as_on_date: str
    status_as_on_date: str
    amendments_applied: List[str] = []
    is_cached: bool = False

    model_config = ConfigDict(from_attributes=True)
