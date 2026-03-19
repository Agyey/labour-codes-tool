import pytest
from unittest.mock import AsyncMock, MagicMock
from src.graph_service import (
    get_driver,
    close_driver,
    create_document_tree,
    get_document_tree,
    traverse_for_query,
    _content_hash,
)


@pytest.mark.asyncio
async def test_get_close_driver(mocker):
    # reset global driver manually using mock
    import src.graph_service as gs

    gs._driver = None

    mock_async_driver = mocker.patch("src.graph_service.AsyncGraphDatabase.driver")
    mock_driver_instance = AsyncMock()
    mock_async_driver.return_value = mock_driver_instance

    driver1 = await get_driver()
    driver2 = await get_driver()
    assert driver1 == driver2
    assert gs._driver is not None
    mock_driver_instance.verify_connectivity.assert_called_once()

    await close_driver()
    assert gs._driver is None
    mock_driver_instance.close.assert_called_once()

    # second close should do nothing
    await close_driver()


def test_content_hash():
    h1 = _content_hash("hello")
    h2 = _content_hash("hello")
    assert h1 == h2
    assert len(h1) == 64


@pytest.mark.asyncio
async def test_create_document_tree_full_coverage(mocker):
    mock_driver = AsyncMock()
    mock_session = AsyncMock()
    mock_driver.session = MagicMock()
    mock_driver.session.return_value.__aenter__.return_value = mock_session
    mocker.patch("src.graph_service.get_driver", return_value=mock_driver)

    # Complex nested data to exercise all branches
    data = {
        "name": "Full Act",
        "short_name": "FA",
        "year": 2024,
        "summary": "Full summary",
        "definitions": [
            {"term": "T1", "definition": "D1", "section_ref": "Sec 1"},
            {"term": "T2", "definition": "D2"}
        ],
        "chapters": [
            {
                "chapter_number": "I",
                "chapter_name": "Intro",
                "summary": "Ch1 summary",
                "sections": [
                    {
                        "section_number": "1",
                        "title": "Title 1",
                        "summary": "Sec 1 summary",
                        "full_text": "Text 1",
                        "compliance_tasks": [
                            {"task": "Task 1", "due_logic": "30 days", "severity": "high"}
                        ],
                        "penalties": [
                            {"description": "Penalty 1", "fine_amount": "1000", "imprisonment": "1 year"}
                        ],
                        "sub_sections": [
                            {
                                "sub_section_number": "a",
                                "full_text": "SubText a",
                                "summary": "SubSum a",
                                "compliance_tasks": [
                                    {"task": "SubTask a1", "due_logic": "Immediate"}
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }

    res = await create_document_tree("doc_full", data)
    
    # Node Breakdown:
    # 1 Document
    # 2 Definitions
    # 1 Chapter
    # 1 Section
    # 1 Section Compliance Task
    # 1 Penalty
    # 1 SubSection
    # 1 SubSection Compliance Task
    # Total = 9 nodes? Let's recount.
    # Actually:
    # doc root (1)
    # definition 1 (2), definition 2 (3)
    # chapter 1 (4)
    # section 1 (5)
    # section task 1 (6)
    # penalty 1 (7)
    # subsection a (8)
    # subsection task a1 (9)
    # Total = 9 nodes.
    
    # Relationship Breakdown:
    # doc -> def1, doc -> def2 (2)
    # doc -> ch1 (1)
    # ch1 -> sec1 (1)
    # sec1 -> task1 (1)
    # sec1 -> pen1 (1)
    # sec1 -> sub_a (1)
    # sub_a -> task_a1 (1)
    # Total = 8 relationships.
    
    assert res["nodes"] == 9
    assert res["relationships"] == 8
    assert mock_session.run.call_count == 9 # 1 doc + 2 def + 1 ch + 1 sec + 1 sec_task + 1 pen + 1 sub + 1 sub_task


@pytest.mark.asyncio
async def test_create_document_tree_error_handling(mocker):
    mock_driver = AsyncMock()
    mock_session = AsyncMock()
    mock_driver.session = MagicMock()
    mock_driver.session.return_value.__aenter__.return_value = mock_session
    
    # Simulate an error during Cypher execution
    mock_session.run.side_effect = Exception("Cypher error")
    
    mocker.patch("src.graph_service.get_driver", return_value=mock_driver)
    
    with pytest.raises(Exception, match="Cypher error"):
        await create_document_tree("doc_fail", {"name": "Fail"})


@pytest.mark.asyncio
async def test_traverse_for_query_mocking(mocker):
    mock_driver = AsyncMock()
    mock_session = AsyncMock()

    class MockResult:
        def __init__(self, data):
            self._data = data
        async def __aiter__(self):
            class MRecord:
                def __init__(self, d): self._d = d
                def data(self): return self._d
            for d in self._data:
                yield MRecord(d)

    mock_driver.session = MagicMock()
    mock_driver.session.return_value.__aenter__.return_value = mock_session
    mocker.patch("src.graph_service.get_driver", return_value=mock_driver)

    # Test Global Traversal
    mock_session.run.return_value = MockResult([{"document_summary": "Top", "chapters": []}])
    res = await traverse_for_query("doc_1")
    assert res[0]["document_summary"] == "Top"
    
    # Test Chapter Traversal
    mock_session.run.return_value = MockResult([{"chapter_summary": "Ch", "sections": []}])
    res = await traverse_for_query("doc_1", target_chapter="I")
    assert res[0]["chapter_summary"] == "Ch"
