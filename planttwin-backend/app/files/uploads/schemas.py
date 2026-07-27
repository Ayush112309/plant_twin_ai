from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional
from datetime import datetime

class FileMetadata(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    original_filename: str
    mime_type: str
    file_size: int
    category: str
    is_public: bool
    uploaded_by: Optional[UUID] = None
    tenant_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

class FileUploadResponse(BaseModel):
    id: UUID
    url: str
    metadata: FileMetadata
