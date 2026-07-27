from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List, Optional
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from .schemas import WorkOrderCreate, WorkOrderUpdate, WorkOrderResponse
from .service import WorkOrderService

router = APIRouter(prefix="/work-orders", tags=["Runtime - Work Orders"])
service = WorkOrderService()

@router.post("", response_model=APIResponse[WorkOrderResponse])
async def create_work_order(request: WorkOrderCreate, db: AsyncSession = Depends(get_db)):
    result = await service.create_work_order(db, request)
    return APIResponse(data=WorkOrderResponse.model_validate(result))

@router.get("/overdue", response_model=APIResponse[List[WorkOrderResponse]])
async def list_overdue(db: AsyncSession = Depends(get_db)):
    results = await service.list_overdue(db)
    return APIResponse(data=[WorkOrderResponse.model_validate(r) for r in results])

@router.get("", response_model=APIResponse[List[WorkOrderResponse]])
async def list_work_orders(status: Optional[str] = None, equipment_id: Optional[UUID] = None, db: AsyncSession = Depends(get_db)):
    if status:
        results = await service.list_by_status(db, status)
    elif equipment_id:
        results = await service.list_by_equipment(db, equipment_id)
    else:
        # just list all for simplicity in this demo
        results = []
    return APIResponse(data=[WorkOrderResponse.model_validate(r) for r in results])

@router.get("/{id}", response_model=APIResponse[WorkOrderResponse])
async def get_work_order(id: UUID, db: AsyncSession = Depends(get_db)):
    result = await service.get_work_order(db, id)
    if not result:
        raise HTTPException(status_code=404, detail="Work order not found")
    return APIResponse(data=WorkOrderResponse.model_validate(result))

@router.put("/{id}", response_model=APIResponse[WorkOrderResponse])
async def update_work_order(id: UUID, request: WorkOrderUpdate, db: AsyncSession = Depends(get_db)):
    result = await service.update_work_order(db, id, request)
    if not result:
        raise HTTPException(status_code=404, detail="Work order not found")
    return APIResponse(data=WorkOrderResponse.model_validate(result))

@router.patch("/{id}/status", response_model=APIResponse[WorkOrderResponse])
async def update_status(id: UUID, status: str = Query(...), db: AsyncSession = Depends(get_db)):
    result = await service.update_status(db, id, status)
    if not result:
        raise HTTPException(status_code=404, detail="Work order not found")
    return APIResponse(data=WorkOrderResponse.model_validate(result))

@router.patch("/{id}/assign", response_model=APIResponse[WorkOrderResponse])
async def assign_work_order(id: UUID, user_id: UUID = Query(...), db: AsyncSession = Depends(get_db)):
    result = await service.assign_work_order(db, id, user_id)
    if not result:
        raise HTTPException(status_code=404, detail="Work order not found")
    return APIResponse(data=WorkOrderResponse.model_validate(result))
