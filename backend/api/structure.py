from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from .. import models, schemas, database

router = APIRouter(prefix="/structure", tags=["structure"])

@router.post("/", response_model=schemas.StructuralUnit, status_code=status.HTTP_201_CREATED)
def create_structural_unit(unit: schemas.StructuralUnitCreate, db: Session = Depends(database.get_db)):
    db_unit = models.StructuralUnit(**unit.dict())
    db.add(db_unit)
    db.commit()
    db.refresh(db_unit)
    return db_unit

@router.get("/document/{document_id}", response_model=List[schemas.StructuralUnit])
def read_document_structure(document_id: UUID, db: Session = Depends(database.get_db)):
    units = db.query(models.StructuralUnit).filter(models.StructuralUnit.document_id == document_id).order_by(models.StructuralUnit.sort_order).all()
    return units

@router.get("/{unit_id}", response_model=schemas.StructuralUnit)
def read_structural_unit(unit_id: UUID, db: Session = Depends(database.get_db)):
    db_unit = db.query(models.StructuralUnit).filter(models.StructuralUnit.id == unit_id).first()
    if db_unit is None:
        raise HTTPException(status_code=404, detail="Structural Unit not found")
    return db_unit

@router.get("/tree/{document_id}", response_model=List[schemas.StructuralUnitTree])
def read_document_tree(document_id: UUID, db: Session = Depends(database.get_db)):
    # Fetch all units for the document
    units = db.query(models.StructuralUnit).filter(models.StructuralUnit.document_id == document_id).order_by(models.StructuralUnit.sort_order).all()
    
    # Build a dictionary for easy access
    unit_dict = {str(u.id): schemas.StructuralUnitTree.from_orm(u) for u in units}
    tree = []
    
    # Organize into tree
    for unit_id_str, unit_obj in unit_dict.items():
        if unit_obj.parent_id:
            parent_id_str = str(unit_obj.parent_id)
            if parent_id_str in unit_dict:
                unit_dict[parent_id_str].children.append(unit_obj)
            else:
                # Parent might be in another document or context, but usually it's in the same
                tree.append(unit_obj)
        else:
            tree.append(unit_obj)
            
    return tree
