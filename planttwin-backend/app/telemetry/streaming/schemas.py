from pydantic import BaseModel
from typing import List

class StreamConfig(BaseModel):
    tags: List[str]
    interval_ms: int = 1000

class StreamStatus(BaseModel):
    active_streams: int
    tags: List[str]
