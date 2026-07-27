from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, List
from uuid import UUID
from .models import Plant
from .schemas import PlantCreate, PlantUpdate
from fastapi import HTTPException

class PlantService:
    def __init__(self, db: AsyncSession):
        self.db = db
        
    async def get_by_id(self, plant_id: UUID) -> Optional[Plant]:
        result = await self.db.execute(select(Plant).filter(Plant.id == plant_id, Plant.is_deleted == False))
        return result.scalars().first()
        
    async def list_plants(self, organization_id: Optional[UUID] = None, skip: int = 0, limit: int = 10) -> List[Plant]:
        query = select(Plant).filter(Plant.is_deleted == False)
        if organization_id:
            query = query.filter(Plant.organization_id == organization_id)
        result = await self.db.execute(query.offset(skip).limit(limit))
        return result.scalars().all()
        
    async def create_plant(self, plant_in: PlantCreate) -> Plant:
        # Code uniqueness within org check
        query = select(Plant).filter(Plant.organization_id == plant_in.organization_id, Plant.code == plant_in.code, Plant.is_deleted == False)
        result = await self.db.execute(query)
        if result.scalars().first():
            raise HTTPException(status_code=400, detail="Plant code already exists in this organization")
            
        db_plant = Plant(**plant_in.model_dump())
        self.db.add(db_plant)
        await self.db.commit()
        await self.db.refresh(db_plant)
        return db_plant
        
    async def update_plant(self, plant_id: UUID, plant_in: PlantUpdate) -> Optional[Plant]:
        db_plant = await self.get_by_id(plant_id)
        if not db_plant:
            return None
            
        update_data = plant_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_plant, field, value)
            
        await self.db.commit()
        await self.db.refresh(db_plant)
        return db_plant
        
    async def delete_plant(self, plant_id: UUID) -> bool:
        db_plant = await self.get_by_id(plant_id)
        if not db_plant:
            return False
            
        db_plant.soft_delete()
        await self.db.commit()
        return True
