from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from .. import models, schemas, database

router = APIRouter(prefix="/metadata", tags=["metadata"])

# --- Definitions ---

@router.post("/definitions", response_model=schemas.Definition, status_code=status.HTTP_201_CREATED)
def create_definition(definition: schemas.DefinitionCreate, db: Session = Depends(database.get_db)):
    db_definition = models.Definition(**definition.dict())
    db.add(db_definition)
    db.commit()
    db.refresh(db_definition)
    return db_definition

@router.get("/definitions/document/{document_id}", response_model=List[schemas.Definition])
def read_document_definitions(document_id: UUID, db: Session = Depends(database.get_db)):
    definitions = db.query(models.Definition).filter(models.Definition.document_id == document_id).all()
    return definitions

# --- Cross References ---

@router.post("/references", response_model=schemas.CrossReference, status_code=status.HTTP_201_CREATED)
def create_cross_reference(reference: schemas.CrossReferenceCreate, db: Session = Depends(database.get_db)):
    db_reference = models.CrossReference(**reference.dict())
    db.add(db_reference)
    db.commit()
    db.refresh(db_reference)
    return db_reference

@router.get("/references/unit/{unit_id}", response_model=List[schemas.CrossReference])
def read_unit_references(unit_id: UUID, db: Session = Depends(database.get_db)):
    references = db.query(models.CrossReference).filter(models.CrossReference.source_unit_id == unit_id).all()
    return references
