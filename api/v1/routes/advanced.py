from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from api.database import get_db
from api.v1.schemas.definition import DefinitionCreate, DefinitionInDB
from api.v1.schemas.cross_reference import CrossReferenceCreate, CrossReferenceInDB
from api.v1.schemas.compliance import ComplianceObligationCreate, ComplianceObligationInDB
from api.v1.schemas.bulk_import import BulkImportPayload, BulkImportResult
from api.v1.services.advanced_service import (
    definition_service, cross_reference_service,
    compliance_service, bulk_import_service
)

router = APIRouter()

# ─── Definitions ──────────────────────────────────────────────

@router.get("/documents/{doc_id}/definitions", response_model=List[DefinitionInDB], tags=["Definitions"])
async def list_definitions(doc_id: UUID, db: AsyncSession = Depends(get_db)):
    return await definition_service.get_by_document(db, doc_id)

@router.post("/definitions", response_model=DefinitionInDB, status_code=201, tags=["Definitions"])
async def create_definition(obj_in: DefinitionCreate, db: AsyncSession = Depends(get_db)):
    return await definition_service.create(db, obj_in)

# ─── Cross References ────────────────────────────────────────

@router.get("/structural-units/{unit_id}/cross-references", response_model=List[CrossReferenceInDB], tags=["Cross References"])
async def list_cross_refs(unit_id: UUID, db: AsyncSession = Depends(get_db)):
    return await cross_reference_service.get_by_source(db, unit_id)

@router.post("/cross-references", response_model=CrossReferenceInDB, status_code=201, tags=["Cross References"])
async def create_cross_ref(obj_in: CrossReferenceCreate, db: AsyncSession = Depends(get_db)):
    return await cross_reference_service.create(db, obj_in)

# ─── Compliance Obligations ──────────────────────────────────

@router.get("/structural-units/{unit_id}/compliance", response_model=List[ComplianceObligationInDB], tags=["Compliance"])
async def list_compliance(unit_id: UUID, db: AsyncSession = Depends(get_db)):
    return await compliance_service.get_by_unit(db, unit_id)

@router.post("/compliance", response_model=ComplianceObligationInDB, status_code=201, tags=["Compliance"])
async def create_compliance(obj_in: ComplianceObligationCreate, db: AsyncSession = Depends(get_db)):
    return await compliance_service.create(db, obj_in)

# ─── Bulk Import ─────────────────────────────────────────────

@router.post("/documents/import", response_model=BulkImportResult, status_code=201, tags=["Import"])
async def bulk_import_document(payload: BulkImportPayload, db: AsyncSession = Depends(get_db)):
    """
    One-shot endpoint to import a full document with its structural tree and definitions.
    This is the primary ingestion point from the Extractor Agent (Agent 0).
    """
    doc_id, units, defs = await bulk_import_service.import_document(db, payload)
    return BulkImportResult(
        document_id=doc_id,
        units_created=units,
        definitions_created=defs,
        message=f"Successfully imported {units} structural units and {defs} definitions."
    )
