from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.shared.pagination import PaginationParams, PaginatedResponse
from .schemas import AuditLogCreate, AuditLogResponse
from .service import AuditLogService

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])

@router.post("/", response_model=APIResponse[AuditLogResponse])
async def create(data: AuditLogCreate, db: AsyncSession = Depends(get_db)):
    obj = await AuditLogService.create(db, data)
    return APIResponse(data=obj, message="Audit log created")

@router.get("/", response_model=APIResponse[PaginatedResponse[AuditLogResponse]])
async def list_logs(
    user_id: Optional[UUID] = None,
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    params: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db)
):
    return APIResponse(data=await AuditLogService.list_logs(db, params, user_id, action, resource_type))
