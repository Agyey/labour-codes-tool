from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from uuid import UUID

class ComplianceObligationBase(BaseModel):
    obligation_type: str
    compliance_category: str
    trigger_event: Optional[str] = None
    due_date_rule: Optional[str] = None
    frequency_detail: Optional[str] = None
    penalty_section_ref: Optional[str] = None
    penalty_description: Optional[str] = None
    penalty_type: Optional[str] = None
    responsible_role: Optional[str] = None

class ComplianceObligationCreate(ComplianceObligationBase):
    structural_unit_id: UUID

class ComplianceObligationInDB(ComplianceObligationBase):
    id: UUID
    structural_unit_id: UUID
    compounding_allowed: bool
    procedural_steps: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)
