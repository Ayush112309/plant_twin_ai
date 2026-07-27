from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
from app.digital_twin.snapshots.models import TwinSnapshot
from app.digital_twin.snapshots.schemas import SnapshotCreate
from app.digital_twin.twins.service import DigitalTwinService

class SnapshotService:
    def __init__(self):
        self.twin_service = DigitalTwinService()

    async def capture_snapshot(self, db: AsyncSession, data: SnapshotCreate) -> TwinSnapshot:
        twin = await self.twin_service.get(db, data.twin_id)
        if not twin:
            return None
        
        db_obj = TwinSnapshot(
            twin_id=data.twin_id,
            reason=data.reason,
            triggered_by=data.triggered_by,
            snapshot_data=twin.state or {}
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def list_by_twin(self, db: AsyncSession, twin_id: uuid.UUID) -> list[TwinSnapshot]:
        stmt = select(TwinSnapshot).where(TwinSnapshot.twin_id == twin_id)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_snapshot(self, db: AsyncSession, snapshot_id: uuid.UUID) -> TwinSnapshot:
        stmt = select(TwinSnapshot).where(TwinSnapshot.id == snapshot_id)
        result = await db.execute(stmt)
        return result.scalars().first()

    async def compare_snapshots(self, db: AsyncSession, id1: uuid.UUID, id2: uuid.UUID) -> dict:
        snap1 = await self.get_snapshot(db, id1)
        snap2 = await self.get_snapshot(db, id2)
        
        if not snap1 or not snap2:
            return {}
            
        # Basic diff mock
        return {
            "diff": "mock_diff",
            "snapshot1_keys": list(snap1.snapshot_data.keys()),
            "snapshot2_keys": list(snap2.snapshot_data.keys())
        }
