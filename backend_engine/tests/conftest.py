import pytest
import os
from typing import Any
from unittest.mock import AsyncMock, MagicMock

os.environ["GEMINI_API_KEY"] = "test_gemini"
os.environ["DATABASE_URL"] = "postgresql://user:pass@localhost:5432/db"
os.environ["NEO4J_URI"] = "bolt://localhost:7687"
os.environ["NEO4J_USER"] = "neo4j"
os.environ["NEO4J_PASSWORD"] = "password"


@pytest.fixture
def mock_db_connections(mocker: Any) -> None:
    mocker.patch("src.database.db.connect", new_callable=AsyncMock)
    mocker.patch("src.database.db.disconnect", new_callable=AsyncMock)


@pytest.fixture(autouse=True)
def mock_settings(mocker: Any) -> Any:
    mock = MagicMock()
    mock.GEMINI_API_KEY = "test_gemini"
    mock.DATABASE_URL = "postgresql://user:pass@localhost:5432/db"
    mock.NEO4J_URI = "bolt://localhost:7687"
    mock.NEO4J_USER = "neo4j"
    mock.NEO4J_PASSWORD = "password"
    return mocker.patch("src.settings.settings", mock)


@pytest.fixture
def mock_db_client(mocker: Any) -> Any:
    return mocker.patch("src.database.db")
