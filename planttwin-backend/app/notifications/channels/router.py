from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.shared.pagination import PaginationParams, PaginatedResponse
from .schemas import ChannelCreate, ChannelUpdate, ChannelResponse
from .service import NotificationChannelService

router = APIRouter(prefix="/notification-channels", tags=["Notification Channels"])

@router.post("/", response_model=APIResponse[ChannelResponse])
async def create(data: ChannelCreate, db: AsyncSession = Depends(get_db)):
    obj = await NotificationChannelService.create(db, data)
    return APIResponse(data=obj, message="Channel created")

@router.get("/{id}", response_model=APIResponse[ChannelResponse])
async def get(id: UUID, db: AsyncSession = Depends(get_db)):
    obj = await NotificationChannelService.get(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Channel not found")
    return APIResponse(data=obj)

@router.get("/", response_model=APIResponse[PaginatedResponse[ChannelResponse]])
async def list_channels(params: PaginationParams = Depends(), db: AsyncSession = Depends(get_db)):
    return APIResponse(data=await NotificationChannelService.list_channels(db, params))

@router.put("/{id}", response_model=APIResponse[ChannelResponse])
async def update(id: UUID, data: ChannelUpdate, db: AsyncSession = Depends(get_db)):
    obj = await NotificationChannelService.update(db, id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Channel not found")
    return APIResponse(data=obj, message="Channel updated")

@router.delete("/{id}", response_model=APIResponse[bool])
async def delete(id: UUID, db: AsyncSession = Depends(get_db)):
    success = await NotificationChannelService.delete(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Channel not found")
    return APIResponse(data=True, message="Channel deleted")

@router.post("/{id}/test", response_model=APIResponse[bool])
async def test_channel(id: UUID, db: AsyncSession = Depends(get_db)):
    success = await NotificationChannelService.test_channel(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Channel not found or test failed")
    return APIResponse(data=True, message="Channel tested successfully")
