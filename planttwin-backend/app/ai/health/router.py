from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from .schemas import HealthScoreRequest, HealthScoreResponse
from .service import HealthScoringService

router = APIRouter(prefix="/health", tags=["AI - Health Scoring"])
service = HealthScoringService()

@router.post("/calculate/{equipment_id}", response_model=APIResponse[HealthScoreResponse])
async def calculate_score(equipment_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await service.calculate_health_score(db, equipment_id)
    return APIResponse(data=HealthScoreResponse.model_validate(result))

@router.get("/score/{equipment_id}", response_model=APIResponse[HealthScoreResponse])
async def get_latest_score(equipment_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await service.get_latest_score(db, equipment_id)
    if not result:
        raise HTTPException(status_code=404, detail="No health score found for this equipment")
    return APIResponse(data=HealthScoreResponse.model_validate(result))

@router.get("/history/{equipment_id}", response_model=APIResponse[List[HealthScoreResponse]])
async def get_score_history(equipment_id: UUID, db: AsyncSession = Depends(get_db)):
    results = await service.get_score_history(db, equipment_id)
    return APIResponse(data=[HealthScoreResponse.model_validate(r) for r in results])
