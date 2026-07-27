import os

base_dir = r"C:\Users\ayush\.gemini\antigravity\scratch\planttwin-backend"

files_to_create = {
    r"app\assets\equipment\models.py": """import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Enum as SAEnum, JSON
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
import enum

from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin
from app.shared.mixins.soft_delete_mixin import SoftDeleteMixin
from app.shared.mixins.timestamp_mixin import TimestampMixin

class AssetStatus(enum.Enum):
    IDLE = "IDLE"
    RUNNING = "RUNNING"
    MAINTENANCE = "MAINTENANCE"
    OFFLINE = "OFFLINE"
    ERROR = "ERROR"

class Equipment(Base, UUIDModelMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "equipment"

    name: Mapped[str] = mapped_column(String, index=True)
    asset_tag: Mapped[str] = mapped_column(String, unique=True, index=True)
    equipment_type: Mapped[str] = mapped_column(String)
    manufacturer: Mapped[str] = mapped_column(String, nullable=True)
    model_number: Mapped[str] = mapped_column(String, nullable=True)
    serial_number: Mapped[str] = mapped_column(String, nullable=True)
    plant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("plants.id"))
    area_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("areas.id"), nullable=True)
    status: Mapped[AssetStatus] = mapped_column(SAEnum(AssetStatus), default=AssetStatus.IDLE)
    installation_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    warranty_expiry: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    specifications: Mapped[dict] = mapped_column(JSON, nullable=True)
    metadata_: Mapped[dict] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships are typically defined as strings to avoid circular imports
    # sensors = relationship("Sensor", back_populates="equipment")
    # documents = relationship("AssetDocument", back_populates="equipment")
    # history = relationship("AssetHistory", back_populates="equipment")
""",
    r"app\assets\equipment\schemas.py": """from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
import uuid
from app.assets.equipment.models import AssetStatus

class EquipmentBase(BaseModel):
    name: str
    asset_tag: str
    equipment_type: str
    manufacturer: Optional[str] = None
    model_number: Optional[str] = None
    serial_number: Optional[str] = None
    plant_id: uuid.UUID
    area_id: Optional[uuid.UUID] = None
    status: AssetStatus = AssetStatus.IDLE
    installation_date: Optional[datetime] = None
    warranty_expiry: Optional[datetime] = None
    specifications: Optional[Dict[str, Any]] = None
    metadata_: Optional[Dict[str, Any]] = None
    is_active: bool = True

class EquipmentCreate(EquipmentBase):
    pass

class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    asset_tag: Optional[str] = None
    equipment_type: Optional[str] = None
    manufacturer: Optional[str] = None
    model_number: Optional[str] = None
    serial_number: Optional[str] = None
    plant_id: Optional[uuid.UUID] = None
    area_id: Optional[uuid.UUID] = None
    status: Optional[AssetStatus] = None
    installation_date: Optional[datetime] = None
    warranty_expiry: Optional[datetime] = None
    specifications: Optional[Dict[str, Any]] = None
    metadata_: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class EquipmentResponse(EquipmentBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
""",
    r"app\assets\equipment\service.py": """from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
import uuid
from typing import List, Optional
from app.assets.equipment.models import Equipment, AssetStatus
from app.assets.equipment.schemas import EquipmentCreate, EquipmentUpdate

class EquipmentService:
    async def get_by_id(self, db: AsyncSession, equipment_id: uuid.UUID) -> Optional[Equipment]:
        result = await db.execute(select(Equipment).filter(Equipment.id == equipment_id, Equipment.is_deleted == False))
        return result.scalars().first()

    async def get_by_asset_tag(self, db: AsyncSession, asset_tag: str) -> Optional[Equipment]:
        result = await db.execute(select(Equipment).filter(Equipment.asset_tag == asset_tag, Equipment.is_deleted == False))
        return result.scalars().first()

    async def list_equipment(self, db: AsyncSession, plant_id: Optional[uuid.UUID] = None, area_id: Optional[uuid.UUID] = None, status: Optional[AssetStatus] = None, skip: int = 0, limit: int = 100) -> List[Equipment]:
        query = select(Equipment).filter(Equipment.is_deleted == False)
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
""",
    r"app\assets\equipment\router.py": """from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import List, Optional
from app.core.database.session import get_db
from app.assets.equipment.schemas import EquipmentCreate, EquipmentUpdate, EquipmentResponse
from app.assets.equipment.service import EquipmentService
from app.assets.equipment.models import AssetStatus
from pydantic import BaseModel

router = APIRouter(prefix="/equipment", tags=["Equipment"])
equipment_service = EquipmentService()

class StatusUpdate(BaseModel):
    status: AssetStatus

@router.post("/", response_model=EquipmentResponse, status_code=status.HTTP_201_CREATED)
async def create_equipment(equipment_in: EquipmentCreate, db: AsyncSession = Depends(get_db)):
    existing = await equipment_service.get_by_asset_tag(db, asset_tag=equipment_in.asset_tag)
    if existing:
        raise HTTPException(status_code=400, detail="Equipment with this asset tag already exists")
    return await equipment_service.create(db=db, equipment_in=equipment_in)

@router.get("/", response_model=List[EquipmentResponse])
async def list_equipment(plant_id: Optional[uuid.UUID] = None, area_id: Optional[uuid.UUID] = None, eq_status: Optional[AssetStatus] = None, skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await equipment_service.list_equipment(db=db, plant_id=plant_id, area_id=area_id, status=eq_status, skip=skip, limit=limit)

@router.get("/{equipment_id}", response_model=EquipmentResponse)
async def get_equipment(equipment_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    equipment = await equipment_service.get_by_id(db=db, equipment_id=equipment_id)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return equipment

@router.get("/by-tag/{tag}", response_model=EquipmentResponse)
async def get_equipment_by_tag(tag: str, db: AsyncSession = Depends(get_db)):
    equipment = await equipment_service.get_by_asset_tag(db=db, asset_tag=tag)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return equipment

@router.put("/{equipment_id}", response_model=EquipmentResponse)
async def update_equipment(equipment_id: uuid.UUID, equipment_in: EquipmentUpdate, db: AsyncSession = Depends(get_db)):
    equipment = await equipment_service.get_by_id(db=db, equipment_id=equipment_id)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return await equipment_service.update(db=db, db_equipment=equipment, equipment_in=equipment_in)

@router.delete("/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_equipment(equipment_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    equipment = await equipment_service.get_by_id(db=db, equipment_id=equipment_id)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    await equipment_service.delete(db=db, db_equipment=equipment)

@router.patch("/{equipment_id}/status", response_model=EquipmentResponse)
async def update_equipment_status(equipment_id: uuid.UUID, status_update: StatusUpdate, db: AsyncSession = Depends(get_db)):
    equipment = await equipment_service.get_by_id(db=db, equipment_id=equipment_id)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return await equipment_service.update_status(db=db, db_equipment=equipment, status=status_update.status)
""",
    r"app\assets\sensors\models.py": """import uuid
from sqlalchemy import String, Float, Integer, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin

class Sensor(Base, UUIDModelMixin):
    __tablename__ = "sensors"

    name: Mapped[str] = mapped_column(String)
    sensor_tag: Mapped[str] = mapped_column(String, unique=True, index=True)
    sensor_type: Mapped[str] = mapped_column(String)
    unit_of_measure: Mapped[str] = mapped_column(String)
    equipment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("equipment.id"))
    min_value: Mapped[float] = mapped_column(Float, nullable=True)
    max_value: Mapped[float] = mapped_column(Float, nullable=True)
    precision: Mapped[int] = mapped_column(Integer, default=2)
    data_type: Mapped[str] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
""",
    r"app\assets\sensors\schemas.py": """from pydantic import BaseModel
from typing import Optional
import uuid

class SensorBase(BaseModel):
    name: str
    sensor_tag: str
    sensor_type: str
    unit_of_measure: str
    equipment_id: uuid.UUID
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    precision: int = 2
    data_type: str
    is_active: bool = True

class SensorCreate(SensorBase):
    pass

class SensorUpdate(BaseModel):
    name: Optional[str] = None
    sensor_tag: Optional[str] = None
    sensor_type: Optional[str] = None
    unit_of_measure: Optional[str] = None
    equipment_id: Optional[uuid.UUID] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    precision: Optional[int] = None
    data_type: Optional[str] = None
    is_active: Optional[bool] = None

class SensorResponse(SensorBase):
    id: uuid.UUID

    class Config:
        from_attributes = True
""",
    r"app\assets\sensors\service.py": """from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid
from typing import List, Optional
from app.assets.sensors.models import Sensor
from app.assets.sensors.schemas import SensorCreate, SensorUpdate

class SensorService:
    async def get_by_id(self, db: AsyncSession, sensor_id: uuid.UUID) -> Optional[Sensor]:
        result = await db.execute(select(Sensor).filter(Sensor.id == sensor_id))
        return result.scalars().first()

    async def list_by_equipment(self, db: AsyncSession, equipment_id: uuid.UUID) -> List[Sensor]:
        result = await db.execute(select(Sensor).filter(Sensor.equipment_id == equipment_id))
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
""",
    r"app\assets\sensors\router.py": """from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import List
from app.core.database.session import get_db
from app.assets.sensors.schemas import SensorCreate, SensorUpdate, SensorResponse
from app.assets.sensors.service import SensorService

router = APIRouter(prefix="/sensors", tags=["Sensors"])
sensor_service = SensorService()

@router.post("/", response_model=SensorResponse, status_code=status.HTTP_201_CREATED)
async def create_sensor(sensor_in: SensorCreate, db: AsyncSession = Depends(get_db)):
    return await sensor_service.create(db=db, sensor_in=sensor_in)

@router.get("/by-equipment/{equipment_id}", response_model=List[SensorResponse])
async def list_sensors_by_equipment(equipment_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return await sensor_service.list_by_equipment(db=db, equipment_id=equipment_id)

@router.get("/{sensor_id}", response_model=SensorResponse)
async def get_sensor(sensor_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    sensor = await sensor_service.get_by_id(db=db, sensor_id=sensor_id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    return sensor

@router.put("/{sensor_id}", response_model=SensorResponse)
async def update_sensor(sensor_id: uuid.UUID, sensor_in: SensorUpdate, db: AsyncSession = Depends(get_db)):
    sensor = await sensor_service.get_by_id(db=db, sensor_id=sensor_id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    return await sensor_service.update(db=db, db_sensor=sensor, sensor_in=sensor_in)

@router.delete("/{sensor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sensor(sensor_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    sensor = await sensor_service.get_by_id(db=db, sensor_id=sensor_id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    await sensor_service.delete(db=db, db_sensor=sensor)
""",
    r"app\assets\documents\models.py": """import uuid
from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin

class AssetDocument(Base, UUIDModelMixin):
    __tablename__ = "asset_documents"

    title: Mapped[str] = mapped_column(String)
    document_type: Mapped[str] = mapped_column(String) # manual/drawing/datasheet/certificate
    equipment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("equipment.id"))
    file_path: Mapped[str] = mapped_column(String)
    file_size: Mapped[int] = mapped_column(Integer)
    mime_type: Mapped[str] = mapped_column(String)
    uploaded_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    version: Mapped[str] = mapped_column(String, default="1.0")
""",
    r"app\assets\documents\schemas.py": """from pydantic import BaseModel
from typing import Optional
import uuid

class DocumentBase(BaseModel):
    title: str
    document_type: str
    equipment_id: uuid.UUID
    file_path: str
    file_size: int
    mime_type: str
    uploaded_by: Optional[uuid.UUID] = None
    version: str = "1.0"

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    document_type: Optional[str] = None
    version: Optional[str] = None

class DocumentResponse(DocumentBase):
    id: uuid.UUID

    class Config:
        from_attributes = True
""",
    r"app\assets\documents\service.py": """from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid
from typing import List, Optional
from app.assets.documents.models import AssetDocument
from app.assets.documents.schemas import DocumentCreate, DocumentUpdate

class DocumentService:
    async def get_by_id(self, db: AsyncSession, doc_id: uuid.UUID) -> Optional[AssetDocument]:
        result = await db.execute(select(AssetDocument).filter(AssetDocument.id == doc_id))
        return result.scalars().first()

    async def list_by_equipment(self, db: AsyncSession, equipment_id: uuid.UUID) -> List[AssetDocument]:
        result = await db.execute(select(AssetDocument).filter(AssetDocument.equipment_id == equipment_id))
        return result.scalars().all()

    async def create(self, db: AsyncSession, doc_in: DocumentCreate) -> AssetDocument:
        db_doc = AssetDocument(**doc_in.model_dump())
        db.add(db_doc)
        await db.commit()
        await db.refresh(db_doc)
        return db_doc

    async def update(self, db: AsyncSession, db_doc: AssetDocument, doc_in: DocumentUpdate) -> AssetDocument:
        update_data = doc_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_doc, field, value)
        await db.commit()
        await db.refresh(db_doc)
        return db_doc

    async def delete(self, db: AsyncSession, db_doc: AssetDocument) -> None:
        await db.delete(db_doc)
        await db.commit()
""",
    r"app\assets\documents\router.py": """from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import List
from app.core.database.session import get_db
from app.assets.documents.schemas import DocumentCreate, DocumentUpdate, DocumentResponse
from app.assets.documents.service import DocumentService

router = APIRouter(prefix="/documents", tags=["Documents"])
document_service = DocumentService()

@router.post("/", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(doc_in: DocumentCreate, db: AsyncSession = Depends(get_db)):
    return await document_service.create(db=db, doc_in=doc_in)

@router.get("/by-equipment/{equipment_id}", response_model=List[DocumentResponse])
async def list_documents_by_equipment(equipment_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return await document_service.list_by_equipment(db=db, equipment_id=equipment_id)

@router.get("/{doc_id}", response_model=DocumentResponse)
async def get_document(doc_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    doc = await document_service.get_by_id(db=db, doc_id=doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.put("/{doc_id}", response_model=DocumentResponse)
async def update_document(doc_id: uuid.UUID, doc_in: DocumentUpdate, db: AsyncSession = Depends(get_db)):
    doc = await document_service.get_by_id(db=db, doc_id=doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return await document_service.update(db=db, db_doc=doc, doc_in=doc_in)

@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(doc_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    doc = await document_service.get_by_id(db=db, doc_id=doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    await document_service.delete(db=db, db_doc=doc)
""",
    r"app\assets\asset_history\models.py": """import uuid
from sqlalchemy import String, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime

from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin
from app.shared.mixins.timestamp_mixin import TimestampMixin

class AssetHistory(Base, UUIDModelMixin, TimestampMixin):
    __tablename__ = "asset_history"

    equipment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("equipment.id"))
    event_type: Mapped[str] = mapped_column(String) # status_change/maintenance/calibration/inspection
    description: Mapped[str] = mapped_column(String)
    performed_by: Mapped[str] = mapped_column(String)
    old_value: Mapped[dict] = mapped_column(JSON, nullable=True)
    new_value: Mapped[dict] = mapped_column(JSON, nullable=True)
""",
    r"app\assets\asset_history\schemas.py": """from pydantic import BaseModel
from typing import Optional, Dict, Any
import uuid
from datetime import datetime

class HistoryBase(BaseModel):
    equipment_id: uuid.UUID
    event_type: str
    description: str
    performed_by: str
    old_value: Optional[Dict[str, Any]] = None
    new_value: Optional[Dict[str, Any]] = None

class HistoryCreate(HistoryBase):
    pass

class HistoryResponse(HistoryBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
""",
    r"app\assets\asset_history\service.py": """from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid
from typing import List
from app.assets.asset_history.models import AssetHistory
from app.assets.asset_history.schemas import HistoryCreate

class HistoryService:
    async def list_by_equipment(self, db: AsyncSession, equipment_id: uuid.UUID) -> List[AssetHistory]:
        result = await db.execute(select(AssetHistory).filter(AssetHistory.equipment_id == equipment_id).order_by(AssetHistory.created_at.desc()))
        return result.scalars().all()

    async def create(self, db: AsyncSession, history_in: HistoryCreate) -> AssetHistory:
        db_history = AssetHistory(**history_in.model_dump())
        db.add(db_history)
        await db.commit()
        await db.refresh(db_history)
        return db_history
""",
    r"app\assets\asset_history\router.py": """from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import List
from app.core.database.session import get_db
from app.assets.asset_history.schemas import HistoryCreate, HistoryResponse
from app.assets.asset_history.service import HistoryService

router = APIRouter(prefix="/history", tags=["Asset History"])
history_service = HistoryService()

@router.post("/", response_model=HistoryResponse, status_code=status.HTTP_201_CREATED)
async def create_history(history_in: HistoryCreate, db: AsyncSession = Depends(get_db)):
    return await history_service.create(db=db, history_in=history_in)

@router.get("/by-equipment/{equipment_id}", response_model=List[HistoryResponse])
async def list_history_by_equipment(equipment_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return await history_service.list_by_equipment(db=db, equipment_id=equipment_id)
""",
    r"app\assets\router.py": """from fastapi import APIRouter
from app.assets.equipment.router import router as equipment_router
from app.assets.sensors.router import router as sensors_router
from app.assets.documents.router import router as documents_router
from app.assets.asset_history.router import router as history_router

router = APIRouter(prefix="/assets")
router.include_router(equipment_router)
router.include_router(sensors_router)
router.include_router(documents_router)
router.include_router(history_router)
"""
}

for rel_path, content in files_to_create.items():
    full_path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Assets module files created successfully.")
