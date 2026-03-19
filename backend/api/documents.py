from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from loguru import logger

from .. import models, schemas, database

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/", response_model=schemas.Document, status_code=status.HTTP_201_CREATED)
def create_document(document: schemas.DocumentCreate, db: Session = Depends(database.get_db)):
    logger.info(f"Creating new document: {document.title}")
    db_document = models.Document(**document.dict())
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    logger.info(f"Document created with ID: {db_document.id}")
    return db_document

@router.get("/", response_model=List[schemas.Document])
def read_documents(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    documents = db.query(models.Document).offset(skip).limit(limit).all()
    return documents

@router.get("/{document_id}", response_model=schemas.Document)
def read_document(document_id: UUID, db: Session = Depends(database.get_db)):
    db_document = db.query(models.Document).filter(models.Document.id == document_id).first()
    if db_document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return db_document

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: UUID, db: Session = Depends(database.get_db)):
    logger.info(f"Attempting to delete document with ID: {document_id}")
    db_document = db.query(models.Document).filter(models.Document.id == document_id).first()
    if db_document is None:
        logger.warning(f"Delete failed: Document {document_id} not found")
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(db_document)
    db.commit()
    logger.info(f"Successfully deleted document {document_id}")
    return None
