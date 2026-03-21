import typing
from datetime import datetime, timezone
from loguru import logger
from neo4j import AsyncSession
from src.graph.connection import get_driver, content_hash


async def build_doc_node(
    session: AsyncSession,
    document_id: str,
    extracted_data: dict[str, object],
    now_iso: str,
) -> int:
    await session.run(
        """
        MERGE (d:Document {uid: $uid})
        SET d.name = $name,
            d.short_name = $short_name,
            d.year = $year,
            d.summary = $summary,
            d.node_type = 'document',
            d.content_hash = $hash,
            d.created_at = $created_at,
            d.postgres_id = $pg_id
        """,
        uid=f"doc_{document_id}",
        name=extracted_data.get("name", "Unknown"),
        short_name=extracted_data.get("short_name", ""),
        year=extracted_data.get("year", 0),
        summary=extracted_data.get("summary", ""),
        hash=content_hash(str(extracted_data.get("summary", ""))),
        created_at=now_iso,
        pg_id=document_id,
    )
    return 1


async def build_definitions(
    session: AsyncSession, document_id: str, definitions_list: list[dict[str, object]]
) -> tuple[int, int]:
    nc, rc = 0, 0
    for def_idx, defn in enumerate(definitions_list):
        def_uid = f"doc_{document_id}_def_{def_idx}"
        await session.run(
            """
            MERGE (df:Definition {uid: $uid})
            SET df.term = $term,
                df.definition = $definition,
                df.section_ref = $ref,
                df.node_type = 'definition',
                df.content_hash = $hash
            WITH df
            MATCH (d:Document {uid: $doc_uid})
            MERGE (d)-[:HAS_DEFINITION]->(df)
            """,
            uid=def_uid,
            term=defn.get("term", ""),
            definition=defn.get("definition", ""),
            ref=defn.get("section_ref", ""),
            hash=content_hash(str(defn.get("definition", ""))),
            doc_uid=f"doc_{document_id}",
        )
        nc += 1
        rc += 1
    return nc, rc


async def build_chapters(
    session: AsyncSession, document_id: str, chapters_list: list[dict[str, object]]
) -> tuple[int, int]:
    nc, rc = 0, 0
    for ch_idx, chapter in enumerate(chapters_list):
        ch_uid = f"doc_{document_id}_ch_{ch_idx}"
        await session.run(
            """
            MERGE (ch:Chapter {uid: $uid})
            SET ch.chapter_number = $number,
                ch.chapter_name = $name,
                ch.summary = $summary,
                ch.node_type = 'chapter',
                ch.order = $order,
                ch.content_hash = $hash
            WITH ch
            MATCH (d:Document {uid: $doc_uid})
            MERGE (d)-[:HAS_CHAPTER]->(ch)
            """,
            uid=ch_uid,
            number=chapter.get("chapter_number", ""),
            name=chapter.get("chapter_name", ""),
            summary=chapter.get("summary", ""),
            order=ch_idx,
            hash=content_hash(str(chapter.get("summary", ""))),
            doc_uid=f"doc_{document_id}",
        )
        nc += 1
        rc += 1

        sec_nc, sec_rc = await build_sections(
            session,
            document_id,
            ch_idx,
            ch_uid,
            typing.cast(list[dict[str, object]], chapter.get("sections", [])),
        )
        nc += sec_nc
        rc += sec_rc
    return nc, rc


