from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from uuid import UUID

from .. import models, schemas, database

router = APIRouter(prefix="/search", tags=["search"])

@router.get("/provisions", response_model=List[schemas.StructuralUnit])
def search_provisions(
    q: str = Query(..., min_length=1),
    document_id: Optional[UUID] = None,
    unit_type: Optional[str] = None,
    db: Session = Depends(database.get_db)
):
    # Basic sanitization to prevent accidental or malicious character issues in LIKE patterns
    q = q.strip().replace("%", "").replace("_", "")
    
    query = db.query(models.StructuralUnit).filter(
        or_(
            models.StructuralUnit.full_text.ilike(f"%{q}%"),
            models.StructuralUnit.title.ilike(f"%{q}%"),
            models.StructuralUnit.number.ilike(f"%{q}%")
        )
    )
    
    if document_id:
        query = query.filter(models.StructuralUnit.document_id == document_id)
    
    if unit_type:
        query = query.filter(models.StructuralUnit.unit_type == unit_type)
        
    return query.limit(50).all()

@router.get("/documents", response_model=List[schemas.Document])
def search_documents(
    q: str = Query(..., min_length=1),
    year: Optional[int] = None,
    doc_type: Optional[str] = None,
    db: Session = Depends(database.get_db)
):
    # Basic sanitization
    q = q.strip().replace("%", "").replace("_", "")
    
    query = db.query(models.Document).filter(
        or_(
            models.Document.title.ilike(f"%{q}%"),
            models.Document.short_title.ilike(f"%{q}%"),
            models.Document.popular_name.ilike(f"%{q}%")
        )
    )
    
    if year:
        query = query.filter(models.Document.year == year)
    
    if doc_type:
        query = query.filter(models.Document.document_type == doc_type)
        
    return query.limit(50).all()
