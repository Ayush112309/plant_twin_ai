from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional, Dict, Any
from datetime import datetime

class TenantBase(BaseModel):
    name: str
    slug: str
    organization_id: Optional[UUID] = None
    status: str = "active"
    tier: str = "free"
    max_users: Optional[int] = None
    max_devices: Optional[int] = None
    storage_limit_gb: Optional[int] = None
    features: Optional[Dict[str, Any]] = None

class TenantCreate(TenantBase):
    pass

class TenantUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    tier: Optional[str] = None
    max_users: Optional[int] = None
    max_devices: Optional[int] = None
    storage_limit_gb: Optional[int] = None
    features: Optional[Dict[str, Any]] = None

class TenantResponse(TenantBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    created_at: datetime
    updated_at: datetime
