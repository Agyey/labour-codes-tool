from uuid import UUID
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from api.database import get_db
from api.v1.schemas.search import SearchQuery, SearchResponse
from api.v1.schemas.applicability import EntityProfile, ApplicabilityResponse
from api.v1.schemas.point_in_time import PointInTimeResult
from api.v1.services.search_service import search_service
from api.v1.services.applicability_service import applicability_service
from api.v1.services.point_in_time_service import point_in_time_service

router = APIRouter()

# ─── Full-Text Search ────────────────────────────────────────

@router.get("/search", response_model=SearchResponse, tags=["Search"])
async def search_provisions(
    q: str,
    document_type: str = None,
    jurisdiction_country: str = None,
    jurisdiction_state: str = None,
    status: str = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """
    Full-text search across all structural units with ts_rank ranking.
    Supports facet filters: document_type, jurisdiction, status.
    """
    query = SearchQuery(
        q=q,
        document_type=document_type,
        jurisdiction_country=jurisdiction_country,
        jurisdiction_state=jurisdiction_state,
        status=status,
        page=page,
        per_page=per_page,
    )
    return await search_service.search(db, query)

# ─── Applicability Checker ───────────────────────────────────

@router.post("/applicability/check", response_model=ApplicabilityResponse, tags=["Applicability"])
async def check_applicability(
    profile: EntityProfile,
    db: AsyncSession = Depends(get_db),
):
    """
    Given an entity profile (type, industry, state, thresholds),
    returns all active provisions that apply.
    """
    return await applicability_service.check(db, profile)

# ─── Point-in-Time ───────────────────────────────────────────

@router.get(
    "/structural-units/{unit_id}/as-on-date",
    response_model=PointInTimeResult,
    tags=["Point-in-Time"],
)
async def get_provision_as_on_date(
    unit_id: UUID,
    as_on_date: date = Query(..., description="The date to reconstruct the provision text for"),
    db: AsyncSession = Depends(get_db),
):
    """
    Reconstructs the text of a structural unit as it existed on a given date,
    by replaying the amendment history chain.
    """
    try:
        return await point_in_time_service.get_as_on_date(db, unit_id, as_on_date)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
