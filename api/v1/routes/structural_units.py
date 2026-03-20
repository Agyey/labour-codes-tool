from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from api.database import get_db
from api.v1.schemas.structural_unit import StructuralUnitCreate, StructuralUnitInDB
from api.v1.services.structural_unit_service import structural_unit_service

router = APIRouter()

@router.get("/{id}", response_model=StructuralUnitInDB)
async def read_unit(id: UUID, db: AsyncSession = Depends(get_db)):
    unit = await structural_unit_service.get_unit(db, id)
    if not unit:
        raise HTTPException(status_code=404, detail="Structural Unit not found")
    return unit

@router.get("/{id}/with-inline-rules")
async def read_unit_with_inline_rules(id: UUID, db: AsyncSession = Depends(get_db)):
    """Advanced endpoint returning a provision populated with referenced rules/circulars below it."""
    unit = await structural_unit_service.get_unit(db, id)
    if not unit:
        raise HTTPException(status_code=404, detail="Structural Unit not found")
    
    # Placeholder for logic fetching linked subordinate legislation
    return {"unit": unit, "inline_rules": []}
