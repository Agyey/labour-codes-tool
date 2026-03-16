from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Strict-typed configuration. All secrets via env vars only."""

    # --- Core ---
    gemini_api_key: SecretStr
    database_url: str

    # --- Graph DB (Neo4j) ---
    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: SecretStr

    # --- Task Queue (Redis / Celery) ---
    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"

    # --- Security ---
    max_upload_size_mb: int = 50
    allowed_file_types: list[str] = [".pdf"]
    rate_limit_rpm: int = 30

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()  # Populated strictly by pydantic-settings from ENV variables
