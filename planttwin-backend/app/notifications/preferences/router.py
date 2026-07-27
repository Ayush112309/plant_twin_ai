from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from .schemas import PreferenceUpdate, PreferenceResponse
from .service import NotificationPreferenceService

router = APIRouter(prefix="/notification-preferences", tags=["Notification Preferences"])

@router.get("/{user_id}", response_model=APIResponse[List[PreferenceResponse]])
async def get_preferences(user_id: UUID, db: AsyncSession = Depends(get_db)):
    prefs = await NotificationPreferenceService.get_by_user(db, user_id)
    return APIResponse(data=prefs)

@router.put("/{user_id}", response_model=APIResponse[List[PreferenceResponse]])
async def update_preferences(user_id: UUID, data: List[PreferenceUpdate], db: AsyncSession = Depends(get_db)):
    prefs = await NotificationPreferenceService.update_preferences(db, user_id, data)
    return APIResponse(data=prefs, message="Preferences updated")
