import os
import textwrap

BASE_DIR = r"C:\Users\ayush\.gemini\antigravity\scratch\planttwin-backend"

def write_file(path, content):
    full_path = os.path.join(BASE_DIR, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")

files = {}

files["app/telemetry/ingestion/models.py"] = """
import uuid
from sqlalchemy import String, Float, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.shared.mixins.base_model import Base
from app.shared.mixins.timestamp_mixin import TimestampMixin
import enum

class QualityCode(str, enum.Enum):
    GOOD = "GOOD"
    BAD = "BAD"
    UNCERTAIN = "UNCERTAIN"

class TelemetryData(Base, TimestampMixin):
    __tablename__ = "telemetry_data"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sensor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("sensors.id"), index=True, nullable=True)
    tag: Mapped[str] = mapped_column(String, index=True)
    value: Mapped[float] = mapped_column(Float, nullable=True)
    string_value: Mapped[str] = mapped_column(String, nullable=True)
    quality: Mapped[QualityCode] = mapped_column(SAEnum(QualityCode), default=QualityCode.GOOD)
    timestamp: Mapped[DateTime] = mapped_column(DateTime(timezone=True), index=True)
    source_connector_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("connectors.id"), nullable=True)
    raw_value: Mapped[str] = mapped_column(String, nullable=True)
    unit: Mapped[str] = mapped_column(String, nullable=True)
"""

files["app/telemetry/ingestion/schemas.py"] = """
from pydantic import BaseModel, Field
from typing import Optional, List
import uuid
from datetime import datetime
from app.telemetry.ingestion.models import QualityCode

class TelemetryDataPoint(BaseModel):
    sensor_id: Optional[uuid.UUID] = None
    tag: Optional[str] = None
    value: Optional[float] = None
    string_value: Optional[str] = None
    quality: QualityCode = QualityCode.GOOD
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow)
    raw_value: Optional[str] = None
    unit: Optional[str] = None

class TelemetryBatchIngest(BaseModel):
    data_points: List[TelemetryDataPoint]

class TelemetryResponse(BaseModel):
    id: uuid.UUID
    sensor_id: Optional[uuid.UUID]
    tag: str
    value: Optional[float]
    quality: QualityCode
    timestamp: datetime
    
    class Config:
        from_attributes = True
"""

files["app/telemetry/ingestion/service.py"] = """
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import insert
from typing import List
from app.telemetry.ingestion.models import TelemetryData
from app.telemetry.ingestion.schemas import TelemetryDataPoint, TelemetryBatchIngest

class TelemetryIngestionService:
    async def ingest_single(self, db: AsyncSession, data_point: TelemetryDataPoint) -> TelemetryData:
        db_obj = TelemetryData(**data_point.model_dump())
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def ingest_batch(self, db: AsyncSession, batch: TelemetryBatchIngest) -> List[TelemetryData]:
        objects = [TelemetryData(**dp.model_dump()) for dp in batch.data_points]
        db.add_all(objects)
        await db.commit()
        return objects

    async def validate_data_point(self, data_point: TelemetryDataPoint, min_val: float, max_val: float) -> bool:
        if data_point.value is not None:
            return min_val <= data_point.value <= max_val
        return True
"""

files["app/telemetry/ingestion/router.py"] = """
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database.session import get_db
from app.telemetry.ingestion.schemas import TelemetryDataPoint, TelemetryBatchIngest, TelemetryResponse
from app.telemetry.ingestion.service import TelemetryIngestionService
from app.shared.responses import APIResponse

router = APIRouter(prefix="/ingest", tags=["Telemetry Ingestion"])
service = TelemetryIngestionService()

@router.post("", response_model=APIResponse[TelemetryResponse])
async def ingest_single(data: TelemetryDataPoint, db: AsyncSession = Depends(get_db)):
    result = await service.ingest_single(db, data)
    return APIResponse(data=TelemetryResponse.model_validate(result))

@router.post("/batch", response_model=APIResponse[list[TelemetryResponse]])
async def ingest_batch(data: TelemetryBatchIngest, db: AsyncSession = Depends(get_db)):
    results = await service.ingest_batch(db, data)
    return APIResponse(data=[TelemetryResponse.model_validate(r) for r in results])
"""

files["app/telemetry/historian/models.py"] = """
import uuid
from sqlalchemy import String, Boolean, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin

class HistorianQuery(Base, UUIDModelMixin):
    __tablename__ = "historian_queries"
    
    name: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[str] = mapped_column(String, nullable=True)
    query_config: Mapped[dict] = mapped_column(JSON)
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    is_shared: Mapped[bool] = mapped_column(Boolean, default=False)
"""

files["app/telemetry/historian/schemas.py"] = """
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

class HistorianQueryReq(BaseModel):
    tags: List[str]
    start_time: datetime
    end_time: datetime
    aggregation: str = 'raw'
    interval: str = '1m'

class DataPoint(BaseModel):
    timestamp: datetime
    value: float

class HistorianResponse(BaseModel):
    tag: str
    data_points: List[DataPoint]

class SavedQueryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    query_config: Dict[str, Any]
    is_shared: bool = False

class SavedQueryResponse(SavedQueryCreate):
    id: uuid.UUID
    created_by: Optional[uuid.UUID] = None
    
    class Config:
        from_attributes = True
"""

files["app/telemetry/historian/service.py"] = """
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List
from app.telemetry.historian.models import HistorianQuery
from app.telemetry.historian.schemas import HistorianQueryReq, HistorianResponse, DataPoint, SavedQueryCreate
from app.telemetry.ingestion.models import TelemetryData

class HistorianService:
    async def query_data(self, db: AsyncSession, req: HistorianQueryReq) -> List[HistorianResponse]:
        responses = []
        for tag in req.tags:
            stmt = select(TelemetryData).where(
                and_(
                    TelemetryData.tag == tag,
                    TelemetryData.timestamp >= req.start_time,
                    TelemetryData.timestamp <= req.end_time
                )
            ).order_by(TelemetryData.timestamp.asc())
            result = await db.execute(stmt)
            records = result.scalars().all()
            
            data_points = [DataPoint(timestamp=r.timestamp, value=r.value) for r in records if r.value is not None]
            responses.append(HistorianResponse(tag=tag, data_points=data_points))
            
        return responses

    async def get_aggregated(self, db: AsyncSession, req: HistorianQueryReq) -> List[HistorianResponse]:
        # Mock aggregation for now
        return await self.query_data(db, req)

    async def save_query(self, db: AsyncSession, query_data: SavedQueryCreate, user_id=None) -> HistorianQuery:
        db_obj = HistorianQuery(**query_data.model_dump(), created_by=user_id)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def list_saved_queries(self, db: AsyncSession) -> List[HistorianQuery]:
        stmt = select(HistorianQuery)
        result = await db.execute(stmt)
        return list(result.scalars().all())
"""

files["app/telemetry/historian/router.py"] = """
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database.session import get_db
from app.telemetry.historian.schemas import HistorianQueryReq, HistorianResponse, SavedQueryCreate, SavedQueryResponse
from app.telemetry.historian.service import HistorianService
from app.shared.responses import APIResponse
from typing import List

router = APIRouter(prefix="/historian", tags=["Telemetry Historian"])
service = HistorianService()

@router.post("/query", response_model=APIResponse[List[HistorianResponse]])
async def query_historian(req: HistorianQueryReq, db: AsyncSession = Depends(get_db)):
    result = await service.query_data(db, req)
    return APIResponse(data=result)

@router.post("/saved", response_model=APIResponse[SavedQueryResponse])
async def save_query(req: SavedQueryCreate, db: AsyncSession = Depends(get_db)):
    result = await service.save_query(db, req)
    return APIResponse(data=SavedQueryResponse.model_validate(result))

@router.get("/saved", response_model=APIResponse[List[SavedQueryResponse]])
async def list_saved_queries(db: AsyncSession = Depends(get_db)):
    results = await service.list_saved_queries(db)
    return APIResponse(data=[SavedQueryResponse.model_validate(r) for r in results])
"""

files["app/telemetry/streaming/schemas.py"] = """
from pydantic import BaseModel
from typing import List

class StreamConfig(BaseModel):
    tags: List[str]
    interval_ms: int = 1000

class StreamStatus(BaseModel):
    active_streams: int
    tags: List[str]
"""

files["app/telemetry/streaming/service.py"] = """
from typing import List
from app.telemetry.streaming.schemas import StreamConfig, StreamStatus

class StreamingService:
    def __init__(self):
        self.active_tags = set()
        self.streams_count = 0

    async def start_stream(self, config: StreamConfig):
        for tag in config.tags:
            self.active_tags.add(tag)
        self.streams_count += 1
        return True

    async def stop_stream(self, tags: List[str]):
        for tag in tags:
            if tag in self.active_tags:
                self.active_tags.remove(tag)
        if self.streams_count > 0:
            self.streams_count -= 1
        return True

    async def list_active_streams(self) -> StreamStatus:
        return StreamStatus(active_streams=self.streams_count, tags=list(self.active_tags))
"""

files["app/telemetry/streaming/router.py"] = """
from fastapi import APIRouter
from app.telemetry.streaming.schemas import StreamConfig, StreamStatus
from app.telemetry.streaming.service import StreamingService
from app.shared.responses import APIResponse

router = APIRouter(prefix="/streaming", tags=["Telemetry Streaming"])
service = StreamingService()

@router.post("/start", response_model=APIResponse[bool])
async def start_stream(config: StreamConfig):
    success = await service.start_stream(config)
    return APIResponse(data=success)

@router.post("/stop", response_model=APIResponse[bool])
async def stop_stream(tags: list[str]):
    success = await service.stop_stream(tags)
    return APIResponse(data=success)

@router.get("/status", response_model=APIResponse[StreamStatus])
async def stream_status():
    status = await service.list_active_streams()
    return APIResponse(data=status)
"""

files["app/telemetry/quality/schemas.py"] = """
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uuid
from app.telemetry.ingestion.models import QualityCode

class QualityCheckRequest(BaseModel):
    value: float
    sensor_config: Dict[str, Any]

class QualityStats(BaseModel):
    sensor_id: uuid.UUID
    good_count: int
    bad_count: int
    uncertain_count: int
    total: int
"""

files["app/telemetry/quality/service.py"] = """
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime
import uuid
from app.telemetry.ingestion.models import TelemetryData, QualityCode
from app.telemetry.quality.schemas import QualityStats

class DataQualityService:
    def check_quality(self, value: float, sensor_config: dict) -> QualityCode:
        min_val = sensor_config.get("min_value")
        max_val = sensor_config.get("max_value")
        
        if min_val is not None and value < min_val:
            return QualityCode.BAD
        if max_val is not None and value > max_val:
            return QualityCode.BAD
            
        return QualityCode.GOOD

    async def get_quality_stats(self, db: AsyncSession, sensor_id: uuid.UUID, start_time: datetime, end_time: datetime) -> QualityStats:
        stmt = select(TelemetryData.quality, func.count(TelemetryData.id)).where(
            and_(
                TelemetryData.sensor_id == sensor_id,
                TelemetryData.timestamp >= start_time,
                TelemetryData.timestamp <= end_time
            )
        ).group_by(TelemetryData.quality)
        
        result = await db.execute(stmt)
        counts = dict(result.all())
        
        good = counts.get(QualityCode.GOOD, 0)
        bad = counts.get(QualityCode.BAD, 0)
        uncertain = counts.get(QualityCode.UNCERTAIN, 0)
        total = good + bad + uncertain
        
        return QualityStats(
            sensor_id=sensor_id,
            good_count=good,
            bad_count=bad,
            uncertain_count=uncertain,
            total=total
        )
"""

files["app/telemetry/quality/router.py"] = """
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database.session import get_db
from app.telemetry.quality.schemas import QualityCheckRequest, QualityStats
from app.telemetry.quality.service import DataQualityService
from app.telemetry.ingestion.models import QualityCode
from app.shared.responses import APIResponse
from datetime import datetime
import uuid

router = APIRouter(prefix="/quality", tags=["Telemetry Quality"])
service = DataQualityService()

@router.post("/check", response_model=APIResponse[QualityCode])
async def check_quality(req: QualityCheckRequest):
    result = service.check_quality(req.value, req.sensor_config)
    return APIResponse(data=result)

@router.get("/stats/{sensor_id}", response_model=APIResponse[QualityStats])
async def get_quality_stats(sensor_id: uuid.UUID, start_time: datetime, end_time: datetime, db: AsyncSession = Depends(get_db)):
    result = await service.get_quality_stats(db, sensor_id, start_time, end_time)
    return APIResponse(data=result)
"""

files["app/telemetry/router.py"] = """
from fastapi import APIRouter
from app.telemetry.ingestion.router import router as ingestion_router
from app.telemetry.historian.router import router as historian_router
from app.telemetry.streaming.router import router as streaming_router
from app.telemetry.quality.router import router as quality_router

router = APIRouter(prefix="/telemetry")
router.include_router(ingestion_router)
router.include_router(historian_router)
router.include_router(streaming_router)
router.include_router(quality_router)
"""

files["app/digital_twin/twins/models.py"] = """
import uuid
from sqlalchemy import String, Boolean, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin
from app.shared.mixins.soft_delete_mixin import SoftDeleteMixin
from app.shared.mixins.timestamp_mixin import TimestampMixin
from datetime import datetime

class DigitalTwin(Base, UUIDModelMixin, SoftDeleteMixin, TimestampMixin):
    __tablename__ = "digital_twins"
    
    name: Mapped[str] = mapped_column(String, index=True)
    twin_type: Mapped[str] = mapped_column(String)  # equipment/process/plant/line
    equipment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("equipment.id"), nullable=True)
    plant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("plants.id"), nullable=True)
    description: Mapped[str] = mapped_column(String, nullable=True)
    state: Mapped[dict] = mapped_column(JSON, default={})
    config: Mapped[dict] = mapped_column(JSON, default={})
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sync_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    last_synced_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
"""

files["app/digital_twin/twins/schemas.py"] = """
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uuid
from datetime import datetime

class TwinCreate(BaseModel):
    name: str
    twin_type: str
    equipment_id: Optional[uuid.UUID] = None
    plant_id: Optional[uuid.UUID] = None
    description: Optional[str] = None
    config: Dict[str, Any] = {}

class TwinUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    sync_enabled: Optional[bool] = None

class TwinResponse(TwinCreate):
    id: uuid.UUID
    state: Dict[str, Any]
    is_active: bool
    sync_enabled: bool
    last_synced_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class TwinStateResponse(BaseModel):
    twin_id: uuid.UUID
    state: Dict[str, Any]
    last_synced_at: Optional[datetime]
"""

files["app/digital_twin/twins/service.py"] = """
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
from datetime import datetime
from app.digital_twin.twins.models import DigitalTwin
from app.digital_twin.twins.schemas import TwinCreate, TwinUpdate, TwinStateResponse

class DigitalTwinService:
    async def create(self, db: AsyncSession, data: TwinCreate) -> DigitalTwin:
        db_obj = DigitalTwin(**data.model_dump())
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get(self, db: AsyncSession, twin_id: uuid.UUID) -> DigitalTwin:
        stmt = select(DigitalTwin).where(DigitalTwin.id == twin_id)
        result = await db.execute(stmt)
        return result.scalars().first()

    async def update(self, db: AsyncSession, twin_id: uuid.UUID, data: TwinUpdate) -> DigitalTwin:
        db_obj = await self.get(db, twin_id)
        if db_obj:
            for key, value in data.model_dump(exclude_unset=True).items():
                setattr(db_obj, key, value)
            await db.commit()
            await db.refresh(db_obj)
        return db_obj

    async def get_state(self, db: AsyncSession, twin_id: uuid.UUID) -> TwinStateResponse:
        db_obj = await self.get(db, twin_id)
        if db_obj:
            return TwinStateResponse(twin_id=db_obj.id, state=db_obj.state, last_synced_at=db_obj.last_synced_at)
        return None

    async def update_state(self, db: AsyncSession, twin_id: uuid.UUID, partial_state: dict) -> TwinStateResponse:
        db_obj = await self.get(db, twin_id)
        if db_obj:
            current_state = db_obj.state or {}
            current_state.update(partial_state)
            db_obj.state = current_state
            db_obj.last_synced_at = datetime.utcnow()
            await db.commit()
            await db.refresh(db_obj)
            return TwinStateResponse(twin_id=db_obj.id, state=db_obj.state, last_synced_at=db_obj.last_synced_at)
        return None

    async def sync_with_telemetry(self, db: AsyncSession, twin_id: uuid.UUID) -> TwinStateResponse:
        # Mock logic to pull latest telemetry
        return await self.update_state(db, twin_id, {"status": "synced", "health": 100})
"""

files["app/digital_twin/twins/router.py"] = """
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from app.core.database.session import get_db
from app.digital_twin.twins.schemas import TwinCreate, TwinUpdate, TwinResponse, TwinStateResponse
from app.digital_twin.twins.service import DigitalTwinService
from app.shared.responses import APIResponse

router = APIRouter(prefix="/twins", tags=["Digital Twins"])
service = DigitalTwinService()

@router.post("", response_model=APIResponse[TwinResponse])
async def create_twin(data: TwinCreate, db: AsyncSession = Depends(get_db)):
    result = await service.create(db, data)
    return APIResponse(data=TwinResponse.model_validate(result))

@router.get("/{id}", response_model=APIResponse[TwinResponse])
async def get_twin(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await service.get(db, id)
    if not result:
        raise HTTPException(status_code=404, detail="Twin not found")
    return APIResponse(data=TwinResponse.model_validate(result))

@router.patch("/{id}", response_model=APIResponse[TwinResponse])
async def update_twin(id: uuid.UUID, data: TwinUpdate, db: AsyncSession = Depends(get_db)):
    result = await service.update(db, id, data)
    return APIResponse(data=TwinResponse.model_validate(result))

@router.get("/{id}/state", response_model=APIResponse[TwinStateResponse])
async def get_twin_state(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await service.get_state(db, id)
    return APIResponse(data=result)

@router.put("/{id}/state", response_model=APIResponse[TwinStateResponse])
async def update_twin_state(id: uuid.UUID, state: dict, db: AsyncSession = Depends(get_db)):
    result = await service.update_state(db, id, state)
    return APIResponse(data=result)

@router.post("/{id}/sync", response_model=APIResponse[TwinStateResponse])
async def sync_twin(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await service.sync_with_telemetry(db, id)
    return APIResponse(data=result)
"""

files["app/digital_twin/snapshots/models.py"] = """
import uuid
from sqlalchemy import String, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin

class TwinSnapshot(Base, UUIDModelMixin):
    __tablename__ = "twin_snapshots"
    
    twin_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("digital_twins.id"), index=True)
    snapshot_data: Mapped[dict] = mapped_column(JSON)
    reason: Mapped[str] = mapped_column(String)
    triggered_by: Mapped[str] = mapped_column(String, nullable=True) # manual/scheduled/event
"""

files["app/digital_twin/snapshots/schemas.py"] = """
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uuid
from datetime import datetime

class SnapshotCreate(BaseModel):
    twin_id: uuid.UUID
    reason: str
    triggered_by: Optional[str] = 'manual'

class SnapshotResponse(SnapshotCreate):
    id: uuid.UUID
    snapshot_data: Dict[str, Any]
    
    class Config:
        from_attributes = True
"""

files["app/digital_twin/snapshots/service.py"] = """
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
from app.digital_twin.snapshots.models import TwinSnapshot
from app.digital_twin.snapshots.schemas import SnapshotCreate
from app.digital_twin.twins.service import DigitalTwinService

class SnapshotService:
    def __init__(self):
        self.twin_service = DigitalTwinService()

    async def capture_snapshot(self, db: AsyncSession, data: SnapshotCreate) -> TwinSnapshot:
        twin = await self.twin_service.get(db, data.twin_id)
        if not twin:
            return None
        
        db_obj = TwinSnapshot(
            twin_id=data.twin_id,
            reason=data.reason,
            triggered_by=data.triggered_by,
            snapshot_data=twin.state or {}
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def list_by_twin(self, db: AsyncSession, twin_id: uuid.UUID) -> list[TwinSnapshot]:
        stmt = select(TwinSnapshot).where(TwinSnapshot.twin_id == twin_id)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_snapshot(self, db: AsyncSession, snapshot_id: uuid.UUID) -> TwinSnapshot:
        stmt = select(TwinSnapshot).where(TwinSnapshot.id == snapshot_id)
        result = await db.execute(stmt)
        return result.scalars().first()

    async def compare_snapshots(self, db: AsyncSession, id1: uuid.UUID, id2: uuid.UUID) -> dict:
        snap1 = await self.get_snapshot(db, id1)
        snap2 = await self.get_snapshot(db, id2)
        
        if not snap1 or not snap2:
            return {}
            
        # Basic diff mock
        return {
            "diff": "mock_diff",
            "snapshot1_keys": list(snap1.snapshot_data.keys()),
            "snapshot2_keys": list(snap2.snapshot_data.keys())
        }
"""

files["app/digital_twin/snapshots/router.py"] = """
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import List
from app.core.database.session import get_db
from app.digital_twin.snapshots.schemas import SnapshotCreate, SnapshotResponse
from app.digital_twin.snapshots.service import SnapshotService
from app.shared.responses import APIResponse

router = APIRouter(prefix="/twins/snapshots", tags=["Twin Snapshots"])
service = SnapshotService()

@router.post("/capture", response_model=APIResponse[SnapshotResponse])
async def capture_snapshot(data: SnapshotCreate, db: AsyncSession = Depends(get_db)):
    result = await service.capture_snapshot(db, data)
    return APIResponse(data=SnapshotResponse.model_validate(result))

@router.get("/by-twin/{twin_id}", response_model=APIResponse[List[SnapshotResponse]])
async def list_by_twin(twin_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    results = await service.list_by_twin(db, twin_id)
    return APIResponse(data=[SnapshotResponse.model_validate(r) for r in results])

@router.get("/{id}", response_model=APIResponse[SnapshotResponse])
async def get_snapshot(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await service.get_snapshot(db, id)
    return APIResponse(data=SnapshotResponse.model_validate(result))

@router.get("/compare", response_model=APIResponse[dict])
async def compare_snapshots(id1: uuid.UUID, id2: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await service.compare_snapshots(db, id1, id2)
    return APIResponse(data=result)
"""

files["app/digital_twin/simulation/schemas.py"] = """
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uuid
from datetime import datetime

class SimulationConfig(BaseModel):
    twin_id: uuid.UUID
    scenario_name: str
    parameters: Dict[str, Any]
    duration_seconds: int

class SimulationResult(BaseModel):
    twin_id: uuid.UUID
    scenario: str
    results: Dict[str, Any]
    started_at: datetime
    completed_at: datetime
"""

files["app/digital_twin/simulation/service.py"] = """
import uuid
from datetime import datetime, timedelta
from typing import List
from app.digital_twin.simulation.schemas import SimulationConfig, SimulationResult

class SimulationService:
    def __init__(self):
        self.mock_results = []

    async def run_simulation(self, config: SimulationConfig) -> SimulationResult:
        start_time = datetime.utcnow()
        end_time = start_time + timedelta(seconds=config.duration_seconds)
        
        result = SimulationResult(
            twin_id=config.twin_id,
            scenario=config.scenario_name,
            results={"status": "success", "mock_value": 42},
            started_at=start_time,
            completed_at=end_time
        )
        self.mock_results.append(result)
        return result

    async def list_results_by_twin(self, twin_id: uuid.UUID) -> List[SimulationResult]:
        return [r for r in self.mock_results if r.twin_id == twin_id]
"""

files["app/digital_twin/simulation/router.py"] = """
from fastapi import APIRouter
import uuid
from typing import List
from app.digital_twin.simulation.schemas import SimulationConfig, SimulationResult
from app.digital_twin.simulation.service import SimulationService
from app.shared.responses import APIResponse

router = APIRouter(prefix="/twins/simulation", tags=["Twin Simulation"])
service = SimulationService()

@router.post("/run", response_model=APIResponse[SimulationResult])
async def run_simulation(config: SimulationConfig):
    result = await service.run_simulation(config)
    return APIResponse(data=result)

@router.get("/results/{twin_id}", response_model=APIResponse[List[SimulationResult]])
async def list_results(twin_id: uuid.UUID):
    results = await service.list_results_by_twin(twin_id)
    return APIResponse(data=results)
"""

files["app/digital_twin/relationships/models.py"] = """
import uuid
from sqlalchemy import String, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin

class TwinRelationship(Base, UUIDModelMixin):
    __tablename__ = "twin_relationships"
    
    source_twin_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("digital_twins.id"), index=True)
    target_twin_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("digital_twins.id"), index=True)
    relationship_type: Mapped[str] = mapped_column(String) # parent/child/feeds_into/depends_on
    metadata_: Mapped[dict] = mapped_column("metadata", JSON, nullable=True)
"""

files["app/digital_twin/relationships/schemas.py"] = """
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import uuid

class RelationshipCreate(BaseModel):
    source_twin_id: uuid.UUID
    target_twin_id: uuid.UUID
    relationship_type: str
    metadata_: Optional[Dict[str, Any]] = None

class RelationshipResponse(RelationshipCreate):
    id: uuid.UUID
    
    class Config:
        from_attributes = True

class GraphNode(BaseModel):
    id: uuid.UUID
    name: str

class GraphEdge(BaseModel):
    source: uuid.UUID
    target: uuid.UUID
    type: str

class TwinGraph(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
"""

files["app/digital_twin/relationships/service.py"] = """
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
import uuid
from typing import List
from app.digital_twin.relationships.models import TwinRelationship
from app.digital_twin.relationships.schemas import RelationshipCreate, TwinGraph, GraphNode, GraphEdge
from app.digital_twin.twins.models import DigitalTwin

class RelationshipService:
    async def create(self, db: AsyncSession, data: RelationshipCreate) -> TwinRelationship:
        db_obj = TwinRelationship(
            source_twin_id=data.source_twin_id,
            target_twin_id=data.target_twin_id,
            relationship_type=data.relationship_type,
            metadata_=data.metadata_
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get_graph(self, db: AsyncSession, twin_id: uuid.UUID) -> TwinGraph:
        stmt = select(TwinRelationship).where(
            or_(
                TwinRelationship.source_twin_id == twin_id,
                TwinRelationship.target_twin_id == twin_id
            )
        )
        result = await db.execute(stmt)
        edges_db = result.scalars().all()
        
        edges = []
        node_ids = set([twin_id])
        for e in edges_db:
            edges.append(GraphEdge(source=e.source_twin_id, target=e.target_twin_id, type=e.relationship_type))
            node_ids.add(e.source_twin_id)
            node_ids.add(e.target_twin_id)
            
        nodes = []
        for nid in node_ids:
            twin_stmt = select(DigitalTwin).where(DigitalTwin.id == nid)
            t_res = await db.execute(twin_stmt)
            twin = t_res.scalars().first()
            if twin:
                nodes.append(GraphNode(id=twin.id, name=twin.name))
            else:
                nodes.append(GraphNode(id=nid, name="Unknown"))
                
        return TwinGraph(nodes=nodes, edges=edges)
"""

files["app/digital_twin/relationships/router.py"] = """
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from app.core.database.session import get_db
from app.digital_twin.relationships.schemas import RelationshipCreate, RelationshipResponse, TwinGraph
from app.digital_twin.relationships.service import RelationshipService
from app.shared.responses import APIResponse

router = APIRouter(prefix="/twins/relationships", tags=["Twin Relationships"])
service = RelationshipService()

@router.post("", response_model=APIResponse[RelationshipResponse])
async def create_relationship(data: RelationshipCreate, db: AsyncSession = Depends(get_db)):
    result = await service.create(db, data)
    return APIResponse(data=RelationshipResponse.model_validate(result))

@router.get("/graph/{twin_id}", response_model=APIResponse[TwinGraph])
async def get_graph(twin_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await service.get_graph(db, twin_id)
    return APIResponse(data=result)
"""

files["app/digital_twin/router.py"] = """
from fastapi import APIRouter
from app.digital_twin.twins.router import router as twins_router
from app.digital_twin.snapshots.router import router as snapshots_router
from app.digital_twin.simulation.router import router as simulation_router
from app.digital_twin.relationships.router import router as relationships_router

router = APIRouter(prefix="/digital-twin")
router.include_router(twins_router)
router.include_router(snapshots_router)
router.include_router(simulation_router)
router.include_router(relationships_router)
"""

for path, content in files.items():
    write_file(path, content)
    print(f"Created {path}")

print("All modules generated successfully.")
