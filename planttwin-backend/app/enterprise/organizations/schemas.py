from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime

class OrganizationCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    subscription_tier: Optional[str] = None

class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    is_active: Optional[bool] = None
    settings: Optional[Dict[str, Any]] = None
    subscription_tier: Optional[str] = None

class OrganizationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    name: str
    slug: str
    description: Optional[str] = None
    logo_url: Optional[str] = None
    is_active: bool = True
    settings: Optional[Dict[str, Any]] = {}
    subscription_tier: Optional[str] = "ENTERPRISE"
    created_at: Optional[datetime] = None
