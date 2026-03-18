from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import get_db, engine
from .models import Base
import uvicorn

app = FastAPI(title="Legal Knowledge System API")

# @app.on_event("startup")
# def startup():
#     # In production, use Alembic. For quick dev:
#     # Base.metadata.create_all(bind=engine)
#     pass

@app.get("/")
def read_root():
    return {"message": "Welcome to the Legal Knowledge System API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
