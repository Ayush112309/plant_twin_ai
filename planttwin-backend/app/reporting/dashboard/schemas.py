from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional, Dict, Any, List
from datetime import datetime

class DashboardBase(BaseModel):
    name: str
    description: Optional[str] = None
    layout: Optional[Dict[str, Any]] = None
    widgets: Optional[List[Dict[str, Any]]] = None
    is_shared: bool = False
    is_default: bool = False

class DashboardCreate(DashboardBase):
    pass

class DashboardUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    layout: Optional[Dict[str, Any]] = None
    widgets: Optional[List[Dict[str, Any]]] = None
    is_shared: Optional[bool] = None
    is_default: Optional[bool] = None

class DashboardResponse(DashboardBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    owner_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
