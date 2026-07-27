from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime

class NotificationItem(BaseModel):
    id: str
    title: str
    message: str
    category: str = Field(..., description="Critical, Warning, Maintenance, Prediction, AI, Security, System, Workflow, Reports")
    severity: str = Field(..., description="CRITICAL, HIGH, MEDIUM, LOW")
    channels_sent: List[str]
    read: bool = False
    archived: bool = False
    escalation_stage: int = 0  # 0=Initial, 1=Immediate Push, 2=Email, 3=Supervisor Escalated, 4=Work Order Created
    associated_asset: Optional[str] = None
    associated_work_order: Optional[str] = None
    created_at: str

class UserNotificationPreferences(BaseModel):
    receive_critical: bool = True
    receive_warning: bool = True
    receive_maintenance: bool = True
    receive_ai_predictions: bool = True
    receive_security: bool = True
    receive_system: bool = True
    receive_workflow: bool = True
    receive_reports: bool = False
    receive_marketing: bool = False
    preferred_channels: List[str] = ["In-App", "Email", "Push", "Slack"]

class EscalationRule(BaseModel):
    rule_id: str
    rule_name: str
    trigger_condition: str
    step_1: str
    step_2: str
    step_3_timeout_mins: int
    step_4_escalate_to: str
    step_5_action: str
    active: bool = True
