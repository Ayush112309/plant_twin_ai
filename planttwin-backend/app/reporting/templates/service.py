from uuid import UUID
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from .models import ReportTemplate
from .schemas import ReportTemplateCreate, ReportTemplateUpdate
from app.shared.pagination import PaginationParams, PaginatedResponse

class ReportTemplateService:
    @staticmethod
    async def create(db: AsyncSession, data: ReportTemplateCreate) -> ReportTemplate:
        obj = ReportTemplate(**data.model_dump())
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def get(db: AsyncSession, id: UUID) -> Optional[ReportTemplate]:
        result = await db.execute(select(ReportTemplate).where(ReportTemplate.id == str(id)))
        return result.scalars().first()

    @staticmethod
    async def list_templates(db: AsyncSession, params: PaginationParams) :
        query = select(ReportTemplate)
        total = await db.scalar(select(func.count()).select_from(query.subquery()))
        
        query = query.offset(params.offset).limit(params.page_size)
        result = await db.execute(query)
        
        return PaginatedResponse(
            items=result.scalars().all(),
            total=total or 0, page=params.page, size=params.page_size,
            pages=(total + params.page_size - 1) // params.page_size if total else 0
        )

    @staticmethod
    async def update(db: AsyncSession, id: UUID, data: ReportTemplateUpdate) -> Optional[ReportTemplate]:
        obj = await ReportTemplateService.get(db, id)
        if not obj:
            return None
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(obj, k, v)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def delete(db: AsyncSession, id: UUID) -> bool:
        obj = await ReportTemplateService.get(db, id)
        if not obj:
            return False
        await db.delete(obj)
        await db.commit()
        return True
