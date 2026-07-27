from pydantic import BaseModel
from typing import Optional
import uuid

class DocumentBase(BaseModel):
    title: str
    document_type: str
    equipment_id: uuid.UUID
    organization_id: Optional[uuid.UUID] = None
    file_path: str
    file_size: int
    mime_type: str
    uploaded_by: Optional[uuid.UUID] = None
    version: str = "1.0"

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    document_type: Optional[str] = None
    version: Optional[str] = None

class DocumentResponse(DocumentBase):
    id: uuid.UUID

    class Config:
        from_attributes = True
