from pydantic import BaseModel
from typing import Any, List
from datetime import datetime

class OPCUANodeRequest(BaseModel):
    node_id: str

class OPCUANodeResponse(BaseModel):
    node_id: str
    value: Any
    server_timestamp: datetime

class OPCUABrowseResponse(BaseModel):
    node_id: str
    children: List[str]
