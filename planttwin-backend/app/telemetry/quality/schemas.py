from pydantic import BaseModel
from typing import Dict, Any, Optional
import uuid
from app.telemetry.ingestion.models import QualityCode

class QualityCheckRequest(BaseModel):
    value: float
    sensor_config: Dict[str, Any]

class QualityStats(BaseModel):
    sensor_id: uuid.UUID
    good_count: int
    bad_count: int
    uncertain_count: int
    total: int
