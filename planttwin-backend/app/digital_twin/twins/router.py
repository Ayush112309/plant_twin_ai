from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from app.core.database.session import get_db
from app.digital_twin.twins.schemas import TwinCreate, TwinUpdate, TwinResponse, TwinStateResponse
from app.digital_twin.twins.service import DigitalTwinService
from app.shared.responses import APIResponse

router = APIRouter(prefix="/twins", tags=["Digital Twins"])
service = DigitalTwinService()

@router.post("", response_model=APIResponse[TwinResponse])
async def create_twin(data: TwinCreate, db: AsyncSession = Depends(get_db)):
    result = await service.create(db, data)
    return APIResponse(data=TwinResponse.model_validate(result))

@router.get("/{id}", response_model=APIResponse[TwinResponse])
async def get_twin(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await service.get(db, id)
    if not result:
        raise HTTPException(status_code=404, detail="Twin not found")
    return APIResponse(data=TwinResponse.model_validate(result))

@router.patch("/{id}", response_model=APIResponse[TwinResponse])
async def update_twin(id: uuid.UUID, data: TwinUpdate, db: AsyncSession = Depends(get_db)):
    result = await service.update(db, id, data)
    return APIResponse(data=TwinResponse.model_validate(result))

@router.get("/{id}/state", response_model=APIResponse[TwinStateResponse])
async def get_twin_state(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await service.get_state(db, id)
    return APIResponse(data=result)

@router.put("/{id}/state", response_model=APIResponse[TwinStateResponse])
async def update_twin_state(id: uuid.UUID, state: dict, db: AsyncSession = Depends(get_db)):
    result = await service.update_state(db, id, state)
    return APIResponse(data=result)

@router.post("/{id}/sync", response_model=APIResponse[TwinStateResponse])
async def sync_twin(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await service.sync_with_telemetry(db, id)
    return APIResponse(data=result)
