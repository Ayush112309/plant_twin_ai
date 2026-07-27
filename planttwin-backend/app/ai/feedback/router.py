from fastapi import APIRouter
from typing import Dict, Any
from app.shared.responses import APIResponse
from .schemas import FeedbackCreateRequest, FeedbackStatsResponse
from .service import AIFeedbackService
from .pipeline_service import MLOpsPipelineService

router = APIRouter(prefix="/feedback", tags=["AI Feedback & Learning"])


@router.post("", response_model=APIResponse[Dict[str, Any]])
async def submit_engineer_feedback(request: FeedbackCreateRequest):
    """Store engineer decision into Feedback Database for periodic MLOps evaluation."""
    result = await AIFeedbackService.record_feedback(request)
    return APIResponse.ok(data=result, message="Engineer feedback recorded successfully in Feedback DB")


@router.get("/stats", response_model=APIResponse[FeedbackStatsResponse])
async def get_feedback_stats():
    """Retrieve feedback statistics for MLOps governance."""
    stats = await AIFeedbackService.get_stats()
    return APIResponse.ok(data=stats, message="Feedback statistics retrieved")


@router.post("/evaluate-and-queue", response_model=APIResponse[Dict[str, Any]])
async def evaluate_feedback_and_queue():
    """Evaluate stored feedback and stage records for periodic batch model retraining."""
    res = await AIFeedbackService.trigger_evaluation_and_retrain_queue()
    return APIResponse.ok(data=res, message="Evaluation executed and retraining batch queued")


@router.get("/pipeline/status", response_model=APIResponse[Dict[str, Any]])
async def get_mlops_pipeline_status():
    """Retrieve current 8-stage MLOps feedback pipeline status."""
    status = await MLOpsPipelineService.get_pipeline_status()
    return APIResponse.ok(data=status, message="MLOps pipeline status retrieved")


@router.post("/pipeline/execute", response_model=APIResponse[Dict[str, Any]])
async def execute_mlops_pipeline():
    """Trigger full end-to-end execution of the 8-stage MLOps retraining pipeline."""
    res = await MLOpsPipelineService.execute_full_pipeline()
    return APIResponse.ok(data=res, message="MLOps 8-stage pipeline executed successfully")
