from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from api.database import get_db
from api.v1.schemas.document import DocumentCreate, DocumentInDB
from api.v1.schemas.structural_unit import StructuralUnitTreeNode
from api.v1.services.document_service import document_service
from api.v1.services.structural_unit_service import structural_unit_service

router = APIRouter()

@router.post("/", response_model=DocumentInDB, status_code=201)
async def create_document(doc_in: DocumentCreate, db: AsyncSession = Depends(get_db)):
    return await document_service.create_document(db, doc_in)

@router.get("/{id}", response_model=DocumentInDB)
async def read_document(id: UUID, db: AsyncSession = Depends(get_db)):
    doc = await document_service.get_document(db, id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.get("/", response_model=List[DocumentInDB])
async def read_documents(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await document_service.get_documents(db, skip=skip, limit=limit)

@router.get("/{id}/full-tree", response_model=List[StructuralUnitTreeNode])
async def read_document_tree(id: UUID, db: AsyncSession = Depends(get_db)):
    """Fetch the full structural provision tree (Chapter > Section > Sub-section, etc.)"""
    doc = await document_service.get_document(db, id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return await structural_unit_service.get_document_tree(db, id)
