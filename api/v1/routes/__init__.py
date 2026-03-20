from fastapi import APIRouter
from .documents import router as documents_router
from .structural_units import router as units_router
from .advanced import router as advanced_router
from .search_and_analysis import router as search_router

api_router = APIRouter()
api_router.include_router(documents_router, prefix="/documents", tags=["Documents"])
api_router.include_router(units_router, prefix="/structural-units", tags=["Structural Units"])
api_router.include_router(advanced_router, tags=["Advanced"])
api_router.include_router(search_router, tags=["Search & Analysis"])
