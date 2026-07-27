from uuid import UUID
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from .models import Dashboard
from .schemas import DashboardCreate, DashboardUpdate
from app.shared.pagination import PaginationParams, PaginatedResponse

class DashboardService:
    @staticmethod
    async def create(db: AsyncSession, data: DashboardCreate, owner_id: Optional[UUID] = None) -> Dashboard:
        obj = Dashboard(**data.model_dump(), owner_id=str(owner_id) if owner_id else None)
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def get(db: AsyncSession, id: UUID) -> Optional[Dashboard]:
        result = await db.execute(select(Dashboard).where(Dashboard.id == str(id)))
        return result.scalars().first()

    @staticmethod
    async def list_dashboards(db: AsyncSession, params: PaginationParams) :
        query = select(Dashboard)
        total = await db.scalar(select(func.count()).select_from(query.subquery()))
        
        query = query.offset(params.offset).limit(params.page_size)
        result = await db.execute(query)
        
        return PaginatedResponse(
            items=result.scalars().all(),
            total=total or 0, page=params.page, size=params.page_size,
            pages=(total + params.page_size - 1) // params.page_size if total else 0
        )

    @staticmethod
    async def update(db: AsyncSession, id: UUID, data: DashboardUpdate) -> Optional[Dashboard]:
        obj = await DashboardService.get(db, id)
        if not obj:
            return None
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(obj, k, v)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def delete(db: AsyncSession, id: UUID) -> bool:
        obj = await DashboardService.get(db, id)
        if not obj:
            return False
        await db.delete(obj)
        await db.commit()
        return True
        
    @staticmethod
    async def clone_dashboard(db: AsyncSession, id: UUID, new_owner_id: Optional[UUID] = None) -> Optional[Dashboard]:
        obj = await DashboardService.get(db, id)
        if not obj:
            return None
        cloned = Dashboard(
            name=f"Copy of {obj.name}",
            description=obj.description,
            layout=obj.layout,
            widgets=obj.widgets,
            owner_id=str(new_owner_id) if new_owner_id else obj.owner_id,
            is_shared=False,
            is_default=False
        )
        db.add(cloned)
        await db.commit()
        await db.refresh(cloned)
        return cloned
