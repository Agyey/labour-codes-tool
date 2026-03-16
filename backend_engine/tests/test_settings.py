def test_settings_load():
    # Environment variables are already set by conftest.py
    # So we just load and verify
    from src.settings import Settings

    s = Settings()
    assert s.gemini_api_key.get_secret_value() == "test_gemini"
    assert s.database_url == "postgresql://test:test@localhost:5432/test"
    assert s.neo4j_password.get_secret_value() == "test_neo4j"
    assert s.max_upload_size_mb == 50
