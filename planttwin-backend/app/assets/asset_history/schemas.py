from pydantic import BaseModel
from typing import Optional, Dict, Any
import uuid
from datetime import datetime

class HistoryBase(BaseModel):
    equipment_id: uuid.UUID
    organization_id: Optional[uuid.UUID] = None
    event_type: str
    description: str
    performed_by: str
    old_value: Optional[Dict[str, Any]] = None
    new_value: Optional[Dict[str, Any]] = None

class HistoryCreate(HistoryBase):
    pass

class HistoryResponse(HistoryBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
