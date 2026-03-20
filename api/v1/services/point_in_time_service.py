from uuid import UUID
from datetime import date
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_
from db.models.structural_unit import StructuralUnit
from db.models.amendment_history import AmendmentHistory
from db.models.point_in_time_snapshot import PointInTimeSnapshot
from api.v1.schemas.point_in_time import PointInTimeResult

class PointInTimeService:
    """
    Reconstructs provision text as it appeared on a given date by:
    1. Checking for a cached snapshot
    2. Falling back to replaying amendment history chronologically
    """

    async def get_as_on_date(self, db: AsyncSession, unit_id: UUID, as_on_date: date) -> PointInTimeResult:
        # 1. Check for cached snapshot
        cached = await db.execute(
            select(PointInTimeSnapshot)
            .where(
                and_(
                    PointInTimeSnapshot.structural_unit_id == unit_id,
                    PointInTimeSnapshot.snapshot_date == as_on_date,
                )
            )
        )
        snapshot = cached.scalars().first()
        if snapshot:
            return PointInTimeResult(
                structural_unit_id=unit_id,
                as_on_date=as_on_date,
                full_text_as_on_date=snapshot.full_text_as_on_date,
                status_as_on_date=snapshot.status_as_on_date,
                amendments_applied=snapshot.applicable_amendments or [],
                is_cached=True,
            )

        # 2. Get current text
        unit_result = await db.execute(
            select(StructuralUnit).where(StructuralUnit.id == unit_id)
        )
        unit = unit_result.scalars().first()
        if not unit:
            raise ValueError(f"Structural unit {unit_id} not found")

        # 3. Get amendments up to the target date
        amendments_result = await db.execute(
            select(AmendmentHistory)
            .where(
                and_(
                    AmendmentHistory.structural_unit_id == unit_id,
                    AmendmentHistory.effective_from <= as_on_date,
                )
            )
            .order_by(AmendmentHistory.effective_from.asc())
        )
        amendments = amendments_result.scalars().all()

        # 4. Replay amendments: start from original, apply changes in order
        reconstructed_text = unit.full_text or ""
        amendment_refs = []
        current_status = "Active"

        for amend in amendments:
            amendment_refs.append(amend.amending_reference or str(amend.id))
            if amend.new_text is not None:
                reconstructed_text = amend.new_text
            if amend.nature_of_change in ("Omitted", "Repealed"):
                current_status = amend.nature_of_change

        return PointInTimeResult(
            structural_unit_id=unit_id,
            as_on_date=as_on_date,
            full_text_as_on_date=reconstructed_text,
            status_as_on_date=current_status,
            amendments_applied=amendment_refs,
            is_cached=False,
        )

point_in_time_service = PointInTimeService()
