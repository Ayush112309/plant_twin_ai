from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional
from app.shared.responses import APIResponse
from .service import AICaseLibraryService
from .schemas import CreateCaseRequest

router = APIRouter(prefix="/case-library", tags=["AI Case Library"])


@router.get("", response_model=APIResponse[List[Dict[str, Any]]])
async def list_cases(query: Optional[str] = Query(None), tag: Optional[str] = Query(None)):
    """Search & filter historical resolved incident cases in Enterprise Knowledge Base."""
    cases = await AICaseLibraryService.list_cases(query, tag)
    return APIResponse.ok(data=cases, message="AI Case Library records retrieved")


@router.get("/similar/{equipment_id}", response_model=APIResponse[Dict[str, Any]])
async def get_pattern_recommendation(equipment_id: str):
    """Auto-match historical incident pattern recommendation for an equipment asset."""
    rec = await AICaseLibraryService.get_pattern_recommendation(equipment_id)
    return APIResponse.ok(data=rec, message="Historical pattern recommendation matched")


@router.post("", response_model=APIResponse[Dict[str, Any]])
async def create_case(request: CreateCaseRequest):
    """Store newly resolved incident case into AI Case Library."""
    new_case = await AICaseLibraryService.create_case(request)
    return APIResponse.ok(data=new_case, message="Resolved incident case created and indexed into Knowledge Base")
