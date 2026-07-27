from pydantic import BaseModel
from typing import Optional, List
import uuid

class TagMappingBase(BaseModel):
    connector_id: uuid.UUID
    source_tag: str
    mapped_tag: str
    sensor_id: Optional[uuid.UUID] = None
    data_type: str
    scaling_factor: float = 1.0
    offset: float = 0.0
    is_active: bool = True

class TagMappingCreate(TagMappingBase):
    pass

class TagMappingUpdate(BaseModel):
    source_tag: Optional[str] = None
    mapped_tag: Optional[str] = None
    sensor_id: Optional[uuid.UUID] = None
    data_type: Optional[str] = None
    scaling_factor: Optional[float] = None
    offset: Optional[float] = None
    is_active: Optional[bool] = None

class TagMappingResponse(TagMappingBase):
    id: uuid.UUID

    class Config:
        from_attributes = True

class TagMappingBulkCreate(BaseModel):
    mappings: List[TagMappingCreate]
