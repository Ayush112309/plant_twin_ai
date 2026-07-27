from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List, Optional
import datetime
from .models import Alarm
from .schemas import AlarmCreate, AlarmUpdate, AlarmAcknowledge

class AlarmService:
    async def create_alarm(self, db: AsyncSession, data: AlarmCreate) -> Alarm:
        alarm = Alarm(**data.model_dump())
        db.add(alarm)
        await db.commit()
        await db.refresh(alarm)
        return alarm

    async def get_alarm(self, db: AsyncSession, alarm_id: UUID) -> Optional[Alarm]:
        result = await db.execute(select(Alarm).where(Alarm.id == alarm_id))
        return result.scalars().first()

    async def update_alarm(self, db: AsyncSession, alarm_id: UUID, data: AlarmUpdate) -> Optional[Alarm]:
        alarm = await self.get_alarm(db, alarm_id)
        if alarm:
            for key, value in data.model_dump(exclude_unset=True).items():
                setattr(alarm, key, value)
            await db.commit()
            await db.refresh(alarm)
        return alarm
        
    async def evaluate_alarm(self, db: AsyncSession, alarm_id: UUID, value: float) -> Optional[Alarm]:
        alarm = await self.get_alarm(db, alarm_id)
        if not alarm or not alarm.is_active:
            return None
        
        # Simple threshold evaluation mock
        threshold = alarm.condition_config.get("threshold", 0)
        operator = alarm.condition_config.get("operator", ">")
        
        triggered = False
        if operator == ">" and value > threshold:
            triggered = True
        elif operator == "<" and value < threshold:
            triggered = True
            
        if triggered and not alarm.is_triggered:
            alarm.is_triggered = True
            alarm.triggered_at = datetime.datetime.utcnow()
            alarm.acknowledged = False
            await db.commit()
            await db.refresh(alarm)
            
        return alarm

    async def trigger_alarm(self, db: AsyncSession, alarm_id: UUID) -> Optional[Alarm]:
        alarm = await self.get_alarm(db, alarm_id)
        if alarm:
            alarm.is_triggered = True
            alarm.triggered_at = datetime.datetime.utcnow()
            alarm.acknowledged = False
            await db.commit()
            await db.refresh(alarm)
        return alarm

    async def acknowledge_alarm(self, db: AsyncSession, alarm_id: UUID, user_id: str) -> Optional[Alarm]:
        alarm = await self.get_alarm(db, alarm_id)
        if alarm and alarm.is_triggered:
            alarm.acknowledged = True
            alarm.acknowledged_by = user_id
            alarm.acknowledged_at = datetime.datetime.utcnow()
            await db.commit()
            await db.refresh(alarm)
        return alarm

    async def list_active_alarms(self, db: AsyncSession) -> List[Alarm]:
        result = await db.execute(
            select(Alarm).where(Alarm.is_triggered == True, Alarm.acknowledged == False)
        )
        return list(result.scalars().all())

    async def list_alarm_history(self, db: AsyncSession) -> List[Alarm]:
        result = await db.execute(
            select(Alarm).where(Alarm.is_triggered == True).order_by(Alarm.triggered_at.desc())
        )
        return list(result.scalars().all())
