from fastapi import APIRouter, Query
from typing import List
from app.shared.responses import APIResponse
from .schemas import CopilotQueryRequest, CopilotQueryResponse
from .service import CopilotService

router = APIRouter(prefix="/copilot", tags=["AI Copilot Assistant"])


@router.post("/query", response_model=APIResponse[CopilotQueryResponse])
async def query_copilot(request: CopilotQueryRequest):
    """Context-aware query endpoint for PlantTwin AI Copilot."""
    response = await CopilotService.process_query(request)
    return APIResponse.ok(data=response, message="Copilot response generated successfully")


@router.get("/suggested-prompts", response_model=APIResponse[List[str]])
async def get_suggested_prompts(
    page: str = Query(default="operations"),
    role: str = Query(default="Plant Manager")
):
    """Fetch route-specific prompt suggestion chips."""
    prompts = CopilotService.get_suggested_prompts(page, role)
    return APIResponse.ok(data=prompts, message="Suggested prompts retrieved")
