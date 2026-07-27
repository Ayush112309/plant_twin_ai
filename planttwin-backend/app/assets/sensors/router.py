from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import List
from app.core.database.session import get_db
from app.assets.sensors.schemas import SensorCreate, SensorUpdate, SensorResponse
from app.assets.sensors.service import SensorService
from app.identity.authentication.dependencies import get_current_org_id

router = APIRouter(prefix="/sensors", tags=["Sensors"])
sensor_service = SensorService()

@router.post("/", response_model=SensorResponse, status_code=status.HTTP_201_CREATED)
async def create_sensor(sensor_in: SensorCreate, org_id: uuid.UUID = Depends(get_current_org_id), db: AsyncSession = Depends(get_db)):
    if org_id and not sensor_in.organization_id:
        sensor_in.organization_id = org_id
    return await sensor_service.create(db=db, sensor_in=sensor_in)

@router.get("/by-equipment/{equipment_id}", response_model=List[SensorResponse])
async def list_sensors_by_equipment(equipment_id: uuid.UUID, org_id: uuid.UUID = Depends(get_current_org_id), db: AsyncSession = Depends(get_db)):
    return await sensor_service.list_by_equipment(db=db, equipment_id=equipment_id, org_id=org_id)

@router.get("/{sensor_id}", response_model=SensorResponse)
async def get_sensor(sensor_id: uuid.UUID, org_id: uuid.UUID = Depends(get_current_org_id), db: AsyncSession = Depends(get_db)):
    sensor = await sensor_service.get_by_id(db=db, sensor_id=sensor_id, org_id=org_id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    return sensor

@router.put("/{sensor_id}", response_model=SensorResponse)
async def update_sensor(sensor_id: uuid.UUID, sensor_in: SensorUpdate, org_id: uuid.UUID = Depends(get_current_org_id), db: AsyncSession = Depends(get_db)):
    sensor = await sensor_service.get_by_id(db=db, sensor_id=sensor_id, org_id=org_id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    return await sensor_service.update(db=db, db_sensor=sensor, sensor_in=sensor_in)

@router.delete("/{sensor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sensor(sensor_id: uuid.UUID, org_id: uuid.UUID = Depends(get_current_org_id), db: AsyncSession = Depends(get_db)):
    sensor = await sensor_service.get_by_id(db=db, sensor_id=sensor_id, org_id=org_id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    await sensor_service.delete(db=db, db_sensor=sensor)
