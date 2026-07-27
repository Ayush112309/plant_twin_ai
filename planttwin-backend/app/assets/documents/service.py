from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid
from typing import List, Optional
from app.assets.documents.models import AssetDocument
from app.assets.documents.schemas import DocumentCreate, DocumentUpdate

class DocumentService:
    async def get_by_id(self, db: AsyncSession, doc_id: uuid.UUID, org_id: uuid.UUID) -> Optional[AssetDocument]:
        result = await db.execute(select(AssetDocument).filter(AssetDocument.id == doc_id, AssetDocument.organization_id == org_id))
        return result.scalars().first()

    async def list_by_equipment(self, db: AsyncSession, equipment_id: uuid.UUID, org_id: uuid.UUID) -> List[AssetDocument]:
        result = await db.execute(select(AssetDocument).filter(AssetDocument.equipment_id == equipment_id, AssetDocument.organization_id == org_id))
        return result.scalars().all()

    async def create(self, db: AsyncSession, doc_in: DocumentCreate) -> AssetDocument:
        db_doc = AssetDocument(**doc_in.model_dump())
        db.add(db_doc)
        await db.commit()
        await db.refresh(db_doc)
        return db_doc

    async def update(self, db: AsyncSession, db_doc: AssetDocument, doc_in: DocumentUpdate) -> AssetDocument:
        update_data = doc_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_doc, field, value)
        await db.commit()
        await db.refresh(db_doc)
        return db_doc

    async def delete(self, db: AsyncSession, db_doc: AssetDocument) -> None:
        await db.delete(db_doc)
        await db.commit()
