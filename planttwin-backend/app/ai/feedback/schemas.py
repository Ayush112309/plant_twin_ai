from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class FeedbackCreateRequest(BaseModel):
    prediction_id: str
    asset_id: str
    original_prediction: str
    engineer_decision: str = Field(..., description="CORRECT, INCORRECT, or PARTIALLY_CORRECT")
    actual_cause: Optional[str] = Field(None, description="Bearing Failure, Lubrication Issue, Sensor Fault, False Alarm, Other")
    engineer_comments: Optional[str] = None
    engineer_user: Optional[str] = "engineer@planttwin.ai"

class FeedbackResponse(BaseModel):
    id: str
    prediction_id: str
    asset_id: str
    original_prediction: str
    engineer_decision: str
    actual_cause: Optional[str] = None
    engineer_comments: Optional[str] = None
    engineer_user: str
    status: str
    created_at: str

class FeedbackStatsResponse(BaseModel):
    total_feedback_count: int
    correct_count: int
    incorrect_count: int
    partially_correct_count: int
    pending_evaluation_count: int
    approved_for_retraining_count: int
    model_accuracy_improvement_estimate: float
