from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional, Dict, Any
from datetime import datetime

class AuditLogCreate(BaseModel):
    tenant_id: Optional[UUID] = None
    user_id: Optional[UUID] = None
    action: str
    resource_type: str
    resource_id: str
    old_values: Optional[Dict[str, Any]] = None
    new_values: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    status: str

class AuditLogResponse(AuditLogCreate):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    created_at: datetime
