from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from .schemas import PredictionRequest, PredictionResponse
from .service import PredictionService

router = APIRouter(prefix="/predictions", tags=["AI - Predictions"])
service = PredictionService()

@router.post("/generate", response_model=APIResponse[PredictionResponse])
async def generate_prediction(request: PredictionRequest, db: AsyncSession = Depends(get_db)):
    result = await service.generate_prediction(db, request)
    return APIResponse(data=PredictionResponse.model_validate(result))

@router.get("/{equipment_id}", response_model=APIResponse[List[PredictionResponse]])
async def list_predictions(equipment_id: UUID, db: AsyncSession = Depends(get_db)):
    results = await service.list_predictions(db, equipment_id)
    return APIResponse(data=[PredictionResponse.model_validate(r) for r in results])
