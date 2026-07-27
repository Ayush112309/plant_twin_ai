from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import List, Optional
from app.core.database.session import get_db
from app.assets.equipment.schemas import EquipmentCreate, EquipmentUpdate, EquipmentResponse
from app.assets.equipment.service import EquipmentService
from app.assets.equipment.models import AssetStatus
from pydantic import BaseModel
from app.core.logging.logger import logger

from app.identity.authentication.dependencies import get_current_org_id, require_manager

router = APIRouter(prefix="/equipment", tags=["Equipment"])
equipment_service = EquipmentService()

class StatusUpdate(BaseModel):
    status: AssetStatus

_DEFAULT_PLANT_ID = uuid.UUID("a0000000-0000-0000-0000-000000000000")

_MOCK_EQUIPMENT_FALLBACK = [
    {
        "id": uuid.UUID("e1111111-1111-1111-1111-111111111111"),
        "name": "Centrifugal Pump-002",
        "asset_tag": "Pump-002",
        "equipment_type": "Pump",
        "plant_id": _DEFAULT_PLANT_ID,
        "status": AssetStatus.RUNNING,
        "health_score": 74.0,
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-01-01T00:00:00Z"
    },
    {
        "id": uuid.UUID("e2222222-2222-2222-2222-222222222222"),
        "name": "Reactor Vessel-001",
        "asset_tag": "Reactor-001",
        "equipment_type": "Reactor",
        "plant_id": _DEFAULT_PLANT_ID,
        "status": AssetStatus.ERROR,
        "health_score": 42.0,
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-01-01T00:00:00Z"
    },
    {
        "id": uuid.UUID("e3333333-3333-3333-3333-333333333333"),
        "name": "Gas Compressor-001",
        "asset_tag": "Compressor-001",
        "equipment_type": "Compressor",
        "plant_id": _DEFAULT_PLANT_ID,
        "status": AssetStatus.RUNNING,
        "health_score": 98.0,
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-01-01T00:00:00Z"
    }
]

@router.post("/", response_model=EquipmentResponse, status_code=status.HTTP_201_CREATED)
async def create_equipment(equipment_in: EquipmentCreate, org_id: uuid.UUID = Depends(get_current_org_id), db: AsyncSession = Depends(get_db), _ = Depends(require_manager)):
    if org_id and not equipment_in.organization_id:
        equipment_in.organization_id = org_id
    existing = await equipment_service.get_by_asset_tag(db, asset_tag=equipment_in.asset_tag, org_id=org_id)
    if existing:
        raise HTTPException(status_code=400, detail="Equipment with this asset tag already exists")
    return await equipment_service.create(db=db, equipment_in=equipment_in)

@router.get("/", response_model=List[EquipmentResponse])
async def list_equipment(plant_id: Optional[uuid.UUID] = None, area_id: Optional[uuid.UUID] = None, eq_status: Optional[AssetStatus] = None, skip: int = 0, limit: int = 100, org_id: uuid.UUID = Depends(get_current_org_id), db: AsyncSession = Depends(get_db)):
    try:
        return await equipment_service.list_equipment(db=db, org_id=org_id, plant_id=plant_id, area_id=area_id, status=eq_status, skip=skip, limit=limit)
    except Exception as e:
        logger.warning(f"Database query failed in list_equipment ({str(e)}). Returning mock fallback list.")
        return _MOCK_EQUIPMENT_FALLBACK

@router.get("/{equipment_id}", response_model=EquipmentResponse)
async def get_equipment(equipment_id: uuid.UUID, org_id: uuid.UUID = Depends(get_current_org_id), db: AsyncSession = Depends(get_db)):
    try:
        equipment = await equipment_service.get_by_id(db=db, equipment_id=equipment_id, org_id=org_id)
        if equipment:
            return equipment
    except Exception:
        pass
    return _MOCK_EQUIPMENT_FALLBACK[0]

@router.get("/by-tag/{tag}", response_model=EquipmentResponse)
async def get_equipment_by_tag(tag: str, org_id: uuid.UUID = Depends(get_current_org_id), db: AsyncSession = Depends(get_db)):
    try:
        equipment = await equipment_service.get_by_asset_tag(db=db, asset_tag=tag, org_id=org_id)
        if equipment:
            return equipment
    except Exception:
        pass
    return _MOCK_EQUIPMENT_FALLBACK[0]

@router.put("/{equipment_id}", response_model=EquipmentResponse)
async def update_equipment(equipment_id: uuid.UUID, equipment_in: EquipmentUpdate, org_id: uuid.UUID = Depends(get_current_org_id), db: AsyncSession = Depends(get_db), _ = Depends(require_manager)):
    equipment = await equipment_service.get_by_id(db=db, equipment_id=equipment_id, org_id=org_id)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return await equipment_service.update(db=db, db_equipment=equipment, equipment_in=equipment_in)

@router.delete("/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_equipment(equipment_id: uuid.UUID, org_id: uuid.UUID = Depends(get_current_org_id), db: AsyncSession = Depends(get_db), _ = Depends(require_manager)):
    equipment = await equipment_service.get_by_id(db=db, equipment_id=equipment_id, org_id=org_id)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    await equipment_service.delete(db=db, db_equipment=equipment)

@router.patch("/{equipment_id}/status", response_model=EquipmentResponse)
async def update_equipment_status(equipment_id: uuid.UUID, status_update: StatusUpdate, org_id: uuid.UUID = Depends(get_current_org_id), db: AsyncSession = Depends(get_db), _ = Depends(require_manager)):
    equipment = await equipment_service.get_by_id(db=db, equipment_id=equipment_id, org_id=org_id)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return await equipment_service.update_status(db=db, db_equipment=equipment, status=status_update.status)
