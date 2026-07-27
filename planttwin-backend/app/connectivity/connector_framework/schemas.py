from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
import uuid
from app.connectivity.connector_framework.models import ConnectionState

class ConnectorBase(BaseModel):
    name: str
    connector_type: str
    host: str
    port: int
    config: Dict[str, Any]
    plant_id: Optional[uuid.UUID] = None
    is_enabled: bool = True

class ConnectorCreate(ConnectorBase):
    pass

class ConnectorUpdate(BaseModel):
    name: Optional[str] = None
    connector_type: Optional[str] = None
    host: Optional[str] = None
    port: Optional[int] = None
    config: Optional[Dict[str, Any]] = None
    plant_id: Optional[uuid.UUID] = None
    is_enabled: Optional[bool] = None

class ConnectorResponse(ConnectorBase):
    id: uuid.UUID
    status: ConnectionState
    last_connected_at: Optional[datetime]
    error_message: Optional[str]

    class Config:
        from_attributes = True

class ConnectorStatusResponse(BaseModel):
    id: uuid.UUID
    status: ConnectionState
    last_connected_at: Optional[datetime]
    error_message: Optional[str]
