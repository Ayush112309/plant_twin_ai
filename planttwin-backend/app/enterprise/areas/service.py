from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, List
from uuid import UUID
from .models import Area
from .schemas import AreaCreate, AreaUpdate

class AreaService:
    def __init__(self, db: AsyncSession):
        self.db = db
        
    async def get_by_id(self, area_id: UUID) -> Optional[Area]:
        result = await self.db.execute(select(Area).filter(Area.id == area_id))
        return result.scalars().first()
        
    async def list_areas(self, plant_id: Optional[UUID] = None, skip: int = 0, limit: int = 10) -> List[Area]:
        query = select(Area)
        if plant_id:
            query = query.filter(Area.plant_id == plant_id)
        result = await self.db.execute(query.offset(skip).limit(limit))
        return result.scalars().all()
        
    async def create_area(self, area_in: AreaCreate) -> Area:
        db_area = Area(**area_in.model_dump())
        self.db.add(db_area)
        await self.db.commit()
        await self.db.refresh(db_area)
        return db_area
        
    async def update_area(self, area_id: UUID, area_in: AreaUpdate) -> Optional[Area]:
        db_area = await self.get_by_id(area_id)
        if not db_area:
            return None
            
        update_data = area_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_area, field, value)
            
        await self.db.commit()
        await self.db.refresh(db_area)
        return db_area
        
    async def delete_area(self, area_id: UUID) -> bool:
        db_area = await self.get_by_id(area_id)
        if not db_area:
            return False
            
        await self.db.delete(db_area)
        await self.db.commit()
        return True
