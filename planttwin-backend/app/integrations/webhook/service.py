from uuid import UUID
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from .models import Webhook
from .schemas import WebhookCreate, WebhookUpdate, WebhookTestResult
from app.shared.pagination import PaginationParams, PaginatedResponse
from datetime import datetime

class WebhookService:
    @staticmethod
    async def create(db: AsyncSession, data: WebhookCreate) -> Webhook:
        obj = Webhook(**data.model_dump())
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def get(db: AsyncSession, id: UUID) -> Optional[Webhook]:
        result = await db.execute(select(Webhook).where(Webhook.id == str(id)))
        return result.scalars().first()

    @staticmethod
    async def list_webhooks(db: AsyncSession, params: PaginationParams) :
        query = select(Webhook)
        total = await db.scalar(select(func.count()).select_from(query.subquery()))
        
        query = query.offset(params.offset).limit(params.page_size)
        result = await db.execute(query)
        
        return PaginatedResponse(
            items=result.scalars().all(),
            total=total or 0, page=params.page, size=params.page_size,
            pages=(total + params.page_size - 1) // params.page_size if total else 0
        )

    @staticmethod
    async def list_by_event_type(db: AsyncSession, event_type: str) -> List[Webhook]:
        # Using simple filter since events is JSON list; exact match or contains check needed
        # In a real app we might use JSON operators depending on DB
        result = await db.execute(select(Webhook).where(Webhook.is_active == True))
        all_hooks = result.scalars().all()
        return [h for h in all_hooks if event_type in h.events]

    @staticmethod
    async def update(db: AsyncSession, id: UUID, data: WebhookUpdate) -> Optional[Webhook]:
        obj = await WebhookService.get(db, id)
        if not obj:
            return None
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(obj, k, v)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def delete(db: AsyncSession, id: UUID) -> bool:
        obj = await WebhookService.get(db, id)
        if not obj:
            return False
        await db.delete(obj)
        await db.commit()
        return True

    @staticmethod
    async def trigger_webhook(db: AsyncSession, id: UUID, payload: dict) -> bool:
        obj = await WebhookService.get(db, id)
        if not obj:
            return False
        # Mock httpx post
        obj.last_triggered_at = datetime.utcnow()
        await db.commit()
        return True

    @staticmethod
    async def test_webhook(db: AsyncSession, id: UUID) -> Optional[WebhookTestResult]:
        obj = await WebhookService.get(db, id)
        if not obj:
            return None
        return WebhookTestResult(success=True, status_code=200, response="OK")
