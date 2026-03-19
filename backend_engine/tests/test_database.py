import pytest
from unittest.mock import AsyncMock
from typing import Any
from src.database import connect_db, disconnect_db


@pytest.mark.asyncio
async def test_connect_db_already_connected(mocker: Any) -> None:
    mocker.patch("src.database.Client.is_connected", return_value=True)
    connect_mock = mocker.patch("src.database.Client.connect", new_callable=AsyncMock)
    await connect_db()
    connect_mock.assert_not_called()


@pytest.mark.asyncio
async def test_connect_db_successful(mocker: Any) -> None:
    mocker.patch("src.database.Client.is_connected", return_value=False)
    connect_mock = mocker.patch("src.database.Client.connect", new_callable=AsyncMock)
    await connect_db()
    connect_mock.assert_called_once()


@pytest.mark.asyncio
async def test_connect_db_failure(mocker: Any) -> None:
    mocker.patch("src.database.Client.is_connected", return_value=True)
    disconnect_mock = mocker.patch("src.database.Client.disconnect", new_callable=AsyncMock)
    await disconnect_db()
    disconnect_mock.assert_called_once()


@pytest.mark.asyncio
async def test_disconnect_db_not_connected(mocker: Any) -> None:
    mocker.patch("src.database.Client.is_connected", return_value=False)
    disconnect_mock = mocker.patch("src.database.Client.disconnect", new_callable=AsyncMock)
    await disconnect_db()
    disconnect_mock.assert_not_called()
