from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid
from typing import List
from app.assets.asset_history.models import AssetHistory
from app.assets.asset_history.schemas import HistoryCreate

class HistoryService:
    async def list_by_equipment(self, db: AsyncSession, equipment_id: uuid.UUID, org_id: uuid.UUID) -> List[AssetHistory]:
        result = await db.execute(select(AssetHistory).filter(AssetHistory.equipment_id == equipment_id, AssetHistory.organization_id == org_id).order_by(AssetHistory.created_at.desc()))
        return result.scalars().all()

    async def create(self, db: AsyncSession, history_in: HistoryCreate) -> AssetHistory:
        db_history = AssetHistory(**history_in.model_dump())
        db.add(db_history)
        await db.commit()
        await db.refresh(db_history)
        return db_history
