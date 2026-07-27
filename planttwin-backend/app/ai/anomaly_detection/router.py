from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List, Optional
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from .schemas import AnomalyDetectionRequest, AnomalyDetectionResponse, AnomalyEventResponse
from .service import AnomalyDetectionService

router = APIRouter(prefix="/anomaly-detection", tags=["AI - Anomaly Detection"])
service = AnomalyDetectionService()

@router.post("/analyze", response_model=APIResponse[AnomalyDetectionResponse])
async def analyze_data(request: AnomalyDetectionRequest, db: AsyncSession = Depends(get_db)):
    result = await service.detect_anomalies(db, request)
    return APIResponse(data=result, message="Anomaly detection completed successfully")

@router.get("/events", response_model=APIResponse[List[AnomalyEventResponse]])
async def list_events(sensor_id: Optional[UUID] = None, db: AsyncSession = Depends(get_db)):
    events = await service.list_events(db, sensor_id)
    return APIResponse(data=[AnomalyEventResponse.model_validate(e) for e in events])

@router.patch("/events/{id}/acknowledge", response_model=APIResponse[AnomalyEventResponse])
async def acknowledge_event(id: UUID, user_id: str = Query(..., description="User acknowledging"), db: AsyncSession = Depends(get_db)):
    event = await service.acknowledge_event(db, id, user_id)
    if not event:
        raise HTTPException(status_code=404, detail="Anomaly event not found")
    return APIResponse(data=AnomalyEventResponse.model_validate(event))
