from pydantic import BaseModel
from typing import Any

class MQTTPublishRequest(BaseModel):
    topic: str
    payload: Any

class MQTTSubscribeRequest(BaseModel):
    topic: str

class MQTTMessageResponse(BaseModel):
    topic: str
    payload: Any
