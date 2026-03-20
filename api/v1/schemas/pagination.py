from typing import Generic, TypeVar, List
from pydantic import BaseModel

T = TypeVar('T')

class PaginatedResponse(BaseModel, Generic[T]):
    """Standardized API response block for generic pagination."""
    data: List[T]
    total: int
    page: int
    per_page: int
