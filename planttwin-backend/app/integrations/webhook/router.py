from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.shared.pagination import PaginationParams, PaginatedResponse
from .schemas import WebhookCreate, WebhookUpdate, WebhookResponse, WebhookTestResult
from .service import WebhookService

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])

@router.post("/", response_model=APIResponse[WebhookResponse])
async def create(data: WebhookCreate, db: AsyncSession = Depends(get_db)):
    obj = await WebhookService.create(db, data)
    return APIResponse(data=obj, message="Webhook created")

@router.get("/{id}", response_model=APIResponse[WebhookResponse])
async def get(id: UUID, db: AsyncSession = Depends(get_db)):
    obj = await WebhookService.get(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Webhook not found")
    return APIResponse(data=obj)

@router.get("/", response_model=APIResponse[PaginatedResponse[WebhookResponse]])
async def list_webhooks(params: PaginationParams = Depends(), db: AsyncSession = Depends(get_db)):
    return APIResponse(data=await WebhookService.list_webhooks(db, params))

@router.get("/by-event/{event_type}", response_model=APIResponse[List[WebhookResponse]])
async def list_by_event(event_type: str, db: AsyncSession = Depends(get_db)):
    hooks = await WebhookService.list_by_event_type(db, event_type)
    return APIResponse(data=hooks)

@router.put("/{id}", response_model=APIResponse[WebhookResponse])
async def update(id: UUID, data: WebhookUpdate, db: AsyncSession = Depends(get_db)):
    obj = await WebhookService.update(db, id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Webhook not found")
    return APIResponse(data=obj, message="Webhook updated")

@router.delete("/{id}", response_model=APIResponse[bool])
async def delete(id: UUID, db: AsyncSession = Depends(get_db)):
    success = await WebhookService.delete(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Webhook not found")
    return APIResponse(data=True, message="Webhook deleted")

@router.post("/{id}/test", response_model=APIResponse[WebhookTestResult])
async def test(id: UUID, db: AsyncSession = Depends(get_db)):
    result = await WebhookService.test_webhook(db, id)
    if not result:
        raise HTTPException(status_code=404, detail="Webhook not found")
    return APIResponse(data=result, message="Webhook tested")
