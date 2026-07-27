from pydantic import BaseModel
from typing import Dict, Any, Optional
import uuid
from datetime import datetime

class SnapshotCreate(BaseModel):
    twin_id: uuid.UUID
    reason: str
    triggered_by: Optional[str] = 'manual'

class SnapshotResponse(SnapshotCreate):
    id: uuid.UUID
    snapshot_data: Dict[str, Any]
    
    class Config:
        from_attributes = True
