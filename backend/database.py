from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from .models import Base
import os

# Default to local sqlite for initial development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./legal_knowledge.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    # This creates tables if they don't exist (useful for dev)
    # For production, we use Alembic
    Base.metadata.create_all(bind=engine)
