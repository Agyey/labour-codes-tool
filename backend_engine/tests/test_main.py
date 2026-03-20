import pytest
import io
from typing import Any, Generator
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient
from src.main import app


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    mock_db = MagicMock()
    # Mock common Prisma model accessors to return AsyncMocks
    mock_db.connect = AsyncMock()
    mock_db.disconnect = AsyncMock()
    mock_db.is_connected = MagicMock(return_value=True)
    
    mock_db.document = MagicMock()
    mock_db.document.find_many = AsyncMock(return_value=[])
    mock_db.document.find_unique = AsyncMock(return_value=None)
    mock_db.document.create = AsyncMock()
    mock_db.document.update = AsyncMock()
    mock_db.document.delete = AsyncMock()
    
    mock_db.processingjob = MagicMock()
    mock_db.processingjob.find_many = AsyncMock(return_value=[])
    mock_db.processingjob.find_unique = AsyncMock(return_value=None)
    mock_db.processingjob.create = AsyncMock()
    mock_db.processingjob.update = AsyncMock()
    
    mock_db.documentsuggestion = MagicMock()
    mock_db.documentsuggestion.find_many = AsyncMock(return_value=[])
    mock_db.documentsuggestion.find_unique = AsyncMock(return_value=None)
    mock_db.documentsuggestion.update = AsyncMock()
    mock_db.documentsuggestion.delete_many = AsyncMock()
    
    mock_db.documentanalysis = MagicMock()
    mock_db.documentanalysis.delete_many = AsyncMock()
    
    with (
        patch("src.database.db", mock_db),
        patch("src.main.record_audit", new_callable=AsyncMock),
        patch("src.main.run_pipeline_background", new_callable=AsyncMock),
        patch("src.main.connect_db", new_callable=AsyncMock),
        patch("src.main.disconnect_db", new_callable=AsyncMock),
        TestClient(app) as c,
    ):
        yield c


