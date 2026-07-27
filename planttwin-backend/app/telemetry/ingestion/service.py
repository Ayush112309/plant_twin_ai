from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import insert
from typing import List
from app.telemetry.ingestion.models import TelemetryData
from app.telemetry.ingestion.schemas import TelemetryDataPoint, TelemetryBatchIngest
from app.telemetry.streaming.websocket import manager

class TelemetryIngestionService:
    async def ingest_single(self, db: AsyncSession, data_point: TelemetryDataPoint) -> TelemetryData:
        db_obj = TelemetryData(**data_point.model_dump())
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        
        # Broadcast via WebSocket
        await manager.broadcast({
            "type": "telemetry",
            "data": [{
                "tag": db_obj.tag,
                "value": db_obj.value,
                "timestamp": db_obj.timestamp.isoformat()
            }]
        })
        
        return db_obj

    async def ingest_batch(self, db: AsyncSession, batch: TelemetryBatchIngest) -> List[TelemetryData]:
        objects = [TelemetryData(**dp.model_dump()) for dp in batch.data_points]
        db.add_all(objects)
        await db.commit()
        
        # Broadcast via WebSocket
        await manager.broadcast({
            "type": "telemetry",
            "data": [{
                "tag": obj.tag,
                "value": obj.value,
                "timestamp": obj.timestamp.isoformat()
            } for obj in objects]
        })
        
        return objects

    async def validate_data_point(self, data_point: TelemetryDataPoint, min_val: float, max_val: float) -> bool:
        if data_point.value is not None:
            return min_val <= data_point.value <= max_val
        return True
