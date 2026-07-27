from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional, Dict, Any
from datetime import datetime

class ChannelBase(BaseModel):
    channel_type: str
    name: str
    config: Optional[Dict[str, Any]] = None
    is_enabled: bool = True
    is_default: bool = False

class ChannelCreate(ChannelBase):
    pass

class ChannelUpdate(BaseModel):
    name: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    is_enabled: Optional[bool] = None
    is_default: Optional[bool] = None

class ChannelResponse(ChannelBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    created_at: datetime
    updated_at: datetime
