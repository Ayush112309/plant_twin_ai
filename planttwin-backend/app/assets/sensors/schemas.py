from pydantic import BaseModel
from typing import Optional
import uuid

class SensorBase(BaseModel):
    name: str
    sensor_tag: str
    sensor_type: str
    unit_of_measure: str
    equipment_id: uuid.UUID
    organization_id: Optional[uuid.UUID] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    precision: int = 2
    data_type: str
    is_active: bool = True

class SensorCreate(SensorBase):
    pass

class SensorUpdate(BaseModel):
    name: Optional[str] = None
    sensor_tag: Optional[str] = None
    sensor_type: Optional[str] = None
    unit_of_measure: Optional[str] = None
    equipment_id: Optional[uuid.UUID] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    precision: Optional[int] = None
    data_type: Optional[str] = None
    is_active: Optional[bool] = None

class SensorResponse(SensorBase):
    id: uuid.UUID

    class Config:
        from_attributes = True
