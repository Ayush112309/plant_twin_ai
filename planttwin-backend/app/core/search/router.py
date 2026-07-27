from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from .search_service import SearchService

router = APIRouter(prefix="/search", tags=["Global Search & Command Palette"])


@router.get("", response_model=APIResponse[dict])
async def global_search(
    q: str = Query(..., min_length=1, description="Search query string"),
    db: AsyncSession = Depends(get_db)
):
    """Global search across equipment, sensors, plants, alarms, predictions, work orders, connectors, and reports."""
    results = await SearchService.global_search(db, q)
    return APIResponse.success(data=results, message="Global search query executed")
