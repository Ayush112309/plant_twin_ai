"""
PlantTwin AI Backend — AI Model Engineer Feedback Model
======================================================
Stores engineer feedback (Accept/Reject/Modify) for safe MLOps model evaluation.
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text
from app.shared.mixins.base_model import Base


class AIFeedback(Base):
    __tablename__ = "ai_feedback"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    prediction_id = Column(String, nullable=False, index=True)
    asset_id = Column(String, nullable=False, index=True)
    original_prediction = Column(String, nullable=False)
    engineer_decision = Column(String, nullable=False)  # ACCEPTED, REJECTED, MODIFIED
    corrected_label = Column(String, nullable=True)
    engineer_comments = Column(Text, nullable=True)
    engineer_user = Column(String, nullable=False, default="engineer@planttwin.ai")
    status = Column(String, nullable=False, default="PENDING_EVALUATION")  # PENDING_EVALUATION, APPROVED_FOR_RETRAINING, RETRAINED
    created_at = Column(DateTime, default=datetime.utcnow)
