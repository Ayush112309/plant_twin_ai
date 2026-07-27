from uuid import UUID
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from .models import NotificationChannel
from .schemas import ChannelCreate, ChannelUpdate
from app.shared.pagination import PaginationParams, PaginatedResponse

class NotificationChannelService:
    @staticmethod
    async def create(db: AsyncSession, data: ChannelCreate) -> NotificationChannel:
        obj = NotificationChannel(**data.model_dump())
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def get(db: AsyncSession, id: UUID) -> Optional[NotificationChannel]:
        result = await db.execute(select(NotificationChannel).where(NotificationChannel.id == str(id)))
        return result.scalars().first()

    @staticmethod
    async def list_channels(db: AsyncSession, params: PaginationParams) :
        query = select(NotificationChannel)
        total = await db.scalar(select(func.count()).select_from(query.subquery()))
        
        query = query.offset(params.offset).limit(params.page_size)
        result = await db.execute(query)
        
        return PaginatedResponse(
            items=result.scalars().all(),
            total=total or 0, page=params.page, size=params.page_size,
            pages=(total + params.page_size - 1) // params.page_size if total else 0
        )

    @staticmethod
    async def update(db: AsyncSession, id: UUID, data: ChannelUpdate) -> Optional[NotificationChannel]:
        obj = await NotificationChannelService.get(db, id)
        if not obj:
            return None
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(obj, k, v)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def delete(db: AsyncSession, id: UUID) -> bool:
        obj = await NotificationChannelService.get(db, id)
        if not obj:
            return False
        await db.delete(obj)
        await db.commit()
        return True

    @staticmethod
    async def test_channel(db: AsyncSession, id: UUID) -> bool:
        obj = await NotificationChannelService.get(db, id)
        if not obj:
            return False
        # Mock logic
        return True
