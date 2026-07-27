from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime

class RoleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_system_role: Optional[bool] = False
    permissions: Optional[Dict[str, Any]] = {}

class RoleUpdate(BaseModel):
    description: Optional[str] = None
    permissions: Optional[Dict[str, Any]] = None

class RoleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    name: str
    description: Optional[str]
    is_system_role: bool
    permissions: Dict[str, Any]
    created_at: datetime
