"""
PlantTwin AI Backend — AI Case Library Model
===========================================
Structured incident cases captured from resolved plant maintenance events.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class AICaseItem(BaseModel):
    case_id: str = Field(..., description="e.g. Case #1245")
    title: str
    equipment_id: str
    equipment_name: str
    root_cause: str
    engineer_action: str
    downtime_hours: float
    result: str = "Resolved"
    tags: List[str]
    similarity_pattern_recommendation: Optional[str] = None
    engineer_author: str = "reliability.engineer@planttwin.ai"
    created_at: str

class CaseSearchRequest(BaseModel):
    query: Optional[str] = None
    tag: Optional[str] = None
    equipment_id: Optional[str] = None

class CreateCaseRequest(BaseModel):
    title: str
    equipment_id: str
    equipment_name: str
    root_cause: str
    engineer_action: str
    downtime_hours: float
    tags: List[str]
    similarity_pattern_recommendation: Optional[str] = None
