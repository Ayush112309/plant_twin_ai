from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime

class PlantCreate(BaseModel):
    name: str
    code: str
    organization_id: UUID
    location: Optional[str] = None
    timezone: Optional[str] = "UTC"
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class PlantUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    location: Optional[str] = None
    timezone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_active: Optional[bool] = None

class PlantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    name: str
    code: str
    organization_id: UUID
    location: Optional[str]
    timezone: str
    latitude: Optional[float]
    longitude: Optional[float]
    is_active: bool
    created_at: datetime
