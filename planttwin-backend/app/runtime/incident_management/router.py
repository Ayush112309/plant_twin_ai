from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from .schemas import IncidentCreate, IncidentUpdate, IncidentResponse
from .service import IncidentService

router = APIRouter(prefix="/incidents", tags=["Runtime - Incident Management"])
service = IncidentService()

@router.post("", response_model=APIResponse[IncidentResponse])
async def create_incident(request: IncidentCreate, db: AsyncSession = Depends(get_db)):
    result = await service.create_incident(db, request)
    return APIResponse(data=IncidentResponse.model_validate(result))

@router.get("", response_model=APIResponse[List[IncidentResponse]])
async def list_incidents(db: AsyncSession = Depends(get_db)):
    results = await service.list_incidents(db)
    return APIResponse(data=[IncidentResponse.model_validate(r) for r in results])

@router.get("/{id}", response_model=APIResponse[IncidentResponse])
async def get_incident(id: UUID, db: AsyncSession = Depends(get_db)):
    result = await service.get_incident(db, id)
    if not result:
        raise HTTPException(status_code=404, detail="Incident not found")
    return APIResponse(data=IncidentResponse.model_validate(result))

@router.put("/{id}", response_model=APIResponse[IncidentResponse])
async def update_incident(id: UUID, request: IncidentUpdate, db: AsyncSession = Depends(get_db)):
    result = await service.update_incident(db, id, request)
    if not result:
        raise HTTPException(status_code=404, detail="Incident not found")
    return APIResponse(data=IncidentResponse.model_validate(result))

@router.patch("/{id}/status", response_model=APIResponse[IncidentResponse])
async def update_status(id: UUID, status: str = Query(...), db: AsyncSession = Depends(get_db)):
    result = await service.update_status(db, id, status)
    if not result:
        raise HTTPException(status_code=404, detail="Incident not found")
    return APIResponse(data=IncidentResponse.model_validate(result))
