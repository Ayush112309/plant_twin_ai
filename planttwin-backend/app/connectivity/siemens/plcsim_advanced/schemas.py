from pydantic import BaseModel
from typing import Any
from datetime import datetime

class PLCReadRequest(BaseModel):
    tag_address: str

class PLCReadResponse(BaseModel):
    tag: str
    value: Any
    quality: str
    timestamp: datetime

class PLCWriteRequest(BaseModel):
    tag_address: str
    value: Any
