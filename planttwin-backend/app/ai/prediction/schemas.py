from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime

class PredictionRequest(BaseModel):
    equipment_id: UUID
    prediction_type: str
    horizon_days: int = 30

class PredictionResponse(BaseModel):
    id: UUID
    equipment_id: UUID
    prediction_type: str
    predicted_value: Optional[float] = None
    confidence: float
    predicted_at: datetime
    target_date: Optional[datetime] = None
    model_version: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)
