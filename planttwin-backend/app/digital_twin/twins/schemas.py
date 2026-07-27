from pydantic import BaseModel
from typing import Optional, Dict, Any
import uuid
from datetime import datetime

class TwinCreate(BaseModel):
    name: str
    twin_type: str
    equipment_id: Optional[uuid.UUID] = None
    plant_id: Optional[uuid.UUID] = None
    description: Optional[str] = None
    config: Dict[str, Any] = {}

class TwinUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    sync_enabled: Optional[bool] = None

class TwinResponse(TwinCreate):
    id: uuid.UUID
    state: Dict[str, Any]
    is_active: bool
    sync_enabled: bool
    last_synced_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class TwinStateResponse(BaseModel):
    twin_id: uuid.UUID
    state: Dict[str, Any]
    last_synced_at: Optional[datetime]
