from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import random
import datetime
from uuid import UUID
from typing import List, Optional
from .models import EquipmentHealthScore
from .schemas import HealthScoreResponse

class HealthScoringService:
    async def calculate_health_score(self, db: AsyncSession, equipment_id: UUID) -> EquipmentHealthScore:
        # Mock algorithm
        score = random.uniform(60.0, 100.0)
        component_scores = {
            "motor": random.uniform(50.0, 100.0),
            "bearing": random.uniform(50.0, 100.0)
        }
        factors = {
            "vibration_impact": random.uniform(0.0, 10.0),
            "temperature_impact": random.uniform(0.0, 10.0)
        }
        
        health_score = EquipmentHealthScore(
            equipment_id=equipment_id,
            overall_score=score,
            component_scores=component_scores,
            factors=factors,
            calculated_at=datetime.datetime.utcnow()
        )
        db.add(health_score)
        await db.commit()
        await db.refresh(health_score)
        return health_score

    async def get_latest_score(self, db: AsyncSession, equipment_id: UUID) -> Optional[EquipmentHealthScore]:
        result = await db.execute(
            select(EquipmentHealthScore)
            .where(EquipmentHealthScore.equipment_id == equipment_id)
            .order_by(EquipmentHealthScore.calculated_at.desc())
        )
        return result.scalars().first()

    async def get_score_history(self, db: AsyncSession, equipment_id: UUID) -> List[EquipmentHealthScore]:
        result = await db.execute(
            select(EquipmentHealthScore)
            .where(EquipmentHealthScore.equipment_id == equipment_id)
            .order_by(EquipmentHealthScore.calculated_at.desc())
        )
        return list(result.scalars().all())
