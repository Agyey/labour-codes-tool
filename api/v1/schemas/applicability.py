from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from uuid import UUID

class EntityProfile(BaseModel):
    """
    Describes a business entity to check which legal provisions apply.
    Matches against JSONB threshold_conditions and ARRAY columns.
    """
    entity_type: Optional[str] = None            # e.g. "Private Limited Company"
    industry: Optional[str] = None               # e.g. "Manufacturing"
    state: Optional[str] = None                  # e.g. "Maharashtra"
    employee_count: Optional[int] = None
    annual_turnover: Optional[float] = None
    paid_up_capital: Optional[float] = None
    is_listed: Optional[bool] = None
    custom_attributes: Optional[Dict[str, Any]] = None

class ApplicableProvision(BaseModel):
    structural_unit_id: UUID
    document_id: UUID
    document_title: Optional[str] = None
    unit_type: str
    number: Optional[str] = None
    title: Optional[str] = None
    compliance_type: str
    match_reason: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ApplicabilityResponse(BaseModel):
    entity_profile: EntityProfile
    applicable_provisions: List[ApplicableProvision]
    total_matched: int