def test_health_check(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@patch("src.main.db")
def test_list_documents(mock_db: Any, client: TestClient) -> None:
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
    mock_db.processingjob.find_many = AsyncMock(return_value=[])

    response = client.get("/api/documents")
    assert response.status_code == 200
    assert len(response.json()) == 1


@patch("src.main.db")
def test_get_document_not_found(mock_db: Any, client: TestClient) -> None:
    mock_db.document.find_unique = AsyncMock(return_value=None)
    response = client.get("/api/documents/nonexistent")
    assert response.status_code == 404


@patch("src.main.db")
def test_get_document_found(mock_db: Any, client: TestClient) -> None:
    class MockDoc:
        id = "1"
        name = "test"
        file_name = "test.pdf"
        file_size = 100
        page_count = 1
        status = "uploaded"
        raw_text = "some text"
        uploaded_at = None
        analyzed_at = None

    class MockAnalysis:
        id = "an_1"
        summary = "sum"
        document_type = "act"
        structured_data: dict[str, Any] = {}
        graph_nodes = 1
        graph_relationships = 1
        created_at = None

    class MockSuggestion:
        id = "sug_1"
        type = "create_legislation"
        target_module = "db"
        suggested_data: dict[str, Any] = {}
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
@patch("src.main.extract_document_text")
def test_upload_document(
    mock_extract: Any, mock_db: Any, client: TestClient
) -> None:
    mock_extract.return_value = ("raw text", 5)

    class MockDoc:
        id = "new_doc"
        name = "test"
        file_name = "test.pdf"
        file_size = 100
        status = "uploaded"

    class MockJob:
        id = "job_1"
        document_id = "new_doc"
        status = "queued"

    mock_db.document.create = AsyncMock(return_value=MockDoc())
    mock_db.processingjob.create = AsyncMock(return_value=MockJob())

    file_content = b"PDF content bytes"
    response = client.post(
        "/api/pipeline/ingest",
        files={"file": ("test.pdf", io.BytesIO(file_content), "application/pdf")},
    )
    assert response.status_code == 200
    assert response.json()["id"] == "new_doc"


def test_upload_document_no_filename(client: TestClient) -> None:
    response = client.post(
        "/api/pipeline/ingest",
        files={"file": ("", io.BytesIO(b""), "application/pdf")},
    )
    assert response.status_code in (400, 422)


def test_upload_document_bad_extension(client: TestClient) -> None:
    response = client.post(
        "/api/pipeline/ingest",
        files={"file": ("test.exe", io.BytesIO(b""), "application/octet-stream")},
    )
    assert response.status_code == 400


@patch("src.main.settings")
def test_upload_document_too_large(mock_settings: Any, client: TestClient) -> None:
    mock_settings.allowed_file_types = [".pdf"]
    mock_settings.max_upload_size_mb = 0.0001
    response = client.post(
        "/api/pipeline/ingest",
        files={"file": ("test.pdf", io.BytesIO(b"A" * 1024 * 1024), "application/pdf")},
    )
    assert response.status_code == 413


@patch("src.main.extract_document_text")
def test_upload_document_exception(mock_extract: Any, client: TestClient) -> None:
    mock_extract.side_effect = Exception("test error")
    response = client.post(
        "/api/pipeline/ingest",
        files={"file": ("test.pdf", io.BytesIO(b"PDF content"), "application/pdf")},
    )
    assert response.status_code == 500


@patch("src.main.db")
def test_trigger_analysis(mock_db: Any, client: TestClient) -> None:
    class MockDoc:
        id = "1"
        raw_text = "doc text"
        status = "uploaded"

    mock_db.document.find_unique = AsyncMock(return_value=MockDoc())
    mock_db.document.update = AsyncMock()

    response = client.post("/api/documents/1/analyze")
    assert response.status_code == 200


@patch("src.main.db")
def test_trigger_analysis_not_found(mock_db: Any, client: TestClient) -> None:
    mock_db.document.find_unique = AsyncMock(return_value=None)
    response = client.post("/api/documents/x/analyze")
    assert response.status_code == 404


@patch("src.main.db")
def test_trigger_analysis_no_text(mock_db: Any, client: TestClient) -> None:
    class MockDocEmpty:
        id = "2"
        raw_text = None

    mock_db.document.find_unique = AsyncMock(return_value=MockDocEmpty())
    response = client.post("/api/documents/2/analyze")
    assert response.status_code == 400


@patch("src.main.traverse_for_query")
def test_get_tree(mock_traverse: Any, client: TestClient) -> None:
    mock_traverse.return_value = [{"summary": "s"}]

    # Branch 1
    response = client.get("/api/documents/1/tree?chapter=I")
    assert response.status_code == 200

    # Branch 2
    response_no_query = client.get("/api/documents/1/tree")
    assert response_no_query.status_code == 200


@patch("src.main.traverse_for_query")
def test_get_tree_exception(mock_traverse: Any, client: TestClient) -> None:
    mock_traverse.side_effect = Exception("tree error")
    response = client.get("/api/documents/1/tree")
    assert response.status_code == 500


@patch("src.main.db")
def test_approve_suggestion(mock_db: Any, client: TestClient) -> None:
    class MockSuggestion:
        id = "sug1"
        status = "pending"
        type = "create_provision"
        target_module = "tk"
        suggested_data = {
            "chapter": "1",
            "chapter_name": "N",
            "section": "2",
            "title": "T",
            "summary": "S",
            "full_text": "F",
        }

    mock_db.documentsuggestion.find_unique = AsyncMock(return_value=MockSuggestion())
    mock_db.provision.create = AsyncMock()
    mock_db.documentsuggestion.update = AsyncMock()

    response = client.patch("/api/suggestions/sug1/approve")
    assert response.status_code == 200


@patch("src.main.db")
def test_approve_suggestion_not_found(mock_db: Any, client: TestClient) -> None:
    mock_db.documentsuggestion.find_unique = AsyncMock(return_value=None)
    response = client.patch("/api/suggestions/invalid/approve")
    assert response.status_code == 404


@patch("src.main.db")
def test_approve_suggestion_not_pending(mock_db: Any, client: TestClient) -> None:
    class MockSuggestionDone:
        status = "approved"

    mock_db.documentsuggestion.find_unique = AsyncMock(
        return_value=MockSuggestionDone()
    )
    response = client.patch("/api/suggestions/sug2/approve")
    assert response.status_code == 400


@patch("src.main.db")
def test_approve_suggestion_legislation_no_framework(
    mock_db: Any, client: TestClient
) -> None:
    class MockSuggestionLegis:
        status = "pending"
        type = "create_legislation"
        target_module = "kb"
        suggested_data = {"name": "Act"}

    mock_db.documentsuggestion.find_unique = AsyncMock(
        return_value=MockSuggestionLegis()
    )
    response = client.patch("/api/suggestions/sug3/approve")
    assert response.status_code == 400


@patch("src.main.db")
def test_approve_suggestion_all_types(
    mock_db: Any, client: TestClient
) -> None:
    types = [
        ("create_legislation", "?framework_id=f1"),
        ("create_compliance_item", "?provision_id=p1"),
        ("create_penalty", ""),
        ("create_definition", ""),
        ("flag_repeal", ""),
    ]

    for t_idx, (t_name, t_query) in enumerate(types):

        class MockSuggestionAny:
            id = f"sug_{t_idx}"
            status = "pending"
            type = t_name
            target_module = "tm"
            suggested_data = {
                "name": "n",
                "short_name": "sn",
                "year": "2024",
                "task": "t",
                "due_logic": "d",
            }

        mock_db.documentsuggestion.find_unique = AsyncMock(
            return_value=MockSuggestionAny()
        )
        mock_db.legislation.create = AsyncMock()
        mock_db.complianceitem.create = AsyncMock()
        mock_db.documentsuggestion.update = AsyncMock()

        res = client.patch(f"/api/suggestions/sug_{t_idx}/approve{t_query}")
        assert res.status_code == 200


@patch("src.main.db")
def test_approve_suggestion_exception(mock_db: Any, client: TestClient) -> None:
    class MockSuggestion:
        status = "pending"
        type = "create_legislation"
        target_module = "tm"
        suggested_data: dict[str, Any] = {}

    mock_db.documentsuggestion.find_unique = AsyncMock(return_value=MockSuggestion())
    mock_db.legislation.create = AsyncMock(side_effect=Exception("create error"))
    response = client.patch("/api/suggestions/err/approve?framework_id=1")
    assert response.status_code == 500


@patch("src.main.db")
def test_reject_suggestion(mock_db: Any, client: TestClient) -> None:
    class MockSuggestion:
        id = "sug1"
        status = "pending"
        type = "create_provision"
        target_module = "tk"

    mock_db.documentsuggestion.find_unique = AsyncMock(return_value=MockSuggestion())
    mock_db.documentsuggestion.update = AsyncMock()

    response = client.patch("/api/suggestions/sug1/reject")
    assert response.status_code == 200


@patch("src.main.db")
def test_reject_suggestion_not_found(mock_db: Any, client: TestClient) -> None:
    mock_db.documentsuggestion.find_unique = AsyncMock(return_value=None)
    response = client.patch("/api/suggestions/none/reject")
    assert response.status_code == 404


@patch("src.main.verify_chain_integrity")
def test_verify_audit(mock_verify: Any, client: TestClient) -> None:
    mock_verify.return_value = {"valid": True}
    response = client.get("/api/audit/verify")
    assert response.status_code == 200


@patch("src.main.db")
def test_delete_document(mock_db: Any, client: TestClient) -> None:
    class MockDoc:
        id = "doc_del"
        name = "ToDelete"
        file_name = "del.pdf"

    mock_db.document.find_unique = AsyncMock(return_value=MockDoc())
    mock_db.documentsuggestion.delete_many = AsyncMock()
    mock_db.documentanalysis.delete_many = AsyncMock()
    mock_db.document.delete = AsyncMock()

    response = client.delete("/api/documents/doc_del")
    assert response.status_code == 200
    assert response.json()["id"] == "doc_del"
    mock_db.document.delete.assert_called_once()


@patch("src.main.db")
def test_delete_document_not_found(mock_db: Any, client: TestClient) -> None:
    mock_db.document.find_unique = AsyncMock(return_value=None)
    response = client.delete("/api/documents/missing")
    assert response.status_code == 404


@patch("src.main.db")
def test_cancel_analysis(mock_db: Any, client: TestClient) -> None:
    class MockDoc:
        id = "doc_cancel"
        status = "analyzing"

    mock_db.document.find_unique = AsyncMock(return_value=MockDoc())
    mock_db.document.update = AsyncMock()

    response = client.patch("/api/documents/doc_cancel/cancel")
    assert response.status_code == 200
    assert response.json()["status"] == "uploaded"
    mock_db.document.update.assert_called_once()


@patch("src.main.db")
def test_cancel_analysis_not_found(mock_db: Any, client: TestClient) -> None:
    mock_db.document.find_unique = AsyncMock(return_value=None)
    response = client.patch("/api/documents/x/cancel")
    assert response.status_code == 404


@patch("src.main.db")
def test_cancel_analysis_wrong_status(mock_db: Any, client: TestClient) -> None:
    class MockDoc:
        status = "uploaded"

    mock_db.document.find_unique = AsyncMock(return_value=MockDoc())
    response = client.patch("/api/documents/y/cancel")
    assert response.status_code == 400


@patch("src.main.db")
@patch("src.main._stream_reader")
def test_stream_analysis(mock_reader: Any, mock_db: Any, client: TestClient) -> None:
    class MockDoc:
        id = "s1"
        raw_text = "text"
        status = "analyzing"

    mock_db.document.find_unique = AsyncMock(return_value=MockDoc())
    mock_db.document.update = AsyncMock()

    from collections.abc import AsyncGenerator

    async def mock_gen(*args: Any, **kwargs: Any) -> AsyncGenerator[str, None]:
        yield "event: progress\\ndata: {}\\n\\n"

    mock_reader.side_effect = mock_gen

    response = client.get("/api/documents/s1/analyze/stream")
    assert response.status_code == 200
    assert response.headers.get("content-type") == "text/event-stream; charset=utf-8"


@patch("src.main.db")
@patch("src.main._stream_reader")
def test_stream_analysis_error(
    mock_reader: Any, mock_db: Any, client: TestClient
) -> None:
    class MockDoc:
        id = "s1"
        raw_text = "text"
        status = "analyzing"

    mock_db.document.find_unique = AsyncMock(return_value=MockDoc())
    mock_db.document.update = AsyncMock()

    from collections.abc import AsyncGenerator

    async def mock_gen(*args: Any, **kwargs: Any) -> AsyncGenerator[str, None]:
        yield "event: error\\ndata: Simulated streaming error\\n\\n"

    mock_reader.side_effect = mock_gen

    response = client.get("/api/documents/s1/analyze/stream")
    assert response.status_code == 200
