from pydantic import BaseModel, ConfigDict
from typing import Dict, Any, Optional
from uuid import UUID
from datetime import datetime

class HealthScoreRequest(BaseModel):
    equipment_id: UUID

class HealthScoreResponse(BaseModel):
    id: UUID
    equipment_id: UUID
    overall_score: float
    component_scores: Optional[Dict[str, float]] = None
    factors: Optional[Dict[str, Any]] = None
    calculated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
