from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.shared.enums import AlarmSeverity

class IncidentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    severity: AlarmSeverity
    equipment_id: Optional[UUID] = None
    reported_by: Optional[UUID] = None
    started_at: Optional[datetime] = None

class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[AlarmSeverity] = None
    assigned_to: Optional[UUID] = None
    root_cause: Optional[str] = None
    resolution: Optional[str] = None
    impact_description: Optional[str] = None

class IncidentResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    severity: AlarmSeverity
    status: str
    equipment_id: Optional[UUID] = None
    reported_by: Optional[UUID] = None
    assigned_to: Optional[UUID] = None
    root_cause: Optional[str] = None
    resolution: Optional[str] = None
    started_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    impact_description: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)
