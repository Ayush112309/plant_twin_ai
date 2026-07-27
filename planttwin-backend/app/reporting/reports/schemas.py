from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from datetime import datetime
from typing import Optional, Dict, Any

class ReportBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    report_type: str = Field(..., max_length=50)
    template_id: Optional[UUID] = None
    config: Optional[Dict[str, Any]] = None
    format: str = Field(..., max_length=20)

class ReportCreate(ReportBase):
    pass

class ReportUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    generated_at: Optional[datetime] = None

class ReportGenerateRequest(BaseModel):
    report_type: str
    config: Dict[str, Any]
    format: str

class ReportResponse(ReportBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    status: str
    file_path: Optional[str] = None
    generated_by: Optional[UUID] = None
    generated_at: Optional[datetime] = None
    file_size: Optional[int] = None
    created_at: datetime
    updated_at: datetime
