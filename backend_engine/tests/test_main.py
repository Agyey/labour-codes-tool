import pytest
import io
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from src.main import app, run_analysis_task

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

@patch("src.main.db")
def test_list_documents(mock_db, client):
    class MockDoc:
        id = "1"
        name = "test"
        file_name = "test.pdf"
        file_size = 100
        page_count = 1
        status = "uploaded"
        uploaded_at = None
        analyzed_at = None
    mock_db.document.find_many = AsyncMock(return_value=[MockDoc()])
    
    response = client.get("/api/documents")
    assert response.status_code == 200
    assert len(response.json()) == 1

@patch("src.main.db")
def test_get_document_not_found(mock_db, client):
    mock_db.document.find_unique = AsyncMock(return_value=None)
    response = client.get("/api/documents/nonexistent")
    assert response.status_code == 404

@patch("src.main.db")
def test_get_document_found(mock_db, client):
    class MockDoc:
        id = "1"
        name = "test"
        file_name = "test.pdf"
        file_size = 100
        page_count = 1
        status = "uploaded"
        uploaded_at = None
        analyzed_at = None
        
    class MockAnalysis:
        id = "an_1"
        summary = "sum"
        document_type = "act"
        structured_data = {}
        graph_nodes = 1
        graph_relationships = 1
        created_at = None
        
    class MockSuggestion:
        id = "sug_1"
        type = "create_legislation"
        target_module = "db"
        suggested_data = {}
        confidence = 0.9
        status = "pending"
        created_at = None

    mock_db.document.find_unique = AsyncMock(return_value=MockDoc())
    mock_db.documentanalysis.find_first = AsyncMock(return_value=MockAnalysis())
    mock_db.documentsuggestion.find_many = AsyncMock(return_value=[MockSuggestion()])
    
    response = client.get("/api/documents/1")
    assert response.status_code == 200
    assert response.json()["document"]["id"] == "1"

@patch("src.main.db")
@patch("src.main.extract_text_from_pdf")
@patch("src.main.record_audit")
def test_upload_document(mock_audit, mock_extract, mock_db, client):
    mock_extract.return_value = ("raw text", 5)
    mock_audit.return_value = AsyncMock()
    class MockDoc:
        id = "new_doc"
        name = "test"
        file_name = "test.pdf"
        file_size = 100
        status = "uploaded"
    mock_db.document.create = AsyncMock(return_value=MockDoc())
    
    file_content = b"PDF content bytes"
    response = client.post(
        "/api/documents/upload",
        files={"file": ("test.pdf", io.BytesIO(file_content), "application/pdf")}
    )
    assert response.status_code == 200
    assert response.json()["id"] == "new_doc"

@pytest.mark.asyncio
async def test_run_analysis_task(mocker):
    mock_analyze = mocker.patch("src.main.analyze_document", new_callable=AsyncMock)
    mock_build = mocker.patch("src.main.build_graph_and_suggestions", new_callable=AsyncMock)
    mock_db = mocker.patch("src.main.db")
    mock_db.document.update = AsyncMock()
    
    await run_analysis_task("doc1", "text")
    mock_analyze.assert_called_once()
    mock_build.assert_called_once()
    mock_db.document.update.assert_called_once()

@patch("src.main.db")
def test_trigger_analysis(mock_db, client):
    class MockDoc:
        id = "1"
        raw_text = "doc text"
    mock_db.document.find_unique = AsyncMock(return_value=MockDoc())
    mock_db.document.update = AsyncMock()
    
    response = client.post("/api/documents/1/analyze")
    assert response.status_code == 200

@patch("src.main.traverse_for_query")
def test_get_tree(mock_traverse, client):
    mock_traverse.return_value = [{"summary": "s"}]
    response = client.get("/api/documents/1/tree?chapter=I")
    assert response.status_code == 200

@patch("src.main.db")
@patch("src.main.record_audit")
def test_approve_suggestion(mock_audit, mock_db, client):
    class MockSuggestion:
        id = "sug1"
        status = "pending"
        type = "create_provision"
        target_module = "tk"
        suggested_data = {"chapter": "1", "chapter_name": "N", "section": "2", "title": "T", "summary": "S", "full_text": "F"}
        
    mock_db.documentsuggestion.find_unique = AsyncMock(return_value=MockSuggestion())
    mock_db.provision.create = AsyncMock()
    mock_db.documentsuggestion.update = AsyncMock()
    mock_audit.return_value = AsyncMock()
    
    response = client.patch("/api/suggestions/sug1/approve")
    assert response.status_code == 200

@patch("src.main.db")
@patch("src.main.record_audit")
def test_reject_suggestion(mock_audit, mock_db, client):
    class MockSuggestion:
        id = "sug1"
        status = "pending"
        type = "create_provision"
        target_module = "tk"
    
    mock_db.documentsuggestion.find_unique = AsyncMock(return_value=MockSuggestion())
    mock_db.documentsuggestion.update = AsyncMock()
    mock_audit.return_value = AsyncMock()
    
    response = client.patch("/api/suggestions/sug1/reject")
    assert response.status_code == 200

@patch("src.main.verify_chain_integrity")
def test_verify_audit(mock_verify, client):
    mock_verify.return_value = {"valid": True}
    response = client.get("/api/audit/verify")
    assert response.status_code == 200
