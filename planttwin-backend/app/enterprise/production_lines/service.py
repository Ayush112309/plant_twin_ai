from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, List
from uuid import UUID
from .models import ProductionLine
from .schemas import ProductionLineCreate, ProductionLineUpdate

class ProductionLineService:
    def __init__(self, db: AsyncSession):
        self.db = db
        
    async def get_by_id(self, line_id: UUID) -> Optional[ProductionLine]:
        result = await self.db.execute(select(ProductionLine).filter(ProductionLine.id == line_id))
        return result.scalars().first()
        
    async def list_lines(self, area_id: Optional[UUID] = None, skip: int = 0, limit: int = 10) -> List[ProductionLine]:
        query = select(ProductionLine)
        if area_id:
            query = query.filter(ProductionLine.area_id == area_id)
        result = await self.db.execute(query.offset(skip).limit(limit))
        return result.scalars().all()
        
    async def create_line(self, line_in: ProductionLineCreate) -> ProductionLine:
        db_line = ProductionLine(**line_in.model_dump())
        self.db.add(db_line)
        await self.db.commit()
        await self.db.refresh(db_line)
        return db_line
        
    async def update_line(self, line_id: UUID, line_in: ProductionLineUpdate) -> Optional[ProductionLine]:
        db_line = await self.get_by_id(line_id)
        if not db_line:
            return None
            
        update_data = line_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_line, field, value)
            
        await self.db.commit()
        await self.db.refresh(db_line)
        return db_line
        
    async def delete_line(self, line_id: UUID) -> bool:
        db_line = await self.get_by_id(line_id)
        if not db_line:
            return False
            
        await self.db.delete(db_line)
        await self.db.commit()
        return True
