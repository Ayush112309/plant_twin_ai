from pydantic import BaseModel, Field
from typing import Optional, List
import uuid
from datetime import datetime
from app.telemetry.ingestion.models import QualityCode

class TelemetryDataPoint(BaseModel):
    sensor_id: Optional[uuid.UUID] = None
    organization_id: Optional[uuid.UUID] = None
    tag: Optional[str] = None
    value: Optional[float] = None
    string_value: Optional[str] = None
    quality: QualityCode = QualityCode.GOOD
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow)
    raw_value: Optional[str] = None
    unit: Optional[str] = None

class TelemetryBatchIngest(BaseModel):
    data_points: List[TelemetryDataPoint]

class TelemetryResponse(BaseModel):
    id: uuid.UUID
    sensor_id: Optional[uuid.UUID]
    organization_id: Optional[uuid.UUID] = None
    tag: str
    value: Optional[float]
    quality: QualityCode
    timestamp: datetime
    
    class Config:
        from_attributes = True
