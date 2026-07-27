from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional, Dict, Any
from datetime import datetime

class LicenseBase(BaseModel):
    tenant_id: UUID
    license_key: str
    license_type: str
    issued_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    max_assets: Optional[int] = None
    max_connections: Optional[int] = None
    features: Optional[Dict[str, Any]] = None
    is_active: bool = True

class LicenseCreate(LicenseBase):
    pass

class LicenseUpdate(BaseModel):
    expires_at: Optional[datetime] = None
    max_assets: Optional[int] = None
    max_connections: Optional[int] = None
    features: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class LicenseResponse(LicenseBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    issued_at: datetime
    created_at: datetime
    updated_at: datetime
