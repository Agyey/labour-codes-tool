import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Legal Knowledge System API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database URL configuring asyncpg
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+asyncpg://ogyey:ogyeyroot@localhost:5432/ogyey_database"
    )
    
    class Config:
        case_sensitive = True

settings = Settings()
