from uuid import UUID
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .models import NotificationPreference
from .schemas import PreferenceUpdate

class NotificationPreferenceService:
    @staticmethod
    async def get_by_user(db: AsyncSession, user_id: UUID) -> List[NotificationPreference]:
        result = await db.execute(select(NotificationPreference).where(NotificationPreference.user_id == str(user_id)))
        return list(result.scalars().all())

    @staticmethod
    async def update_preferences(db: AsyncSession, user_id: UUID, prefs: List[PreferenceUpdate]) -> List[NotificationPreference]:
        # Delete existing and insert new
        existing = await NotificationPreferenceService.get_by_user(db, user_id)
        for e in existing:
            await db.delete(e)
            
        new_prefs = []
        for p in prefs:
            obj = NotificationPreference(user_id=str(user_id), **p.model_dump())
            db.add(obj)
            new_prefs.append(obj)
            
        await db.commit()
        for obj in new_prefs:
            await db.refresh(obj)
        return new_prefs
