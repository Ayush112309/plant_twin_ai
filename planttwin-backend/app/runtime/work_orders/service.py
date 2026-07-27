from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List, Optional
import datetime
from .models import WorkOrder
from .schemas import WorkOrderCreate, WorkOrderUpdate

class WorkOrderService:
    async def create_work_order(self, db: AsyncSession, data: WorkOrderCreate) -> WorkOrder:
        wo = WorkOrder(**data.model_dump())
        db.add(wo)
        await db.commit()
        await db.refresh(wo)
        return wo

    async def get_work_order(self, db: AsyncSession, wo_id: UUID) -> Optional[WorkOrder]:
        result = await db.execute(select(WorkOrder).where(WorkOrder.id == wo_id))
        return result.scalars().first()

    async def update_work_order(self, db: AsyncSession, wo_id: UUID, data: WorkOrderUpdate) -> Optional[WorkOrder]:
        wo = await self.get_work_order(db, wo_id)
        if wo:
            for key, value in data.model_dump(exclude_unset=True).items():
                setattr(wo, key, value)
            await db.commit()
            await db.refresh(wo)
        return wo
        
    async def update_status(self, db: AsyncSession, wo_id: UUID, status: str) -> Optional[WorkOrder]:
        wo = await self.get_work_order(db, wo_id)
        if wo:
            wo.status = status
            if status == "completed":
                wo.completed_at = datetime.datetime.utcnow()
            await db.commit()
            await db.refresh(wo)
        return wo

    async def assign_work_order(self, db: AsyncSession, wo_id: UUID, user_id: UUID) -> Optional[WorkOrder]:
        wo = await self.get_work_order(db, wo_id)
        if wo:
            wo.assigned_to = user_id
            await db.commit()
            await db.refresh(wo)
        return wo

    async def list_by_status(self, db: AsyncSession, status: str) -> List[WorkOrder]:
        result = await db.execute(select(WorkOrder).where(WorkOrder.status == status))
        return list(result.scalars().all())

    async def list_by_equipment(self, db: AsyncSession, equipment_id: UUID) -> List[WorkOrder]:
        result = await db.execute(select(WorkOrder).where(WorkOrder.equipment_id == equipment_id))
        return list(result.scalars().all())

    async def list_overdue(self, db: AsyncSession) -> List[WorkOrder]:
        result = await db.execute(
            select(WorkOrder).where(
                WorkOrder.status.notin_(["completed", "cancelled"]),
                WorkOrder.due_date < datetime.datetime.utcnow()
            )
        )
        return list(result.scalars().all())
