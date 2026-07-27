from uuid import UUID
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from .models import Tenant
from .schemas import TenantCreate, TenantUpdate
from app.shared.pagination import PaginationParams, PaginatedResponse

class TenantService:
    @staticmethod
    async def create(db: AsyncSession, data: TenantCreate) -> Tenant:
        obj = Tenant(**data.model_dump())
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def get(db: AsyncSession, id: UUID) -> Optional[Tenant]:
        result = await db.execute(select(Tenant).where(Tenant.id == str(id)))
        return result.scalars().first()

    @staticmethod
    async def list_tenants(db: AsyncSession, params: PaginationParams) :
        query = select(Tenant)
        total = await db.scalar(select(func.count()).select_from(query.subquery()))
        
        query = query.offset(params.offset).limit(params.page_size)
        result = await db.execute(query)
        
        return PaginatedResponse(
            items=result.scalars().all(),
            total=total or 0, page=params.page, size=params.page_size,
            pages=(total + params.page_size - 1) // params.page_size if total else 0
        )

    @staticmethod
    async def update(db: AsyncSession, id: UUID, data: TenantUpdate) -> Optional[Tenant]:
        obj = await TenantService.get(db, id)
        if not obj:
            return None
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(obj, k, v)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def delete(db: AsyncSession, id: UUID) -> bool:
        obj = await TenantService.get(db, id)
        if not obj:
            return False
        await db.delete(obj)
        await db.commit()
        return True

    @staticmethod
    async def set_status(db: AsyncSession, id: UUID, status: str) -> Optional[Tenant]:
        obj = await TenantService.get(db, id)
        if not obj:
            return None
        obj.status = status
        await db.commit()
        await db.refresh(obj)
        return obj
