from pydantic import BaseModel, ConfigDict
from typing import Dict, Any, Optional
from uuid import UUID

class ModelCreate(BaseModel):
    name: str
    model_type: str
    version: str
    framework: str
    artifact_path: str
    metrics: Optional[Dict[str, Any]] = None
    parameters: Optional[Dict[str, Any]] = None
    status: str = "draft"
    created_by: Optional[str] = None

class ModelUpdate(BaseModel):
    name: Optional[str] = None
    version: Optional[str] = None
    artifact_path: Optional[str] = None
    metrics: Optional[Dict[str, Any]] = None
    parameters: Optional[Dict[str, Any]] = None
    status: Optional[str] = None

class ModelResponse(BaseModel):
    id: UUID
    name: str
    model_type: str
    version: str
    framework: str
    artifact_path: str
    metrics: Optional[Dict[str, Any]] = None
    parameters: Optional[Dict[str, Any]] = None
    status: str
    created_by: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)
