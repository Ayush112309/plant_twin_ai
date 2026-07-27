from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.shared.pagination import PaginationParams
from .schemas import AreaCreate, AreaUpdate, AreaResponse
from .service import AreaService

router = APIRouter(prefix="/areas", tags=["Areas"])

@router.get("", response_model=APIResponse)
async def list_areas(plant_id: Optional[UUID] = None, pagination: PaginationParams = Depends(), db: AsyncSession = Depends(get_db)):
    service = AreaService(db)
    areas = await service.list_areas(plant_id=plant_id, skip=pagination.skip, limit=pagination.limit)
    return APIResponse(data=[AreaResponse.model_validate(a).model_dump() for a in areas], message="Areas retrieved successfully")

@router.get("/{area_id}", response_model=APIResponse)
async def get_area(area_id: UUID, db: AsyncSession = Depends(get_db)):
    service = AreaService(db)
    area = await service.get_by_id(area_id)
    if not area:
        raise HTTPException(status_code=404, detail="Area not found")
    return APIResponse(data=AreaResponse.model_validate(area).model_dump(), message="Area retrieved successfully")

@router.post("", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_area(area_in: AreaCreate, db: AsyncSession = Depends(get_db)):
    service = AreaService(db)
    area = await service.create_area(area_in)
    return APIResponse(data=AreaResponse.model_validate(area).model_dump(), message="Area created successfully", status_code=201)

@router.put("/{area_id}", response_model=APIResponse)
async def update_area(area_id: UUID, area_in: AreaUpdate, db: AsyncSession = Depends(get_db)):
    service = AreaService(db)
    area = await service.update_area(area_id, area_in)
    if not area:
        raise HTTPException(status_code=404, detail="Area not found")
    return APIResponse(data=AreaResponse.model_validate(area).model_dump(), message="Area updated successfully")

@router.delete("/{area_id}", response_model=APIResponse)
async def delete_area(area_id: UUID, db: AsyncSession = Depends(get_db)):
    service = AreaService(db)
    success = await service.delete_area(area_id)
    if not success:
        raise HTTPException(status_code=404, detail="Area not found")
    return APIResponse(data=None, message="Area deleted successfully")
