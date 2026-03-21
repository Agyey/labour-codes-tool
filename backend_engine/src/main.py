"""Document Hub — FastAPI Application.

Endpoints handled by Routers inside src/routers/
"""

import os
import typing
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

from src.database import connect_db, disconnect_db
from src.graph import close_driver
from src.limiter import limiter

from src.routers import (
    document_router,
    pipeline_router,
    suggestion_router,
    audit_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI) -> typing.AsyncGenerator[None, None]:
    """Startup / shutdown lifecycle."""
    logger.add("backend-engine.log", serialize=True, rotation="10 MB")
    await connect_db()
    logger.info("Postgres connected.")
    yield
    await disconnect_db()
    await close_driver()
    logger.info("All connections closed.")


app = FastAPI(
    title="Document Hub API",
    version="0.1.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore[arg-type]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(document_router.router)
app.include_router(pipeline_router.router)
app.include_router(suggestion_router.router)
app.include_router(audit_router.router)


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "document-hub"}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run("src.main:app", host="0.0.0.0", port=port, reload=False)  # nosec B104
