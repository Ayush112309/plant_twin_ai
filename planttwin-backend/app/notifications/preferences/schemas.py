from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional, List

class PreferenceBase(BaseModel):
    event_type: str
    channels: List[str]
    is_muted: bool = False
    quiet_hours_start: Optional[str] = None
    quiet_hours_end: Optional[str] = None

class PreferenceUpdate(PreferenceBase):
    pass

class PreferenceResponse(PreferenceBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    user_id: UUID
