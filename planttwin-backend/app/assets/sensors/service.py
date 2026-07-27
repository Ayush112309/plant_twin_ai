from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid
from typing import List, Optional
from app.assets.sensors.models import Sensor
from app.assets.sensors.schemas import SensorCreate, SensorUpdate

class SensorService:
    async def get_by_id(self, db: AsyncSession, sensor_id: uuid.UUID, org_id: uuid.UUID) -> Optional[Sensor]:
        result = await db.execute(select(Sensor).filter(Sensor.id == sensor_id, Sensor.organization_id == org_id))
        return result.scalars().first()

    async def list_by_equipment(self, db: AsyncSession, equipment_id: uuid.UUID, org_id: uuid.UUID) -> List[Sensor]:
        result = await db.execute(select(Sensor).filter(Sensor.equipment_id == equipment_id, Sensor.organization_id == org_id))
        return result.scalars().all()

    async def create(self, db: AsyncSession, sensor_in: SensorCreate) -> Sensor:
        db_sensor = Sensor(**sensor_in.model_dump())
        db.add(db_sensor)
        await db.commit()
        await db.refresh(db_sensor)
        return db_sensor

    async def update(self, db: AsyncSession, db_sensor: Sensor, sensor_in: SensorUpdate) -> Sensor:
        update_data = sensor_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_sensor, field, value)
        await db.commit()
        await db.refresh(db_sensor)
        return db_sensor

    async def delete(self, db: AsyncSession, db_sensor: Sensor) -> None:
        await db.delete(db_sensor)
        await db.commit()
