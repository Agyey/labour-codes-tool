from uuid import UUID
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import text
from db.models.structural_unit import StructuralUnit

class StructuralUnitService:
    async def get_unit(self, db: AsyncSession, id: UUID) -> StructuralUnit | None:
        result = await db.execute(select(StructuralUnit).where(StructuralUnit.id == id))
        return result.scalars().first()

    async def get_document_tree(self, db: AsyncSession, document_id: UUID) -> List[StructuralUnit]:
        """
        Retrieves the entire hierarchical tree for a document using CTE/adjacency list.
        For simplicity in SQLAlchemy 2.0 async, eager loading the top level and letting 
        selectinload handle children recursively is effective depending on depth.
        """
        stmt = (
            select(StructuralUnit)
            .where(StructuralUnit.document_id == document_id)
            .where(StructuralUnit.parent_id == None)  # Top level nodes (e.g., Parts or Chapters)
            .options(selectinload(StructuralUnit.children))
            .order_by(StructuralUnit.sort_order)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

structural_unit_service = StructuralUnitService()
