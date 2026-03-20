from uuid import UUID
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, text, and_, or_
from db.models.structural_unit import StructuralUnit
from db.models.document import Document
from api.v1.schemas.search import SearchQuery, SearchResultItem, SearchResponse

class SearchService:
    """
    Implements PostgreSQL full-text search using ts_rank and plainto_tsquery.
    Falls back to ILIKE if tsvector columns are not populated.
    """

    async def search(self, db: AsyncSession, query: SearchQuery) -> SearchResponse:
        tsquery = func.plainto_tsquery("english", query.q)

        # Primary: tsvector-based ranked search
        # Fallback: ILIKE on full_text and title
        stmt = (
            select(
                StructuralUnit.id,
                StructuralUnit.document_id,
                StructuralUnit.unit_type,
                StructuralUnit.number,
                StructuralUnit.title,
                func.ts_headline(
                    "english",
                    func.coalesce(StructuralUnit.full_text, ""),
                    tsquery,
                    "MaxWords=50, MinWords=20, StartSel=<b>, StopSel=</b>"
                ).label("snippet"),
                func.ts_rank(
                    func.coalesce(StructuralUnit.full_text_search, func.to_tsvector("english", func.coalesce(StructuralUnit.full_text, ""))),
                    tsquery
                ).label("rank"),
                Document.title.label("document_title"),
            )
            .join(Document, Document.id == StructuralUnit.document_id)
            .where(
                or_(
                    StructuralUnit.full_text_search.op("@@")(tsquery),
                    StructuralUnit.full_text.ilike(f"%{query.q}%"),
                    StructuralUnit.title.ilike(f"%{query.q}%"),
                )
            )
        )

        # Apply filters
        if query.document_type:
            stmt = stmt.where(Document.document_type == query.document_type)
        if query.jurisdiction_country:
            stmt = stmt.where(Document.jurisdiction_country == query.jurisdiction_country)
        if query.jurisdiction_state:
            stmt = stmt.where(Document.jurisdiction_state == query.jurisdiction_state)
        if query.status:
            stmt = stmt.where(Document.status == query.status)

        # Count total
        from sqlalchemy import select as sa_select
        count_stmt = sa_select(func.count()).select_from(stmt.subquery())
        total_result = await db.execute(count_stmt)
        total = total_result.scalar() or 0

        # Order by rank and paginate
        offset = (query.page - 1) * query.per_page
        stmt = stmt.order_by(text("rank DESC")).offset(offset).limit(query.per_page)

        result = await db.execute(stmt)
        rows = result.all()

        items = [
            SearchResultItem(
                id=row.id,
                document_id=row.document_id,
                document_title=row.document_title,
                unit_type=row.unit_type,
                number=row.number,
                title=row.title,
                snippet=row.snippet,
                rank=row.rank,
            )
            for row in rows
        ]

        return SearchResponse(
            results=items,
            total=total,
            page=query.page,
            per_page=query.per_page,
            query=query.q,
        )

search_service = SearchService()
