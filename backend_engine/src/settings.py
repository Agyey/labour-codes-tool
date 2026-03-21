from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Strict-typed configuration. All secrets via env vars only."""

    # --- Core ---
    gemini_api_key: SecretStr
    database_url: SecretStr

    # --- Graph DB (Neo4j) ---
    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: SecretStr

    # --- Task Queue (Redis / Celery) ---
    redis_url: str = "redis://localhost:6379/0"

    @property
    def celery_broker_url(self) -> str:
        import urllib.parse

        parsed = urllib.parse.urlparse(self.redis_url)
        return str(urllib.parse.urlunparse(parsed._replace(path="/1")))

    @property
    def celery_result_backend(self) -> str:
        import urllib.parse

        parsed = urllib.parse.urlparse(self.redis_url)
        return str(urllib.parse.urlunparse(parsed._replace(path="/2")))

    # --- Security ---
    allowed_file_types: list[str] = [
        ".pdf",
        ".docx",
        ".doc",
        ".xlsx",
        ".xls",
        ".txt",
        ".csv",
    ]
    rate_limit_rpm: int = 60
    max_upload_size_mb: int = 50

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()  # Populated strictly by pydantic-settings from ENV variables
