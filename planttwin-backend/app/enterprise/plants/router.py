from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.shared.pagination import PaginationParams
from .schemas import PlantCreate, PlantUpdate, PlantResponse
from .service import PlantService

from app.identity.authentication.dependencies import get_current_org_id

router = APIRouter(prefix="/plants", tags=["Plants"])

@router.get("", response_model=APIResponse)
async def list_plants(organization_id: Optional[UUID] = None, current_org_id: Optional[UUID] = Depends(get_current_org_id), pagination: PaginationParams = Depends(), db: AsyncSession = Depends(get_db)):
    service = PlantService(db)
    target_org = organization_id or current_org_id
    plants = await service.list_plants(organization_id=target_org, skip=pagination.offset, limit=pagination.page_size)
    return APIResponse(data=[PlantResponse.model_validate(p).model_dump() for p in plants], message="Plants retrieved successfully")

@router.get("/{plant_id}", response_model=APIResponse)
async def get_plant(plant_id: UUID, db: AsyncSession = Depends(get_db)):
    service = PlantService(db)
    plant = await service.get_by_id(plant_id)
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    return APIResponse(data=PlantResponse.model_validate(plant).model_dump(), message="Plant retrieved successfully")

@router.post("", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_plant(plant_in: PlantCreate, current_org_id: Optional[UUID] = Depends(get_current_org_id), db: AsyncSession = Depends(get_db)):
    if current_org_id and not plant_in.organization_id:
        plant_in.organization_id = current_org_id
    service = PlantService(db)
    plant = await service.create_plant(plant_in)
    return APIResponse(data=PlantResponse.model_validate(plant).model_dump(), message="Plant created successfully", status_code=201)

@router.put("/{plant_id}", response_model=APIResponse)
async def update_plant(plant_id: UUID, plant_in: PlantUpdate, db: AsyncSession = Depends(get_db)):
    service = PlantService(db)
    plant = await service.update_plant(plant_id, plant_in)
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    return APIResponse(data=PlantResponse.model_validate(plant).model_dump(), message="Plant updated successfully")

@router.delete("/{plant_id}", response_model=APIResponse)
async def delete_plant(plant_id: UUID, db: AsyncSession = Depends(get_db)):
    service = PlantService(db)
    success = await service.delete_plant(plant_id)
    if not success:
        raise HTTPException(status_code=404, detail="Plant not found")
    return APIResponse(data=None, message="Plant deleted successfully")
