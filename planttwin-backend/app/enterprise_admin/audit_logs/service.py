from uuid import UUID
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from .models import AuditLog
from .schemas import AuditLogCreate
from app.shared.pagination import PaginationParams, PaginatedResponse

class AuditLogService:
    @staticmethod
    async def create(db: AsyncSession, data: AuditLogCreate) -> AuditLog:
        dump = data.model_dump()
        if dump.get("tenant_id"):
            dump["tenant_id"] = str(dump["tenant_id"])
        if dump.get("user_id"):
            dump["user_id"] = str(dump["user_id"])
        obj = AuditLog(**dump)
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def list_logs(db: AsyncSession, params: PaginationParams, user_id: Optional[UUID] = None, action: Optional[str] = None, resource_type: Optional[str] = None) :
        query = select(AuditLog)
        if user_id:
            query = query.where(AuditLog.user_id == str(user_id))
        if action:
            query = query.where(AuditLog.action == action)
        if resource_type:
            query = query.where(AuditLog.resource_type == resource_type)

        total = await db.scalar(select(func.count()).select_from(query.subquery()))
        
        query = query.offset(params.offset).limit(params.page_size).order_by(AuditLog.created_at.desc())
        result = await db.execute(query)
        
        return PaginatedResponse(
            items=result.scalars().all(),
            total=total or 0, page=params.page, size=params.page_size,
            pages=(total + params.page_size - 1) // params.page_size if total else 0
        )
