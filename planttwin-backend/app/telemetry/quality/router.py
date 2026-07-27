from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database.session import get_db
from app.telemetry.quality.schemas import QualityCheckRequest, QualityStats
from app.telemetry.quality.service import DataQualityService
from app.telemetry.ingestion.models import QualityCode
from app.shared.responses import APIResponse
from datetime import datetime
import uuid

router = APIRouter(prefix="/quality", tags=["Telemetry Quality"])
service = DataQualityService()

@router.post("/check", response_model=APIResponse[QualityCode])
async def check_quality(req: QualityCheckRequest):
    result = service.check_quality(req.value, req.sensor_config)
    return APIResponse(data=result)

@router.get("/stats/{sensor_id}", response_model=APIResponse[QualityStats])
async def get_quality_stats(sensor_id: uuid.UUID, start_time: datetime, end_time: datetime, db: AsyncSession = Depends(get_db)):
    result = await service.get_quality_stats(db, sensor_id, start_time, end_time)
    return APIResponse(data=result)
