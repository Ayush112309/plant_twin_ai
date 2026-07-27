from pydantic import BaseModel
from typing import Dict, Any, Optional
import uuid
from datetime import datetime

class SimulationConfig(BaseModel):
    twin_id: uuid.UUID
    scenario_name: str
    parameters: Dict[str, Any]
    duration_seconds: int

class SimulationResult(BaseModel):
    twin_id: uuid.UUID
    scenario: str
    results: Dict[str, Any]
    started_at: datetime
    completed_at: datetime
