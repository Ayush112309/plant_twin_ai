from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.shared.pagination import PaginationParams
from .schemas import ProductionLineCreate, ProductionLineUpdate, ProductionLineResponse
from .service import ProductionLineService

router = APIRouter(prefix="/production-lines", tags=["Production Lines"])

@router.get("", response_model=APIResponse)
async def list_lines(area_id: Optional[UUID] = None, pagination: PaginationParams = Depends(), db: AsyncSession = Depends(get_db)):
    service = ProductionLineService(db)
    lines = await service.list_lines(area_id=area_id, skip=pagination.skip, limit=pagination.limit)
    return APIResponse(data=[ProductionLineResponse.model_validate(l).model_dump() for l in lines], message="Production Lines retrieved successfully")

@router.get("/{line_id}", response_model=APIResponse)
async def get_line(line_id: UUID, db: AsyncSession = Depends(get_db)):
    service = ProductionLineService(db)
    line = await service.get_by_id(line_id)
    if not line:
        raise HTTPException(status_code=404, detail="Production Line not found")
    return APIResponse(data=ProductionLineResponse.model_validate(line).model_dump(), message="Production Line retrieved successfully")

@router.post("", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_line(line_in: ProductionLineCreate, db: AsyncSession = Depends(get_db)):
    service = ProductionLineService(db)
    line = await service.create_line(line_in)
    return APIResponse(data=ProductionLineResponse.model_validate(line).model_dump(), message="Production Line created successfully", status_code=201)

@router.put("/{line_id}", response_model=APIResponse)
async def update_line(line_id: UUID, line_in: ProductionLineUpdate, db: AsyncSession = Depends(get_db)):
    service = ProductionLineService(db)
    line = await service.update_line(line_id, line_in)
    if not line:
        raise HTTPException(status_code=404, detail="Production Line not found")
    return APIResponse(data=ProductionLineResponse.model_validate(line).model_dump(), message="Production Line updated successfully")

@router.delete("/{line_id}", response_model=APIResponse)
async def delete_line(line_id: UUID, db: AsyncSession = Depends(get_db)):
    service = ProductionLineService(db)
    success = await service.delete_line(line_id)
    if not success:
        raise HTTPException(status_code=404, detail="Production Line not found")
    return APIResponse(data=None, message="Production Line deleted successfully")
