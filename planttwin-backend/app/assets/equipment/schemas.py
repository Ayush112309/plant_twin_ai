from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
import uuid
from app.assets.equipment.models import AssetStatus

class EquipmentBase(BaseModel):
    name: str
    asset_tag: str
    equipment_type: str
    manufacturer: Optional[str] = None
    model_number: Optional[str] = None
    serial_number: Optional[str] = None
    plant_id: uuid.UUID
    organization_id: Optional[uuid.UUID] = None
    area_id: Optional[uuid.UUID] = None
    status: AssetStatus = AssetStatus.IDLE
    installation_date: Optional[datetime] = None
    warranty_expiry: Optional[datetime] = None
    specifications: Optional[Dict[str, Any]] = None
    metadata_: Optional[Dict[str, Any]] = None
    is_active: bool = True

class EquipmentCreate(EquipmentBase):
    pass

class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    asset_tag: Optional[str] = None
    equipment_type: Optional[str] = None
    manufacturer: Optional[str] = None
    model_number: Optional[str] = None
    serial_number: Optional[str] = None
    plant_id: Optional[uuid.UUID] = None
    area_id: Optional[uuid.UUID] = None
    status: Optional[AssetStatus] = None
    installation_date: Optional[datetime] = None
    warranty_expiry: Optional[datetime] = None
    specifications: Optional[Dict[str, Any]] = None
    metadata_: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class EquipmentResponse(EquipmentBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
