from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from app.shared.enums import AlarmSeverity

class AnomalyDetectionRequest(BaseModel):
    sensor_id: UUID
    data_points: List[float]
    method: str = 'zscore'

class AnomalyEventResponse(BaseModel):
    id: UUID
    sensor_id: Optional[UUID] = None
    equipment_id: Optional[UUID] = None
    anomaly_type: str
    severity: AlarmSeverity
    score: float
    description: Optional[str] = None
    detected_at: datetime
    acknowledged: bool
    acknowledged_by: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class AnomalyDetectionResponse(BaseModel):
    anomalies_found: int
    events: List[AnomalyEventResponse]
