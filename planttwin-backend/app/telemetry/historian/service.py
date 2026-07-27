from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List
import uuid
from app.telemetry.historian.models import HistorianQuery
from app.telemetry.historian.schemas import HistorianQueryReq, HistorianResponse, DataPoint, SavedQueryCreate
from app.telemetry.ingestion.models import TelemetryData

class HistorianService:
    async def query_data(self, db: AsyncSession, req: HistorianQueryReq, org_id: uuid.UUID) -> List[HistorianResponse]:
        responses = []
        for tag in req.tags:
            stmt = select(TelemetryData).where(
                and_(
                    TelemetryData.tag == tag,
                    TelemetryData.organization_id == org_id,
                    TelemetryData.timestamp >= req.start_time,
                    TelemetryData.timestamp <= req.end_time
                )
            ).order_by(TelemetryData.timestamp.asc())
            result = await db.execute(stmt)
            records = result.scalars().all()
            
            data_points = [DataPoint(timestamp=r.timestamp, value=r.value) for r in records if r.value is not None]
            responses.append(HistorianResponse(tag=tag, data_points=data_points))
            
        return responses

    async def get_aggregated(self, db: AsyncSession, req: HistorianQueryReq, org_id: uuid.UUID) -> List[HistorianResponse]:
        # Mock aggregation for now
        return await self.query_data(db, req, org_id)

    async def save_query(self, db: AsyncSession, query_data: SavedQueryCreate, user_id=None) -> HistorianQuery:
        db_obj = HistorianQuery(**query_data.model_dump(), created_by=user_id)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def list_saved_queries(self, db: AsyncSession, org_id: uuid.UUID) -> List[HistorianQuery]:
        stmt = select(HistorianQuery).filter(HistorianQuery.organization_id == org_id)
        result = await db.execute(stmt)
        return list(result.scalars().all())
