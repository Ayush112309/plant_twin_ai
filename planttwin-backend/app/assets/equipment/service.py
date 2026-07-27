from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
import uuid
from typing import List, Optional
from app.assets.equipment.models import Equipment, AssetStatus
from app.assets.equipment.schemas import EquipmentCreate, EquipmentUpdate

class EquipmentService:
    async def get_by_id(self, db: AsyncSession, equipment_id: uuid.UUID, org_id: uuid.UUID) -> Optional[Equipment]:
        result = await db.execute(select(Equipment).filter(Equipment.id == equipment_id, Equipment.organization_id == org_id, Equipment.is_deleted == False))
        return result.scalars().first()

    async def get_by_asset_tag(self, db: AsyncSession, asset_tag: str, org_id: uuid.UUID) -> Optional[Equipment]:
        result = await db.execute(select(Equipment).filter(Equipment.asset_tag == asset_tag, Equipment.organization_id == org_id, Equipment.is_deleted == False))
        return result.scalars().first()

    async def list_equipment(self, db: AsyncSession, org_id: uuid.UUID, plant_id: Optional[uuid.UUID] = None, area_id: Optional[uuid.UUID] = None, status: Optional[AssetStatus] = None, skip: int = 0, limit: int = 100) -> List[Equipment]:
        query = select(Equipment).filter(Equipment.is_deleted == False, Equipment.organization_id == org_id)
        if plant_id:
            query = query.filter(Equipment.plant_id == plant_id)
        if area_id:
            query = query.filter(Equipment.area_id == area_id)
        if status:
            query = query.filter(Equipment.status == status)
        
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()

    async def create(self, db: AsyncSession, equipment_in: EquipmentCreate) -> Equipment:
        db_equipment = Equipment(**equipment_in.model_dump())
        db.add(db_equipment)
        await db.commit()
        await db.refresh(db_equipment)
        return db_equipment

    async def update(self, db: AsyncSession, db_equipment: Equipment, equipment_in: EquipmentUpdate) -> Equipment:
        update_data = equipment_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_equipment, field, value)
        await db.commit()
        await db.refresh(db_equipment)
        return db_equipment

    async def delete(self, db: AsyncSession, db_equipment: Equipment) -> Equipment:
        db_equipment.is_deleted = True
        await db.commit()
        return db_equipment
        
    async def update_status(self, db: AsyncSession, db_equipment: Equipment, status: AssetStatus) -> Equipment:
        db_equipment.status = status
        await db.commit()
        await db.refresh(db_equipment)
        return db_equipment
