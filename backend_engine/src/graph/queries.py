from src.graph.connection import get_driver


async def get_document_tree(document_id: str) -> list[dict[str, object]]:
    """Retrieve the full tree for a document (for UI rendering)."""
    driver = await get_driver()
    async with driver.session() as session:
        result = await session.run(
            """
            MATCH (d:Document {postgres_id: $doc_id})-[:HAS_CHAPTER]->(ch:Chapter)
            OPTIONAL MATCH (ch)-[:HAS_SECTION]->(s:Section)
            OPTIONAL MATCH (s)-[:HAS_SUBSECTION]->(ss:SubSection)
            RETURN d, ch, s, ss
            ORDER BY ch.order, s.order, ss.order
            """,
            doc_id=document_id,
        )
        records = [record.data() async for record in result]
    return records


async def traverse_for_query(
    document_id: str, target_chapter: str | None = None
) -> list[dict[str, object]]:
    """Vectorless RAG traversal: drill down to specific branch."""
    driver = await get_driver()
    async with driver.session() as session:
        if target_chapter:
            result = await session.run(
                """
                MATCH (d:Document {postgres_id: $doc_id})-[:HAS_CHAPTER]->(ch:Chapter)
                WHERE ch.chapter_number = $ch_num
                OPTIONAL MATCH (ch)-[:HAS_SECTION]->(s:Section)
                RETURN ch.summary AS chapter_summary,
                       collect({
                           section: s.section_number,
                           title: s.title,
                           summary: s.summary
                       }) AS sections
                """,
                doc_id=document_id,
                ch_num=target_chapter,
            )
        else:
            result = await session.run(
                """
                MATCH (d:Document {postgres_id: $doc_id})-[:HAS_CHAPTER]->(ch:Chapter)
                RETURN d.summary AS document_summary,
                       collect({
                           chapter_number: ch.chapter_number,
                           name: ch.chapter_name,
                           summary: ch.summary
                       }) AS chapters
                ORDER BY ch.order
                """,
                doc_id=document_id,
            )
        records = [record.data() async for record in result]
    return records
