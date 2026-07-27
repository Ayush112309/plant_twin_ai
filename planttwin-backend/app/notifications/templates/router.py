from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Dict, Any
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.shared.pagination import PaginationParams, PaginatedResponse
from .schemas import TemplateCreate, TemplateUpdate, TemplateResponse
from .service import NotificationTemplateService

router = APIRouter(prefix="/notification-templates", tags=["Notification Templates"])

@router.post("/", response_model=APIResponse[TemplateResponse])
async def create(data: TemplateCreate, db: AsyncSession = Depends(get_db)):
    obj = await NotificationTemplateService.create(db, data)
    return APIResponse(data=obj, message="Template created")

@router.get("/{id}", response_model=APIResponse[TemplateResponse])
async def get(id: UUID, db: AsyncSession = Depends(get_db)):
    obj = await NotificationTemplateService.get(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Template not found")
    return APIResponse(data=obj)

@router.get("/", response_model=APIResponse[PaginatedResponse[TemplateResponse]])
async def list_templates(params: PaginationParams = Depends(), db: AsyncSession = Depends(get_db)):
    return APIResponse(data=await NotificationTemplateService.list_templates(db, params))

@router.put("/{id}", response_model=APIResponse[TemplateResponse])
async def update(id: UUID, data: TemplateUpdate, db: AsyncSession = Depends(get_db)):
    obj = await NotificationTemplateService.update(db, id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Template not found")
    return APIResponse(data=obj, message="Template updated")

@router.delete("/{id}", response_model=APIResponse[bool])
async def delete(id: UUID, db: AsyncSession = Depends(get_db)):
    success = await NotificationTemplateService.delete(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Template not found")
    return APIResponse(data=True, message="Template deleted")

@router.post("/{id}/preview", response_model=APIResponse[Dict[str, str]])
async def preview(id: UUID, data: Dict[str, Any] = Body(...), db: AsyncSession = Depends(get_db)):
    preview_data = await NotificationTemplateService.preview(db, id, data)
    if not preview_data:
        raise HTTPException(status_code=404, detail="Template not found")
    return APIResponse(data=preview_data)
