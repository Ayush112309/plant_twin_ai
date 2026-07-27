from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
from datetime import datetime
from app.digital_twin.twins.models import DigitalTwin
from app.digital_twin.twins.schemas import TwinCreate, TwinUpdate, TwinStateResponse

class DigitalTwinService:
    async def create(self, db: AsyncSession, data: TwinCreate) -> DigitalTwin:
        db_obj = DigitalTwin(**data.model_dump())
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get(self, db: AsyncSession, twin_id: uuid.UUID) -> DigitalTwin:
        stmt = select(DigitalTwin).where(DigitalTwin.id == twin_id)
        result = await db.execute(stmt)
        return result.scalars().first()

    async def update(self, db: AsyncSession, twin_id: uuid.UUID, data: TwinUpdate) -> DigitalTwin:
        db_obj = await self.get(db, twin_id)
        if db_obj:
            for key, value in data.model_dump(exclude_unset=True).items():
                setattr(db_obj, key, value)
            await db.commit()
            await db.refresh(db_obj)
        return db_obj

    async def get_state(self, db: AsyncSession, twin_id: uuid.UUID) -> TwinStateResponse:
        db_obj = await self.get(db, twin_id)
        if db_obj:
            return TwinStateResponse(twin_id=db_obj.id, state=db_obj.state, last_synced_at=db_obj.last_synced_at)
        return None

    async def update_state(self, db: AsyncSession, twin_id: uuid.UUID, partial_state: dict) -> TwinStateResponse:
        db_obj = await self.get(db, twin_id)
        if db_obj:
            current_state = db_obj.state or {}
            current_state.update(partial_state)
            db_obj.state = current_state
            db_obj.last_synced_at = datetime.utcnow()
            await db.commit()
            await db.refresh(db_obj)
            return TwinStateResponse(twin_id=db_obj.id, state=db_obj.state, last_synced_at=db_obj.last_synced_at)
        return None

    async def sync_with_telemetry(self, db: AsyncSession, twin_id: uuid.UUID) -> TwinStateResponse:
        # Mock logic to pull latest telemetry
        return await self.update_state(db, twin_id, {"status": "synced", "health": 100})
