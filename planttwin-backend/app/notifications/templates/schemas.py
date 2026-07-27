from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional, List
from datetime import datetime

class TemplateBase(BaseModel):
    name: str
    event_type: str
    subject_template: str
    body_template: str
    channel_type: str
    variables: Optional[List[str]] = None

class TemplateCreate(TemplateBase):
    pass

class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    subject_template: Optional[str] = None
    body_template: Optional[str] = None
    variables: Optional[List[str]] = None

class TemplateResponse(TemplateBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    created_at: datetime
    updated_at: datetime
