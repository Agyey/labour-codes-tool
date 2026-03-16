import pytest
import os
import sys
from unittest.mock import AsyncMock, MagicMock

os.environ["GEMINI_API_KEY"] = "test_gemini"
os.environ["DATABASE_URL"] = "postgresql://test:test@localhost:5432/test"
os.environ["NEO4J_PASSWORD"] = "test_neo4j"

import google.genai
class MockAioModels:
    generate_content = AsyncMock()
class MockAio:
    models = MockAioModels()
class MockClient:
    def __init__(self, *args, **kwargs):
        self.aio = MockAio()
google.genai.Client = MockClient

import sys
# Create an AsyncMock for Prisma
mock_prisma_instance = AsyncMock()
mock_prisma_instance.is_connected = MagicMock(return_value=False)

class MockPrismaCls:
    def __call__(self, *args, **kwargs):
        return mock_prisma_instance
        
mock_prisma_module = MagicMock()
mock_prisma_module.Prisma = MockPrismaCls()
sys.modules["prisma"] = mock_prisma_module

@pytest.fixture(autouse=True)
def mock_db_connections(mocker):
    mocker.patch("src.graph_service.get_driver", new_callable=AsyncMock)
    mocker.patch("src.graph_service.close_driver", new_callable=AsyncMock)
