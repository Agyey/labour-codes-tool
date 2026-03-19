from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import get_db, engine
from .models import Base
from .api import documents, structure, metadata, search
import uvicorn
import os

app = FastAPI(title="Legal Knowledge System API")

# Infrastructure Resilience: CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# @app.on_event("startup")
# def startup():
#     # In production, use Alembic. For quick dev:
#     # Base.metadata.create_all(bind=engine)
#     pass

app.include_router(documents.router)
app.include_router(structure.router)
app.include_router(metadata.router)
app.include_router(search.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Legal Knowledge System API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
