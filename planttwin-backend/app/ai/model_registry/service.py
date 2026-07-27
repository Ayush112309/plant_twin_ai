from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List, Optional
from .models import MLModel
from .schemas import ModelCreate, ModelUpdate

class ModelRegistryService:
    async def register_model(self, db: AsyncSession, data: ModelCreate) -> MLModel:
        model = MLModel(**data.model_dump())
        db.add(model)
        await db.commit()
        await db.refresh(model)
        return model

    async def get_model(self, db: AsyncSession, model_id: UUID) -> Optional[MLModel]:
        result = await db.execute(select(MLModel).where(MLModel.id == model_id))
        return result.scalars().first()

    async def list_models(self, db: AsyncSession, model_type: Optional[str] = None) -> List[MLModel]:
        query = select(MLModel)
        if model_type:
            query = query.where(MLModel.model_type == model_type)
        result = await db.execute(query)
        return list(result.scalars().all())

    async def update_model(self, db: AsyncSession, model_id: UUID, data: ModelUpdate) -> Optional[MLModel]:
        model = await self.get_model(db, model_id)
        if model:
            for key, value in data.model_dump(exclude_unset=True).items():
                setattr(model, key, value)
            await db.commit()
            await db.refresh(model)
        return model

    async def promote_model(self, db: AsyncSession, model_id: UUID, new_status: str) -> Optional[MLModel]:
        model = await self.get_model(db, model_id)
        if model:
            model.status = new_status
            await db.commit()
            await db.refresh(model)
        return model

    async def get_production_model(self, db: AsyncSession, model_type: str) -> Optional[MLModel]:
        result = await db.execute(
            select(MLModel)
            .where(MLModel.model_type == model_type, MLModel.status == "production")
            .order_by(MLModel.created_at.desc())
        )
        return result.scalars().first()
