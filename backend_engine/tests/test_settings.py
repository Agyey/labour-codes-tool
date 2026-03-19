def test_settings_load() -> None:
    # Environment variables are already set by conftest.py
    # So we just load and verify
    from src.settings import Settings

    s = Settings()
    assert s.gemini_api_key.get_secret_value() == "test_gemini"
    assert (
        s.database_url.get_secret_value()
        == "postgresql://user:pass@localhost:5432/db"
    )
    assert s.neo4j_password.get_secret_value() == "password"
    assert s.max_upload_size_mb == 50
