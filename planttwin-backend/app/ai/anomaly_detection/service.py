from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
import statistics
import datetime
from uuid import UUID
from typing import List, Optional
from .models import AnomalyEvent
from .schemas import AnomalyDetectionRequest, AnomalyDetectionResponse, AnomalyEventResponse
from app.shared.enums import AlarmSeverity

class AnomalyDetectionService:
    async def detect_anomalies(self, db: AsyncSession, request: AnomalyDetectionRequest) -> AnomalyDetectionResponse:
        events = []
        if request.method == 'zscore' and len(request.data_points) > 1:
            mean = statistics.mean(request.data_points)
            std = statistics.stdev(request.data_points) if len(request.data_points) > 1 else 0
            if std > 0:
                for idx, point in enumerate(request.data_points):
                    z_score = abs(point - mean) / std
                    if z_score > 3:
                        # Detected anomaly
                        event = AnomalyEvent(
                            sensor_id=request.sensor_id,
                            anomaly_type="point",
                            severity=AlarmSeverity.CRITICAL if z_score > 5 else AlarmSeverity.HIGH,
                            score=z_score,
                            description=f"Z-Score anomaly detected with score {z_score:.2f} at index {idx}",
                            detected_at=datetime.datetime.utcnow()
                        )
                        db.add(event)
                        await db.flush()
                        await db.refresh(event)
                        events.append(event)
        
        await db.commit()
        return AnomalyDetectionResponse(
            anomalies_found=len(events),
            events=[AnomalyEventResponse.model_validate(e) for e in events]
        )

    async def list_events(self, db: AsyncSession, sensor_id: Optional[UUID] = None) -> List[AnomalyEvent]:
        query = select(AnomalyEvent)
        if sensor_id:
            query = query.where(AnomalyEvent.sensor_id == sensor_id)
        result = await db.execute(query)
        return list(result.scalars().all())

    async def acknowledge_event(self, db: AsyncSession, event_id: UUID, user_id: str) -> Optional[AnomalyEvent]:
        result = await db.execute(select(AnomalyEvent).where(AnomalyEvent.id == event_id))
        event = result.scalars().first()
        if event:
            event.acknowledged = True
            event.acknowledged_by = user_id
            await db.commit()
            await db.refresh(event)
        return event
