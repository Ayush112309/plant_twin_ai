from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.shared.enums import AlarmSeverity

class WorkOrderCreate(BaseModel):
    title: str
    description: Optional[str] = None
    work_order_type: str
    priority: AlarmSeverity
    equipment_id: Optional[UUID] = None
    assigned_to: Optional[UUID] = None
    requested_by: Optional[UUID] = None
    due_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None

class WorkOrderUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[AlarmSeverity] = None
    due_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    notes: Optional[str] = None

class WorkOrderResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    work_order_type: str
    priority: AlarmSeverity
    status: str
    equipment_id: Optional[UUID] = None
    assigned_to: Optional[UUID] = None
    requested_by: Optional[UUID] = None
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    notes: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)
