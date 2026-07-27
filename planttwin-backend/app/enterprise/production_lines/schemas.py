from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime

class ProductionLineCreate(BaseModel):
    name: str
    code: str
    area_id: UUID
    description: Optional[str] = None
    capacity: Optional[float] = None

class ProductionLineUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    capacity: Optional[float] = None
    is_active: Optional[bool] = None

class ProductionLineResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    name: str
    code: str
    area_id: UUID
    description: Optional[str]
    capacity: Optional[float]
    is_active: bool
    created_at: datetime
