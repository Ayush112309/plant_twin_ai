from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List, Optional
import datetime
from .models import Incident
from .schemas import IncidentCreate, IncidentUpdate

class IncidentService:
    async def create_incident(self, db: AsyncSession, data: IncidentCreate) -> Incident:
        incident = Incident(**data.model_dump())
        if not incident.started_at:
            incident.started_at = datetime.datetime.utcnow()
        db.add(incident)
        await db.commit()
        await db.refresh(incident)
        return incident

    async def get_incident(self, db: AsyncSession, incident_id: UUID) -> Optional[Incident]:
        result = await db.execute(select(Incident).where(Incident.id == incident_id))
        return result.scalars().first()

    async def list_incidents(self, db: AsyncSession) -> List[Incident]:
        result = await db.execute(select(Incident).order_by(Incident.started_at.desc()))
        return list(result.scalars().all())

    async def update_incident(self, db: AsyncSession, incident_id: UUID, data: IncidentUpdate) -> Optional[Incident]:
        incident = await self.get_incident(db, incident_id)
        if incident:
            for key, value in data.model_dump(exclude_unset=True).items():
                setattr(incident, key, value)
            await db.commit()
            await db.refresh(incident)
        return incident

    async def update_status(self, db: AsyncSession, incident_id: UUID, status: str) -> Optional[Incident]:
        incident = await self.get_incident(db, incident_id)
        if incident:
            incident.status = status
            if status in ["resolved", "closed"] and not incident.resolved_at:
                incident.resolved_at = datetime.datetime.utcnow()
            await db.commit()
            await db.refresh(incident)
        return incident
