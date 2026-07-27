from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime

class APIKeyCreate(BaseModel):
    name: str
    scopes: Optional[Dict[str, Any]] = {}
    expires_at: Optional[datetime] = None

class APIKeyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    name: str
    user_id: UUID
    scopes: Dict[str, Any]
    expires_at: Optional[datetime]
    is_active: bool
    last_used_at: Optional[datetime]
    created_at: datetime
    plaintext_key: Optional[str] = None
