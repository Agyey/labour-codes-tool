import pytest
from typing import Any, AsyncGenerator
from unittest.mock import AsyncMock, MagicMock
from src.graph_service import (
    close_driver,
    create_document_tree,
    traverse_for_query,
)


@pytest.mark.asyncio
async def test_get_close_driver(mocker: Any) -> None:
    mock_driver = MagicMock()
    mock_driver.close = MagicMock() 
    mocker.patch("src.graph_service.AsyncGraphDatabase.driver", return_value=mock_driver)
    
    with mocker.patch("src.graph_service._driver", mock_driver):
        await close_driver()
        mock_driver.close.assert_called_once()


@pytest.mark.asyncio
async def test_create_document_tree(mocker: Any) -> None:
    mock_driver = AsyncMock()
    mock_session = AsyncMock()
    mock_driver.session.return_value.__aenter__.return_value = mock_session
    mocker.patch("src.graph_service.get_driver", return_value=mock_driver)

    mock_legislation = MagicMock()
    mock_legislation.id = "leg1"
    mock_legislation.name = "Test Act"
    mock_legislation.summary = "Summary"
    
    chapter = MagicMock()
    chapter.chapter_number = "I"
    chapter.chapter_name = "Ch1"
    chapter.summary = "ChSum"
    
    section = MagicMock()
    section.section_number = "1"
    section.title = "Sec1"
    section.full_text = "Full"
    section.summary = "SecSum"
    
    chapter.sections = [section]
    mock_legislation.chapters = [chapter]
    
    # convert mock to dict if the signature expects dict[str, Any]
    leg_dict = {
        "name": "Test Act",
        "short_name": "TA",
        "year": 2024,
        "summary": "Summary",
        "definitions": [],
        "chapters": [
            {
                "chapter_number": "I",
                "chapter_name": "Ch1",
                "summary": "ChSum",
                "sections": [
                    {
                        "section_number": "1",
                        "title": "Sec1",
                        "full_text": "Full",
                        "summary": "SecSum",
                        "sub_sections": [],
                        "compliance_tasks": [],
                        "penalties": []
                    }
                ]
            }
        ]
    }

    # PASS BOTH document_id and extracted_data
    await create_document_tree("leg1", leg_dict)
    assert mock_session.run.called


@pytest.mark.asyncio
async def test_get_graph_and_suggestions(mocker: Any) -> None:
    mock_driver = AsyncMock()
    mock_session = AsyncMock()

    class MRecord:
        def __init__(self, d: dict[str, Any]) -> None:
            self._d = d
        def data(self) -> dict[str, Any]:
            return self._d

    class MockResult:
        def __init__(self, data: list[dict[str, Any]]) -> None:
            self._data = data
        def __aiter__(self) -> AsyncGenerator[MRecord, None]:
            async def gen() -> AsyncGenerator[MRecord, None]:
                for d in self._data:
                    yield MRecord(d)
                return
            return gen()

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
