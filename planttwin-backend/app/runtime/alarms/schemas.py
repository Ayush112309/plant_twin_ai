from pydantic import BaseModel, ConfigDict
from typing import Dict, Any, Optional
from uuid import UUID
from datetime import datetime
from app.shared.enums import AlarmSeverity

class AlarmCreate(BaseModel):
    name: str
    alarm_type: str
    severity: AlarmSeverity
    source_type: str
    source_id: str
    condition_config: Dict[str, Any]
    message_template: Optional[str] = None

class AlarmUpdate(BaseModel):
    name: Optional[str] = None
    severity: Optional[AlarmSeverity] = None
    condition_config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class AlarmResponse(BaseModel):
    id: UUID
    name: str
    alarm_type: str
    severity: AlarmSeverity
    source_type: str
    source_id: str
    condition_config: Dict[str, Any]
    message_template: Optional[str] = None
    is_active: bool
    is_triggered: bool
    triggered_at: Optional[datetime] = None
    acknowledged: bool
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class AlarmTriggerEvent(BaseModel):
    value: float

class AlarmAcknowledge(BaseModel):
    user_id: str
