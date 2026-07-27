from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from .schemas import AlarmCreate, AlarmUpdate, AlarmResponse, AlarmTriggerEvent, AlarmAcknowledge
from .service import AlarmService

from app.identity.authentication.dependencies import get_current_active_user, require_manager, require_role
from app.shared.enums import UserRole

router = APIRouter(prefix="/alarms", tags=["Runtime - Alarms"])
service = AlarmService()

require_alarm_manager = require_role(UserRole.SYSTEM_ADMIN, UserRole.CONTROL_OPERATOR, UserRole.MAINTENANCE_MANAGER, UserRole.PLANT_MANAGER)
require_system_ingest = require_role(UserRole.SYSTEM_ADMIN, UserRole.CONTROL_OPERATOR)

@router.post("", response_model=APIResponse[AlarmResponse], dependencies=[Depends(require_manager)])
async def create_alarm(request: AlarmCreate, db: AsyncSession = Depends(get_db)):
    result = await service.create_alarm(db, request)
    return APIResponse(data=AlarmResponse.model_validate(result))

@router.get("/active", response_model=APIResponse[List[AlarmResponse]], dependencies=[Depends(get_current_active_user)])
async def list_active_alarms(db: AsyncSession = Depends(get_db)):
    results = await service.list_active_alarms(db)
    return APIResponse(data=[AlarmResponse.model_validate(r) for r in results])

@router.get("/history", response_model=APIResponse[List[AlarmResponse]], dependencies=[Depends(get_current_active_user)])
async def list_alarm_history(db: AsyncSession = Depends(get_db)):
    results = await service.list_alarm_history(db)
    return APIResponse(data=[AlarmResponse.model_validate(r) for r in results])

@router.get("/{id}", response_model=APIResponse[AlarmResponse], dependencies=[Depends(get_current_active_user)])
async def get_alarm(id: UUID, db: AsyncSession = Depends(get_db)):
    result = await service.get_alarm(db, id)
    if not result:
        raise HTTPException(status_code=404, detail="Alarm not found")
    return APIResponse(data=AlarmResponse.model_validate(result))

@router.put("/{id}", response_model=APIResponse[AlarmResponse], dependencies=[Depends(require_manager)])
async def update_alarm(id: UUID, request: AlarmUpdate, db: AsyncSession = Depends(get_db)):
    result = await service.update_alarm(db, id, request)
    if not result:
        raise HTTPException(status_code=404, detail="Alarm not found")
    return APIResponse(data=AlarmResponse.model_validate(result))

@router.post("/{id}/evaluate", response_model=APIResponse[AlarmResponse], dependencies=[Depends(require_system_ingest)])
async def evaluate_alarm(id: UUID, event: AlarmTriggerEvent, db: AsyncSession = Depends(get_db)):
    result = await service.evaluate_alarm(db, id, event.value)
    if not result:
        raise HTTPException(status_code=404, detail="Alarm not found or inactive")
    return APIResponse(data=AlarmResponse.model_validate(result))

@router.post("/{id}/acknowledge", response_model=APIResponse[AlarmResponse], dependencies=[Depends(require_alarm_manager)])
async def acknowledge_alarm(id: UUID, ack: AlarmAcknowledge, db: AsyncSession = Depends(get_db)):
    result = await service.acknowledge_alarm(db, id, ack.user_id)
    if not result:
        raise HTTPException(status_code=404, detail="Alarm not found")
    return APIResponse(data=AlarmResponse.model_validate(result))
