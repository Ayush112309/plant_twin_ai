from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid
from typing import List, Optional
from app.connectivity.tag_mapping.models import TagMapping
from app.connectivity.tag_mapping.schemas import TagMappingCreate, TagMappingUpdate

class TagMappingService:
    async def get_by_id(self, db: AsyncSession, mapping_id: uuid.UUID) -> Optional[TagMapping]:
        result = await db.execute(select(TagMapping).filter(TagMapping.id == mapping_id))
        return result.scalars().first()

    async def list_by_connector(self, db: AsyncSession, connector_id: uuid.UUID) -> List[TagMapping]:
        result = await db.execute(select(TagMapping).filter(TagMapping.connector_id == connector_id))
        return result.scalars().all()

    async def create(self, db: AsyncSession, mapping_in: TagMappingCreate) -> TagMapping:
        db_mapping = TagMapping(**mapping_in.model_dump())
        db.add(db_mapping)
        await db.commit()
        await db.refresh(db_mapping)
        return db_mapping

    async def bulk_create(self, db: AsyncSession, mappings_in: List[TagMappingCreate]) -> List[TagMapping]:
        db_mappings = [TagMapping(**m.model_dump()) for m in mappings_in]
        db.add_all(db_mappings)
        await db.commit()
        for m in db_mappings:
            await db.refresh(m)
        return db_mappings

    async def update(self, db: AsyncSession, db_mapping: TagMapping, mapping_in: TagMappingUpdate) -> TagMapping:
        update_data = mapping_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_mapping, field, value)
        await db.commit()
        await db.refresh(db_mapping)
        return db_mapping

    async def delete(self, db: AsyncSession, db_mapping: TagMapping) -> None:
        await db.delete(db_mapping)
        await db.commit()
