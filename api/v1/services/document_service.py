from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from db.models.document import Document
from api.v1.schemas.document import DocumentCreate, DocumentUpdate

class DocumentService:
    async def create_document(self, db: AsyncSession, obj_in: DocumentCreate) -> Document:
        db_obj = Document(**obj_in.model_dump())
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get_document(self, db: AsyncSession, id: UUID) -> Document | None:
        result = await db.execute(select(Document).where(Document.id == id))
        return result.scalars().first()

    async def get_documents(self, db: AsyncSession, skip: int = 0, limit: int = 100):
        result = await db.execute(select(Document).offset(skip).limit(limit))
        return result.scalars().all()
        
document_service = DocumentService()
