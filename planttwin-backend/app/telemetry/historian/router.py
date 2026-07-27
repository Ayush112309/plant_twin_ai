from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database.session import get_db
from app.telemetry.historian.schemas import HistorianQueryReq, HistorianResponse, SavedQueryCreate, SavedQueryResponse
from app.telemetry.historian.service import HistorianService
from app.shared.responses import APIResponse
from typing import List
import uuid
from app.identity.authentication.dependencies import get_current_org_id

router = APIRouter(prefix="/historian", tags=["Telemetry Historian"])
service = HistorianService()

@router.post("/query", response_model=APIResponse[List[HistorianResponse]])
async def query_historian(req: HistorianQueryReq, org_id: uuid.UUID = Depends(get_current_org_id), db: AsyncSession = Depends(get_db)):
    result = await service.query_data(db, req, org_id)
    return APIResponse(data=result)

@router.post("/saved", response_model=APIResponse[SavedQueryResponse])
async def save_query(req: SavedQueryCreate, org_id: uuid.UUID = Depends(get_current_org_id), db: AsyncSession = Depends(get_db)):
    if org_id and not req.organization_id:
        req.organization_id = org_id
    result = await service.save_query(db, req)
    return APIResponse(data=SavedQueryResponse.model_validate(result))

@router.get("/saved", response_model=APIResponse[List[SavedQueryResponse]])
async def list_saved_queries(org_id: uuid.UUID = Depends(get_current_org_id), db: AsyncSession = Depends(get_db)):
    results = await service.list_saved_queries(db, org_id)
    return APIResponse(data=[SavedQueryResponse.model_validate(r) for r in results])
