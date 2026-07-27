from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime
import uuid
from app.telemetry.ingestion.models import TelemetryData, QualityCode
from app.telemetry.quality.schemas import QualityStats

class DataQualityService:
    def check_quality(self, value: float, sensor_config: dict) -> QualityCode:
        min_val = sensor_config.get("min_value")
        max_val = sensor_config.get("max_value")
        
        if min_val is not None and value < min_val:
            return QualityCode.BAD
        if max_val is not None and value > max_val:
            return QualityCode.BAD
            
        return QualityCode.GOOD

    async def get_quality_stats(self, db: AsyncSession, sensor_id: uuid.UUID, start_time: datetime, end_time: datetime) -> QualityStats:
        stmt = select(TelemetryData.quality, func.count(TelemetryData.id)).where(
            and_(
                TelemetryData.sensor_id == sensor_id,
                TelemetryData.timestamp >= start_time,
                TelemetryData.timestamp <= end_time
            )
        ).group_by(TelemetryData.quality)
        
        result = await db.execute(stmt)
        counts = dict(result.all())
        
        good = counts.get(QualityCode.GOOD, 0)
        bad = counts.get(QualityCode.BAD, 0)
        uncertain = counts.get(QualityCode.UNCERTAIN, 0)
        total = good + bad + uncertain
        
        return QualityStats(
            sensor_id=sensor_id,
            good_count=good,
            bad_count=bad,
            uncertain_count=uncertain,
            total=total
        )
