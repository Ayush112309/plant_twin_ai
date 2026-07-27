from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class CopilotContext(BaseModel):
    current_page: Optional[str] = Field(default="operations", description="Active frontend route")
    equipment_id: Optional[str] = Field(default=None, description="Active equipment ID if viewing specific asset")
    alarm_id: Optional[str] = Field(default=None, description="Active alarm ID if inspecting alarm")
    user_role: Optional[str] = Field(default="Plant Manager", description="Role persona of current user")

class CopilotQueryRequest(BaseModel):
    message: str
    context: Optional[CopilotContext] = Field(default_factory=CopilotContext)
    history: Optional[List[Dict[str, str]]] = Field(default_factory=list)

class CopilotActionRecommendation(BaseModel):
    label: str
    action_type: str  # e.g., 'navigate', 'create_work_order', 'generate_report', 'trigger_scan'
    target: str

class CopilotQueryResponse(BaseModel):
    reply: str
    intent_detected: str
    category: str
    confidence: float
    recommendations: List[CopilotActionRecommendation] = []
    metadata: Dict[str, Any] = {}
