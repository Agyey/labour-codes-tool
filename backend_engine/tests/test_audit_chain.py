import pytest
import json
from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch
from src.audit_chain import get_last_hash, compute_hash, record_audit, verify_chain_integrity

@pytest.fixture
def mock_db(mocker):
    return mocker.patch("src.audit_chain.db")

@pytest.mark.asyncio
async def test_get_last_hash_empty(mock_db):
    mock_db.auditchain.find_first = AsyncMock(return_value=None)
    hash_val = await get_last_hash()
    assert hash_val == "0" * 64

@pytest.mark.asyncio
async def test_get_last_hash_exists(mock_db, mocker):
    class MockEntry:
        current_hash = "mock_hash"
    
    mock_db.auditchain.find_first = AsyncMock(return_value=MockEntry())
    hash_val = await get_last_hash()
    assert hash_val == "mock_hash"

def test_compute_hash():
    h = compute_hash("prev", "act", "type", "id", {}, "timestamp")
    assert isinstance(h, str)
    assert len(h) == 64

@pytest.mark.asyncio
@patch("src.audit_chain.get_last_hash", new_callable=AsyncMock)
async def test_record_audit(mock_get_last, mock_db):
    mock_get_last.return_value = "0" * 64
    mock_db.auditchain.create = AsyncMock()
    
    new_hash = await record_audit("test_action", "doc", "doc1", {"key":"val"})
    assert isinstance(new_hash, str)
    mock_db.auditchain.create.assert_called_once()

@pytest.mark.asyncio
async def test_verify_chain_integrity_valid(mock_db):
    class MockEntry:
        def __init__(self, prev, curr, eid):
            self.previous_hash = prev
            self.current_hash = curr
            self.id = eid
            
    mock_db.auditchain.find_many.return_value = [
        MockEntry("0"*64, "hash1", "id1"),
        MockEntry("hash1", "hash2", "id2"),
    ]
    
    res = await verify_chain_integrity()
    assert res["valid"] is True
    assert res["entries"] == 2
    assert len(res["invalid_entries"]) == 0

@pytest.mark.asyncio
async def test_verify_chain_integrity_empty(mock_db):
    mock_db.auditchain.find_many = AsyncMock(return_value=[])
    res = await verify_chain_integrity()
    assert res["valid"] is True
    assert res["entries"] == 0

@pytest.mark.asyncio
async def test_verify_chain_integrity_invalid(mock_db):
    class MockEntry:
        def __init__(self, prev, curr, eid):
            self.previous_hash = prev
            self.current_hash = curr
            self.id = eid
            
    mock_db.auditchain.find_many.return_value = [
        MockEntry("0"*64, "hash1", "id1"),
        MockEntry("wrong_hash", "hash2", "id2"),
    ]
    
    res = await verify_chain_integrity()
    assert res["valid"] is False
    assert res["entries"] == 2
    assert "id2" in res["invalid_entries"]
