from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional, Dict, Any, List
from datetime import datetime

class WebhookBase(BaseModel):
    name: str
    url: str
    secret: Optional[str] = None
    events: List[str]
    headers: Optional[Dict[str, str]] = None
    is_active: bool = True

class WebhookCreate(WebhookBase):
    pass

class WebhookUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    secret: Optional[str] = None
    events: Optional[List[str]] = None
    headers: Optional[Dict[str, str]] = None
    is_active: Optional[bool] = None

class WebhookResponse(WebhookBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    last_triggered_at: Optional[datetime] = None
    failure_count: int
    created_at: datetime
    updated_at: datetime

class WebhookTestResult(BaseModel):
    success: bool
    status_code: Optional[int] = None
    response: Optional[str] = None