async def build_sections(
    session: AsyncSession,
    document_id: str,
    ch_idx: int,
    ch_uid: str,
    sections_list: list[dict[str, object]],
) -> tuple[int, int]:
    nc, rc = 0, 0
    for sec_idx, section in enumerate(sections_list):
        sec_uid = f"doc_{document_id}_ch_{ch_idx}_sec_{sec_idx}"
        await session.run(
            """
            MERGE (s:Section {uid: $uid})
            SET s.section_number = $number,
                s.title = $title,
                s.summary = $summary,
                s.full_text = $full_text,
                s.node_type = 'section',
                s.order = $order,
                s.content_hash = $hash
            WITH s
            MATCH (ch:Chapter {uid: $ch_uid})
            MERGE (ch)-[:HAS_SECTION]->(s)
            """,
            uid=sec_uid,
            number=section.get("section_number", ""),
            title=section.get("title", ""),
            summary=section.get("summary", ""),
            full_text=section.get("full_text", ""),
            order=sec_idx,
            hash=content_hash(str(section.get("full_text", ""))),
            ch_uid=ch_uid,
        )
        nc += 1
        rc += 1

        tasks_list = typing.cast(
            list[dict[str, object]], section.get("compliance_tasks", [])
        )
        for t_idx, task in enumerate(tasks_list):
            t_uid = f"doc_{document_id}_ch_{ch_idx}_sec_{sec_idx}_task_{t_idx}"
            await session.run(
                """
                MERGE (ct:ComplianceTask {uid: $uid})
                SET ct.task = $task, ct.due_logic = $due_logic, ct.severity = $severity, ct.node_type = 'compliance_task', ct.content_hash = $hash
                WITH ct MATCH (s:Section {uid: $sec_uid}) MERGE (s)-[:HAS_COMPLIANCE_TASK]->(ct)
                """,
                uid=t_uid,
                task=task.get("task", ""),
                due_logic=task.get("due_logic", ""),
                severity=task.get("severity", "medium"),
                hash=content_hash(str(task.get("task", ""))),
                sec_uid=sec_uid,
            )
            nc += 1
            rc += 1

        penalties_list = typing.cast(
            list[dict[str, object]], section.get("penalties", [])
        )
        for p_idx, penalty in enumerate(penalties_list):
            p_uid = f"doc_{document_id}_ch_{ch_idx}_sec_{sec_idx}_pen_{p_idx}"
            await session.run(
                """
                MERGE (p:Penalty {uid: $uid})
                SET p.description = $desc, p.fine_amount = $fine, p.imprisonment = $imp, p.node_type = 'penalty', p.content_hash = $hash
                WITH p MATCH (s:Section {uid: $sec_uid}) MERGE (s)-[:HAS_PENALTY]->(p)
                """,
                uid=p_uid,
                desc=penalty.get("description", ""),
                fine=penalty.get("fine_amount", ""),
                imp=penalty.get("imprisonment", ""),
                hash=content_hash(str(penalty.get("description", ""))),
                sec_uid=sec_uid,
            )
            nc += 1
            rc += 1

        sub_sections_list = typing.cast(
            list[dict[str, object]], section.get("sub_sections", [])
        )
        sub_nc, sub_rc = await build_sub_sections(
            session, document_id, ch_idx, sec_idx, sec_uid, sub_sections_list
        )
        nc += sub_nc
        rc += sub_rc
    return nc, rc


async def build_sub_sections(
    session: AsyncSession,
    document_id: str,
    ch_idx: int,
    sec_idx: int,
    sec_uid: str,
    sub_sections_list: list[dict[str, object]],
) -> tuple[int, int]:
    nc, rc = 0, 0
    for sub_idx, sub in enumerate(sub_sections_list):
        sub_uid = f"doc_{document_id}_ch_{ch_idx}_sec_{sec_idx}_sub_{sub_idx}"
        await session.run(
            """
            MERGE (ss:SubSection {uid: $uid})
            SET ss.sub_section_number = $number, ss.full_text = $full_text, ss.summary = $summary, ss.node_type = 'subsection', ss.order = $order, ss.content_hash = $hash
            WITH ss MATCH (s:Section {uid: $sec_uid}) MERGE (s)-[:HAS_SUBSECTION]->(ss)
            """,
            uid=sub_uid,
            number=sub.get("sub_section_number", ""),
            full_text=sub.get("full_text", ""),
            summary=sub.get("summary", ""),
            order=sub_idx,
            hash=content_hash(str(sub.get("full_text", ""))),
            sec_uid=sec_uid,
        )
        nc += 1
        rc += 1

        sub_tasks_list = typing.cast(
            list[dict[str, object]], sub.get("compliance_tasks", [])
        )
        for st_idx, stask in enumerate(sub_tasks_list):
            st_uid = f"doc_{document_id}_ch_{ch_idx}_sec_{sec_idx}_sub_{sub_idx}_task_{st_idx}"
            await session.run(
                """
                MERGE (ct:ComplianceTask {uid: $uid})
                SET ct.task = $task, ct.due_logic = $due_logic, ct.severity = $severity, ct.node_type = 'compliance_task', ct.content_hash = $hash
                WITH ct MATCH (ss:SubSection {uid: $sub_uid}) MERGE (ss)-[:HAS_COMPLIANCE_TASK]->(ct)
                """,
                uid=st_uid,
                task=stask.get("task", ""),
                due_logic=stask.get("due_logic", ""),
                severity=stask.get("severity", "medium"),
                hash=content_hash(str(stask.get("task", ""))),
                sub_uid=sub_uid,
            )
            nc += 1
            rc += 1
    return nc, rc


async def create_document_tree(
    document_id: str, extracted_data: dict[str, object]
) -> dict[str, int]:
    """Build the full vectorless RAG tree in Neo4j from extracted data."""
    driver = await get_driver()
    node_count = 0
    rel_count = 0
    now_iso = datetime.now(timezone.utc).isoformat()

    async with driver.session() as session:
        node_count += await build_doc_node(
            session, document_id, extracted_data, now_iso
        )

        nc, rc = await build_definitions(
            session,
            document_id,
            typing.cast(list[dict[str, object]], extracted_data.get("definitions", [])),
        )
        node_count += nc
        rel_count += rc

        nc, rc = await build_chapters(
            session,
            document_id,
            typing.cast(list[dict[str, object]], extracted_data.get("chapters", [])),
        )
        node_count += nc
        rel_count += rc

    logger.info(
        f"Graph tree built: {node_count} nodes, {rel_count} relationships for document {document_id}"
    )
    return {"nodes": node_count, "relationships": rel_count}
