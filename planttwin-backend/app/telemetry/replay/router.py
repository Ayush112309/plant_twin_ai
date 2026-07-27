from fastapi import APIRouter, Depends, Query
from typing import List
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from .service import TelemetryReplayService

router = APIRouter(prefix="/replay", tags=["Telemetry Replay"])


@router.get("/frames")
async def get_replay_frames(
    tags: List[str] = Query(...),
    start_hours_ago: int = 24,
    speed: float = 1.0,
    db: AsyncSession = Depends(get_db)
):
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(hours=start_hours_ago)
    data = await TelemetryReplayService.get_replay_stream(db, tags, start_time, end_time, speed)
    return APIResponse.success(data=data, message="Replay frames generated successfully")
