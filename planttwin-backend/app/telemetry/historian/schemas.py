from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

class HistorianQueryReq(BaseModel):
    tags: List[str]
    start_time: datetime
    end_time: datetime
    aggregation: str = 'raw'
    interval: str = '1m'

class DataPoint(BaseModel):
    timestamp: datetime
    value: float

class HistorianResponse(BaseModel):
    tag: str
    data_points: List[DataPoint]

class SavedQueryCreate(BaseModel):
    name: str
    organization_id: Optional[uuid.UUID] = None
    description: Optional[str] = None
    query_config: Dict[str, Any]
    is_shared: bool = False

class SavedQueryResponse(SavedQueryCreate):
    id: uuid.UUID
    created_by: Optional[uuid.UUID] = None
    
    class Config:
        from_attributes = True
