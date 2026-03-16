import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from src.graph_service import get_driver, close_driver, create_document_tree, get_document_tree, traverse_for_query, _content_hash

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
async def test_create_document_tree(mocker):
    mock_driver = AsyncMock()
    mock_session = AsyncMock()
    mock_driver.session = MagicMock()
    mock_driver.session.return_value.__aenter__.return_value = mock_session
    mock_get_driver = mocker.patch("src.graph_service.get_driver", new_callable=AsyncMock)
    mock_get_driver.return_value = mock_driver
    
    data = {
        "name": "Doc",
        "definitions": [{"term":"A", "definition":"B"}],
        "chapters": [
            {
                "chapter_number": "I",
                "sections": [
                    {
                        "section_number": "1",
                        "compliance_tasks": [{"task":"x"}],
                        "penalties": [{"description": "p"}],
                        "sub_sections": [
                            {"sub_section_number": "a", "compliance_tasks": [{"task":"y"}]}
                        ]
                    }
                ]
            }
        ]
    }
    
    res = await create_document_tree("doc_id", data)
    assert res["nodes"] == 8
    mock_session.run.assert_called()

@pytest.mark.asyncio
async def test_get_document_tree(mocker):
    mock_driver = AsyncMock()
    mock_session = AsyncMock()
    
    class MockResult:
        async def __aiter__(self):
            class MRecord:
                def data(self):
                    return {"result": True}
            yield MRecord()

    mock_session.run.return_value = MockResult()
    mock_driver.session = MagicMock()
    mock_driver.session.return_value.__aenter__.return_value = mock_session
    mocker.patch("src.graph_service.get_driver", return_value=mock_driver)
    
    res = await get_document_tree("doc_id")
    assert len(res) == 1
    assert res[0]["result"] is True

@pytest.mark.asyncio
async def test_traverse_for_query(mocker):
    mock_driver = AsyncMock()
    mock_session = AsyncMock()
    
    class MockResult:
        async def __aiter__(self):
            class MRecord:
                def data(self):
                    return {"sum": "yes"}
            yield MRecord()

    mock_session.run.return_value = MockResult()
    mock_driver.session = MagicMock()
    mock_driver.session.return_value.__aenter__.return_value = mock_session
    mocker.patch("src.graph_service.get_driver", return_value=mock_driver)
    
    # Test branch 1
    res1 = await traverse_for_query("doc_id")
    assert len(res1) == 1
    
    # Test branch 2
    res2 = await traverse_for_query("doc_id", target_chapter="I")
    assert len(res2) == 1
