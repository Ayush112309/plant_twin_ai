from uuid import UUID
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from .models import NotificationTemplate
from .schemas import TemplateCreate, TemplateUpdate
from app.shared.pagination import PaginationParams, PaginatedResponse

class NotificationTemplateService:
    @staticmethod
    async def create(db: AsyncSession, data: TemplateCreate) -> NotificationTemplate:
        obj = NotificationTemplate(**data.model_dump())
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def get(db: AsyncSession, id: UUID) -> Optional[NotificationTemplate]:
        result = await db.execute(select(NotificationTemplate).where(NotificationTemplate.id == str(id)))
        return result.scalars().first()

    @staticmethod
    async def list_templates(db: AsyncSession, params: PaginationParams) :
        query = select(NotificationTemplate)
        total = await db.scalar(select(func.count()).select_from(query.subquery()))
        
        query = query.offset(params.offset).limit(params.page_size)
        result = await db.execute(query)
        
        return PaginatedResponse(
            items=result.scalars().all(),
            total=total or 0, page=params.page, size=params.page_size,
            pages=(total + params.page_size - 1) // params.page_size if total else 0
        )

    @staticmethod
    async def update(db: AsyncSession, id: UUID, data: TemplateUpdate) -> Optional[NotificationTemplate]:
        obj = await NotificationTemplateService.get(db, id)
        if not obj:
            return None
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(obj, k, v)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def delete(db: AsyncSession, id: UUID) -> bool:
        obj = await NotificationTemplateService.get(db, id)
        if not obj:
            return False
        await db.delete(obj)
        await db.commit()
        return True

    @staticmethod
    async def preview(db: AsyncSession, id: UUID, data: Dict[str, Any]) -> Optional[Dict[str, str]]:
        obj = await NotificationTemplateService.get(db, id)
        if not obj:
            return None
        return {
            "subject": obj.subject_template.format(**data) if "{" in obj.subject_template else obj.subject_template,
            "body": obj.body_template.format(**data) if "{" in obj.body_template else obj.body_template
        }
