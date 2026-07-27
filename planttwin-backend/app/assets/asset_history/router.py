from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import List, Dict, Any
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.assets.asset_history.schemas import HistoryCreate, HistoryResponse
from app.assets.asset_history.service import HistoryService
from app.assets.asset_history.timeline_service import AssetTimelineService
from app.identity.authentication.dependencies import get_current_org_id

router = APIRouter(prefix="/history", tags=["Asset History & Timeline"])
history_service = HistoryService()

@router.post("/", response_model=HistoryResponse, status_code=status.HTTP_201_CREATED)
async def create_history(history_in: HistoryCreate, org_id: uuid.UUID = Depends(get_current_org_id), db: AsyncSession = Depends(get_db)):
    if org_id and not history_in.organization_id:
        history_in.organization_id = org_id
    return await history_service.create(db=db, history_in=history_in)

@router.get("/by-equipment/{equipment_id}", response_model=List[HistoryResponse])
async def list_history_by_equipment(equipment_id: uuid.UUID, org_id: uuid.UUID = Depends(get_current_org_id), db: AsyncSession = Depends(get_db)):
    return await history_service.list_by_equipment(db=db, equipment_id=equipment_id, org_id=org_id)

@router.get("/timeline/{equipment_id}", response_model=APIResponse[List[Dict[str, Any]]])
async def get_asset_timeline(equipment_id: str):
    """Retrieve full chronological event timeline for an asset."""
    timeline = await AssetTimelineService.get_timeline(equipment_id)
    return APIResponse.ok(data=timeline, message="Asset event timeline retrieved successfully")
