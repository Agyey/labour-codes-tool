"""Neo4j Graph Service — Vectorless RAG Tree Storage.

Every legal document is stored as a hierarchical graph:
  Document → Part → Chapter → Section → SubSection → Clause

Navigation = LLM-guided tree traversal, NOT vector similarity.
"""

import hashlib
from datetime import datetime, timezone

from loguru import logger
from neo4j import AsyncGraphDatabase

from src.settings import settings


_driver = None


async def get_driver():
    """Lazy singleton for the Neo4j async driver."""
    global _driver
    if _driver is None:
        _driver = AsyncGraphDatabase.driver(
            settings.neo4j_uri,
            auth=(settings.neo4j_user, settings.neo4j_password.get_secret_value()),
        )
        # Verify connectivity
        await _driver.verify_connectivity()
        logger.info("Neo4j graph database connected.")
    return _driver


async def close_driver():
    """Gracefully close the Neo4j driver."""
    global _driver
    if _driver is not None:
        await _driver.close()
        _driver = None
        logger.info("Neo4j driver closed.")


def _content_hash(text: str) -> str:
    """SHA-256 hash for content integrity verification."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


async def create_document_tree(document_id: str, extracted_data: dict) -> dict:
    """Build the full vectorless RAG tree in Neo4j from extracted data.

    Returns a summary dict with node/relationship counts.
    """
    driver = await get_driver()
    node_count = 0
    rel_count = 0
    now_iso = datetime.now(timezone.utc).isoformat()

    async with driver.session() as session:
        # 1. Create Document root node
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
            hash=_content_hash(extracted_data.get("summary", "")),
            created_at=now_iso,
            pg_id=document_id,
        )
        node_count += 1

        # 1b. Create Definition nodes
        for def_idx, defn in enumerate(extracted_data.get("definitions", [])):
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
                hash=_content_hash(defn.get("definition", "")),
                doc_uid=f"doc_{document_id}",
            )
            node_count += 1
            rel_count += 1

        # 2. Create Chapter nodes + relationships
        for ch_idx, chapter in enumerate(extracted_data.get("chapters", [])):
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
                hash=_content_hash(chapter.get("summary", "")),
                doc_uid=f"doc_{document_id}",
            )
            node_count += 1
            rel_count += 1

            # 3. Create Section nodes
            for sec_idx, section in enumerate(chapter.get("sections", [])):
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
                    hash=_content_hash(section.get("full_text", "")),
                    ch_uid=ch_uid,
                )
                node_count += 1
                rel_count += 1

                # 3b. Create Section Compliance Task nodes
                for t_idx, task in enumerate(section.get("compliance_tasks", [])):
                    t_uid = f"doc_{document_id}_ch_{ch_idx}_sec_{sec_idx}_task_{t_idx}"
                    await session.run(
                        """
                        MERGE (ct:ComplianceTask {uid: $uid})
                        SET ct.task = $task,
                            ct.due_logic = $due_logic,
                            ct.severity = $severity,
                            ct.node_type = 'compliance_task',
                            ct.content_hash = $hash
                        WITH ct
                        MATCH (s:Section {uid: $sec_uid})
                        MERGE (s)-[:HAS_COMPLIANCE_TASK]->(ct)
                        """,
                        uid=t_uid,
                        task=task.get("task", ""),
                        due_logic=task.get("due_logic", ""),
                        severity=task.get("severity", "medium"),
                        hash=_content_hash(task.get("task", "")),
                        sec_uid=sec_uid,
                    )
                    node_count += 1
                    rel_count += 1

                # 3c. Create Penalty nodes
                for p_idx, penalty in enumerate(section.get("penalties", [])):
                    p_uid = f"doc_{document_id}_ch_{ch_idx}_sec_{sec_idx}_pen_{p_idx}"
                    await session.run(
                        """
                        MERGE (p:Penalty {uid: $uid})
                        SET p.description = $desc,
                            p.fine_amount = $fine,
                            p.imprisonment = $imp,
                            p.node_type = 'penalty',
                            p.content_hash = $hash
                        WITH p
                        MATCH (s:Section {uid: $sec_uid})
                        MERGE (s)-[:HAS_PENALTY]->(p)
                        """,
                        uid=p_uid,
                        desc=penalty.get("description", ""),
                        fine=penalty.get("fine_amount", ""),
                        imp=penalty.get("imprisonment", ""),
                        hash=_content_hash(penalty.get("description", "")),
                        sec_uid=sec_uid,
                    )
                    node_count += 1
                    rel_count += 1

                # 4. Create SubSection nodes
                for sub_idx, sub in enumerate(section.get("sub_sections", [])):
                    sub_uid = (
                        f"doc_{document_id}_ch_{ch_idx}_sec_{sec_idx}_sub_{sub_idx}"
                    )
                    await session.run(
                        """
                        MERGE (ss:SubSection {uid: $uid})
                        SET ss.sub_section_number = $number,
                            ss.full_text = $full_text,
                            ss.summary = $summary,
                            ss.node_type = 'subsection',
                            ss.order = $order,
                            ss.content_hash = $hash
                        WITH ss
                        MATCH (s:Section {uid: $sec_uid})
                        MERGE (s)-[:HAS_SUBSECTION]->(ss)
                        """,
                        uid=sub_uid,
                        number=sub.get("sub_section_number", ""),
                        full_text=sub.get("full_text", ""),
                        summary=sub.get("summary", ""),
                        order=sub_idx,
                        hash=_content_hash(sub.get("full_text", "")),
                        sec_uid=sec_uid,
                    )
                    node_count += 1
                    rel_count += 1

                    # 4b. Create SubSection Compliance Task nodes
                    for st_idx, stask in enumerate(sub.get("compliance_tasks", [])):
                        st_uid = f"doc_{document_id}_ch_{ch_idx}_sec_{sec_idx}_sub_{sub_idx}_task_{st_idx}"
                        await session.run(
                            """
                            MERGE (ct:ComplianceTask {uid: $uid})
                            SET ct.task = $task,
                                ct.due_logic = $due_logic,
                                ct.severity = $severity,
                                ct.node_type = 'compliance_task',
                                ct.content_hash = $hash
                            WITH ct
                            MATCH (ss:SubSection {uid: $sub_uid})
                            MERGE (ss)-[:HAS_COMPLIANCE_TASK]->(ct)
                            """,
                            uid=st_uid,
                            task=stask.get("task", ""),
                            due_logic=stask.get("due_logic", ""),
                            severity=stask.get("severity", "medium"),
                            hash=_content_hash(stask.get("task", "")),
                            sub_uid=sub_uid,
                        )
                        node_count += 1
                        rel_count += 1

    logger.info(
        f"Graph tree built: {node_count} nodes, {rel_count} relationships "
        f"for document {document_id}"
    )
    return {"nodes": node_count, "relationships": rel_count}


async def get_document_tree(document_id: str) -> list[dict]:
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
) -> list[dict]:
    """Vectorless RAG traversal: drill down to specific branch."""
    driver = await get_driver()
    async with driver.session() as session:
        if target_chapter:
            # Drill into a specific chapter
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
            # Level 1: Return all chapter summaries for reasoning
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
