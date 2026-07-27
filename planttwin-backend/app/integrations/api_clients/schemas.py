from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional, Dict, Any
from datetime import datetime

class ApiClientBase(BaseModel):
    name: str
    client_type: str
    base_url: str
    auth_type: str
    credentials: Optional[Dict[str, Any]] = None
    config: Optional[Dict[str, Any]] = None
    is_active: bool = True

class ApiClientCreate(ApiClientBase):
    pass

class ApiClientUpdate(BaseModel):
    name: Optional[str] = None
    base_url: Optional[str] = None
    auth_type: Optional[str] = None
    credentials: Optional[Dict[str, Any]] = None
    config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class ApiClientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    client_type: str
    base_url: str
    auth_type: str
    config: Optional[Dict[str, Any]] = None
    is_active: bool
    last_sync_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
