from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional, Dict, Any
from datetime import datetime

class ReportTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    template_type: str
    layout: Optional[Dict[str, Any]] = None
    default_config: Optional[Dict[str, Any]] = None
    is_system: bool = False

class ReportTemplateCreate(ReportTemplateBase):
    pass

class ReportTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    layout: Optional[Dict[str, Any]] = None
    default_config: Optional[Dict[str, Any]] = None

class ReportTemplateResponse(ReportTemplateBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    created_at: datetime
    updated_at: datetime
