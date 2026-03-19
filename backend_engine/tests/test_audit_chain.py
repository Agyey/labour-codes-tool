import pytest
from typing import Any
from unittest.mock import AsyncMock, MagicMock
from src.audit_chain import record_audit, verify_chain_integrity


@pytest.fixture
def mock_db(mocker: Any) -> Any:
    return mocker.patch("src.audit_chain.db")


@pytest.mark.asyncio
async def test_record_audit_first_entry(mock_db: Any) -> None:
    mock_db.auditchain.find_first.return_value = None
    mock_db.auditchain.create.return_value = MagicMock(current_hash="hash1")

    res = await record_audit("UPLOAD", "DOCUMENT", "doc1", {"file": "test.pdf"})
    assert res == "hash1"
    mock_db.auditchain.create.assert_called_once()
    args = mock_db.auditchain.create.call_args[1]["data"]
    assert args["previous_hash"] == "0" * 64


@pytest.mark.asyncio
async def test_record_audit_subsequent_entry(mock_db: Any) -> None:
    mock_db.auditchain.find_first.return_value = MagicMock(current_hash="prev_hash")
    mock_db.auditchain.create.return_value = MagicMock(current_hash="new_hash")

    res = await record_audit("ANALYZE", "DOCUMENT", "doc1", {})
    assert res == "new_hash"
    args = mock_db.auditchain.create.call_args[1]["data"]
    assert args["previous_hash"] == "prev_hash"


@pytest.mark.asyncio
async def test_verify_chain_integrity_valid(mock_db: Any) -> None:
    class MockEntry:
        def __init__(self, prev: str, curr: str, eid: str) -> None:
            self.previous_hash = prev
            self.current_hash = curr
            self.id = eid

    mock_db.auditchain.find_many.return_value = [
        MockEntry("0" * 64, "hash1", "id1"),
        MockEntry("hash1", "hash2", "id2"),
    ]

    res = await verify_chain_integrity()
    assert res["valid"] is True
    assert res["entries"] == 2
    assert len(res["invalid_entries"]) == 0


@pytest.mark.asyncio
async def test_verify_chain_integrity_empty(mock_db: Any) -> None:
    mock_db.auditchain.find_many = AsyncMock(return_value=[])
    res = await verify_chain_integrity()
    assert res["valid"] is True
    assert res["entries"] == 0


@pytest.mark.asyncio
async def test_verify_chain_integrity_invalid(mock_db: Any) -> None:
    class MockEntry:
        def __init__(self, prev: str, curr: str, eid: str) -> None:
            self.previous_hash = prev
            self.current_hash = curr
            self.id = eid

    mock_db.auditchain.find_many.return_value = [
        MockEntry("0" * 64, "hash1", "id1"),
        MockEntry("wrong_hash", "hash2", "id2"),
    ]

    res = await verify_chain_integrity()
    assert res["valid"] is False
    assert res["entries"] == 2
    assert "id2" in res["invalid_entries"]
