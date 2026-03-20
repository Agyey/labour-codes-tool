from uuid import UUID
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from db.models.definition import Definition
from db.models.cross_reference import CrossReference
from db.models.compliance_obligation import ComplianceObligation
from db.models.document import Document
from db.models.structural_unit import StructuralUnit
from api.v1.schemas.definition import DefinitionCreate
from api.v1.schemas.cross_reference import CrossReferenceCreate
from api.v1.schemas.compliance import ComplianceObligationCreate
from api.v1.schemas.bulk_import import BulkImportPayload, BulkStructuralUnit

class DefinitionService:
    async def get_by_document(self, db: AsyncSession, document_id: UUID) -> List[Definition]:
        result = await db.execute(
            select(Definition).where(Definition.document_id == document_id)
        )
        return list(result.scalars().all())

    async def create(self, db: AsyncSession, obj_in: DefinitionCreate) -> Definition:
        db_obj = Definition(**obj_in.model_dump())
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

class CrossReferenceService:
    async def get_by_source(self, db: AsyncSession, unit_id: UUID) -> List[CrossReference]:
        result = await db.execute(
            select(CrossReference).where(CrossReference.source_unit_id == unit_id)
        )
        return list(result.scalars().all())

    async def create(self, db: AsyncSession, obj_in: CrossReferenceCreate) -> CrossReference:
        db_obj = CrossReference(**obj_in.model_dump())
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

class ComplianceService:
    async def get_by_unit(self, db: AsyncSession, unit_id: UUID) -> List[ComplianceObligation]:
        result = await db.execute(
            select(ComplianceObligation).where(ComplianceObligation.structural_unit_id == unit_id)
        )
        return list(result.scalars().all())

    async def create(self, db: AsyncSession, obj_in: ComplianceObligationCreate) -> ComplianceObligation:
        db_obj = ComplianceObligation(**obj_in.model_dump())
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

class BulkImportService:
    """Handles recursive creation of a full document tree from a single JSON payload."""

    async def import_document(self, db: AsyncSession, payload: BulkImportPayload):
        # 1. Create Document
        doc = Document(
            title=payload.title,
            short_title=payload.short_title,
            document_type=payload.document_type,
            document_number=payload.document_number,
            year=payload.year,
            jurisdiction_country=payload.jurisdiction_country,
            jurisdiction_state=payload.jurisdiction_state,
            status=payload.status,
        )
        db.add(doc)
        await db.flush()

        # 2. Recursively create structural units
        units_count = 0
        async def _create_units(nodes: List[BulkStructuralUnit], parent_id=None):
            nonlocal units_count
            for node in nodes:
                su = StructuralUnit(
                    document_id=doc.id,
                    parent_id=parent_id,
                    unit_type=node.unit_type,
                    number=node.number,
                    title=node.title,
                    full_text=node.full_text,
                    sort_order=node.sort_order,
                    depth_level=node.depth_level,
                    status=node.status,
                )
                db.add(su)
                await db.flush()
                units_count += 1
                if node.children:
                    await _create_units(node.children, parent_id=su.id)

        await _create_units(payload.structural_units)

        # 3. Create definitions
        defs_count = 0
        # Definitions need a structural_unit_id; for bulk import, attach to the first top-level unit
        first_unit_result = await db.execute(
            select(StructuralUnit)
            .where(StructuralUnit.document_id == doc.id)
            .where(StructuralUnit.parent_id == None)
            .order_by(StructuralUnit.sort_order)
            .limit(1)
        )
        first_unit = first_unit_result.scalars().first()

        if first_unit and payload.definitions:
            for defn in payload.definitions:
                d = Definition(
                    structural_unit_id=first_unit.id,
                    document_id=doc.id,
                    term=defn.term,
                    definition_text=defn.definition_text,
                    scope_note=defn.scope_note,
                    is_inclusive=defn.is_inclusive,
                    is_exhaustive=defn.is_exhaustive,
                )
                db.add(d)
                defs_count += 1

        await db.commit()
        return doc.id, units_count, defs_count

definition_service = DefinitionService()
cross_reference_service = CrossReferenceService()
compliance_service = ComplianceService()
bulk_import_service = BulkImportService()
