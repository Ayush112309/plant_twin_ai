from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime

class AreaCreate(BaseModel):
    name: str
    code: str
    plant_id: UUID
    description: Optional[str] = None

class AreaUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class AreaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    name: str
    code: str
    plant_id: UUID
    description: Optional[str]
    is_active: bool
    created_at: datetime
