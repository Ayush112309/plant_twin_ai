from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import random
import datetime
from uuid import UUID
from typing import List
from .models import Prediction
from .schemas import PredictionRequest

class PredictionService:
    async def generate_prediction(self, db: AsyncSession, request: PredictionRequest) -> Prediction:
        # Mock implementation
        confidence = random.uniform(0.7, 0.95)
        predicted_value = random.uniform(10.0, 100.0)
        target_date = datetime.datetime.utcnow() + datetime.timedelta(days=request.horizon_days)
        
        prediction = Prediction(
            equipment_id=request.equipment_id,
            prediction_type=request.prediction_type,
            predicted_value=predicted_value,
            confidence=confidence,
            predicted_at=datetime.datetime.utcnow(),
            target_date=target_date,
            model_version="v1.0.0"
        )
        db.add(prediction)
        await db.commit()
        await db.refresh(prediction)
        return prediction

    async def list_predictions(self, db: AsyncSession, equipment_id: UUID) -> List[Prediction]:
        result = await db.execute(
            select(Prediction)
            .where(Prediction.equipment_id == equipment_id)
            .order_by(Prediction.predicted_at.desc())
        )
        return list(result.scalars().all())
