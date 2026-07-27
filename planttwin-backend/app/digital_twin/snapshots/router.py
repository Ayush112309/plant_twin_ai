from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import List
from app.core.database.session import get_db
from app.digital_twin.snapshots.schemas import SnapshotCreate, SnapshotResponse
from app.digital_twin.snapshots.service import SnapshotService
from app.shared.responses import APIResponse

router = APIRouter(prefix="/twins/snapshots", tags=["Twin Snapshots"])
service = SnapshotService()

@router.post("/capture", response_model=APIResponse[SnapshotResponse])
async def capture_snapshot(data: SnapshotCreate, db: AsyncSession = Depends(get_db)):
    result = await service.capture_snapshot(db, data)
    return APIResponse(data=SnapshotResponse.model_validate(result))

@router.get("/by-twin/{twin_id}", response_model=APIResponse[List[SnapshotResponse]])
async def list_by_twin(twin_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    results = await service.list_by_twin(db, twin_id)
    return APIResponse(data=[SnapshotResponse.model_validate(r) for r in results])

@router.get("/{id}", response_model=APIResponse[SnapshotResponse])
async def get_snapshot(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await service.get_snapshot(db, id)
    return APIResponse(data=SnapshotResponse.model_validate(result))

@router.get("/compare", response_model=APIResponse[dict])
async def compare_snapshots(id1: uuid.UUID, id2: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await service.compare_snapshots(db, id1, id2)
    return APIResponse(data=result)
