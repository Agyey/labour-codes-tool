import pytest
from unittest.mock import AsyncMock, patch
from src.database import connect_db, disconnect_db, db

@pytest.mark.asyncio
async def test_connect_db_already_connected(mocker):
    mocker.patch.object(db, "is_connected", return_value=True)
    connect_mock = mocker.patch.object(db, "connect", new_callable=AsyncMock)
    await connect_db()
    connect_mock.assert_not_called()

@pytest.mark.asyncio
async def test_connect_db_not_connected(mocker):
    mocker.patch.object(db, "is_connected", return_value=False)
    connect_mock = mocker.patch.object(db, "connect", new_callable=AsyncMock)
    await connect_db()
    connect_mock.assert_called_once()

@pytest.mark.asyncio
async def test_disconnect_db_connected(mocker):
    mocker.patch.object(db, "is_connected", return_value=True)
    disconnect_mock = mocker.patch.object(db, "disconnect", new_callable=AsyncMock)
    await disconnect_db()
    disconnect_mock.assert_called_once()

@pytest.mark.asyncio
async def test_disconnect_db_not_connected(mocker):
    mocker.patch.object(db, "is_connected", return_value=False)
    disconnect_mock = mocker.patch.object(db, "disconnect", new_callable=AsyncMock)
    await disconnect_db()
    disconnect_mock.assert_not_called()
