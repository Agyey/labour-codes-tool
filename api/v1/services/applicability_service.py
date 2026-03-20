from uuid import UUID
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, or_, func
from db.models.structural_unit import StructuralUnit
from db.models.applicability_condition import ApplicabilityCondition
from db.models.document import Document
from api.v1.schemas.applicability import EntityProfile, ApplicableProvision, ApplicabilityResponse

class ApplicabilityService:
    """
    Matches an entity profile against provision-level applicability conditions.
    Uses ARRAY overlap (@>) and JSONB containment for threshold matching.
    """

    async def check(self, db: AsyncSession, profile: EntityProfile) -> ApplicabilityResponse:
        # Build dynamic filter conditions
        filters = []

        if profile.entity_type:
            filters.append(
                ApplicabilityCondition.entity_types.any(profile.entity_type)
            )
        if profile.industry:
            filters.append(
                ApplicabilityCondition.applicable_industries.any(profile.industry)
            )
        if profile.state:
            filters.append(
                or_(
                    ApplicabilityCondition.geographic_scope_tags.any(profile.state),
                    ApplicabilityCondition.geographic_scope == profile.state,
                    ApplicabilityCondition.geographic_scope == None,  # National scope
                )
            )

        stmt = (
            select(
                StructuralUnit.id.label("structural_unit_id"),
                StructuralUnit.document_id,
                StructuralUnit.unit_type,
                StructuralUnit.number,
                StructuralUnit.title,
                StructuralUnit.compliance_type,
                Document.title.label("document_title"),
            )
            .join(ApplicabilityCondition, ApplicabilityCondition.structural_unit_id == StructuralUnit.id)
            .join(Document, Document.id == StructuralUnit.document_id)
            .where(Document.status == "Active")
            .where(StructuralUnit.status == "Active")
        )

        if filters:
            stmt = stmt.where(and_(*filters))

        result = await db.execute(stmt)
        rows = result.all()

        provisions = [
            ApplicableProvision(
                structural_unit_id=row.structural_unit_id,
                document_id=row.document_id,
                document_title=row.document_title,
                unit_type=row.unit_type,
                number=row.number,
                title=row.title,
                compliance_type=row.compliance_type,
                match_reason=f"Matched entity_type={profile.entity_type}, state={profile.state}",
            )
            for row in rows
        ]

        return ApplicabilityResponse(
            entity_profile=profile,
            applicable_provisions=provisions,
            total_matched=len(provisions),
        )

applicability_service = ApplicabilityService()
