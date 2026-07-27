import os

base_dir = r"C:\Users\ayush\.gemini\antigravity\scratch\planttwin-backend"

files_to_create = {
    r"app\connectivity\connector_framework\models.py": """import uuid
from sqlalchemy import String, Integer, ForeignKey, Enum as SAEnum, JSON, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import enum

from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin

class ConnectionState(enum.Enum):
    DISCONNECTED = "DISCONNECTED"
    CONNECTING = "CONNECTING"
    CONNECTED = "CONNECTED"
    ERROR = "ERROR"

class Connector(Base, UUIDModelMixin):
    __tablename__ = "connectors"

    name: Mapped[str] = mapped_column(String)
    connector_type: Mapped[str] = mapped_column(String) # opcua/mqtt/s7/modbus/rest/csv
    host: Mapped[str] = mapped_column(String)
    port: Mapped[int] = mapped_column(Integer)
    config: Mapped[dict] = mapped_column(JSON)
    plant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("plants.id"), nullable=True)
    status: Mapped[ConnectionState] = mapped_column(SAEnum(ConnectionState), default=ConnectionState.DISCONNECTED)
    last_connected_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    error_message: Mapped[str] = mapped_column(String, nullable=True)
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
""",
    r"app\connectivity\connector_framework\schemas.py": """from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
import uuid
from app.connectivity.connector_framework.models import ConnectionState

class ConnectorBase(BaseModel):
    name: str
    connector_type: str
    host: str
    port: int
    config: Dict[str, Any]
    plant_id: Optional[uuid.UUID] = None
    is_enabled: bool = True

class ConnectorCreate(ConnectorBase):
    pass

class ConnectorUpdate(BaseModel):
    name: Optional[str] = None
    connector_type: Optional[str] = None
    host: Optional[str] = None
    port: Optional[int] = None
    config: Optional[Dict[str, Any]] = None
    plant_id: Optional[uuid.UUID] = None
    is_enabled: Optional[bool] = None

class ConnectorResponse(ConnectorBase):
    id: uuid.UUID
    status: ConnectionState
    last_connected_at: Optional[datetime]
    error_message: Optional[str]

    class Config:
        from_attributes = True

class ConnectorStatusResponse(BaseModel):
    id: uuid.UUID
    status: ConnectionState
    last_connected_at: Optional[datetime]
    error_message: Optional[str]
""",
    r"app\connectivity\connector_framework\service.py": """from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid
from typing import List, Optional
from datetime import datetime
from app.connectivity.connector_framework.models import Connector, ConnectionState
from app.connectivity.connector_framework.schemas import ConnectorCreate, ConnectorUpdate

class ConnectorService:
    async def get_by_id(self, db: AsyncSession, connector_id: uuid.UUID) -> Optional[Connector]:
        result = await db.execute(select(Connector).filter(Connector.id == connector_id))
        return result.scalars().first()

    async def list_connectors(self, db: AsyncSession) -> List[Connector]:
        result = await db.execute(select(Connector))
        return result.scalars().all()

    async def create(self, db: AsyncSession, connector_in: ConnectorCreate) -> Connector:
        db_connector = Connector(**connector_in.model_dump())
        db.add(db_connector)
        await db.commit()
        await db.refresh(db_connector)
        return db_connector

    async def update(self, db: AsyncSession, db_connector: Connector, connector_in: ConnectorUpdate) -> Connector:
        update_data = connector_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_connector, field, value)
        await db.commit()
        await db.refresh(db_connector)
        return db_connector

    async def delete(self, db: AsyncSession, db_connector: Connector) -> None:
        await db.delete(db_connector)
        await db.commit()

    async def update_status(self, db: AsyncSession, db_connector: Connector, status: ConnectionState, error_message: Optional[str] = None) -> Connector:
        db_connector.status = status
        db_connector.error_message = error_message
        if status == ConnectionState.CONNECTED:
            db_connector.last_connected_at = datetime.utcnow()
        await db.commit()
        await db.refresh(db_connector)
        return db_connector
        
    async def test_connection(self, db_connector: Connector) -> bool:
        # Mock connection test
        if db_connector.host and db_connector.port:
            return True
        return False
""",
    r"app\connectivity\connector_framework\router.py": """from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import List
from app.core.database.session import get_db
from app.connectivity.connector_framework.schemas import ConnectorCreate, ConnectorUpdate, ConnectorResponse, ConnectorStatusResponse
from app.connectivity.connector_framework.service import ConnectorService
from app.connectivity.connector_framework.models import ConnectionState

router = APIRouter(prefix="/connectors", tags=["Connectors"])
connector_service = ConnectorService()

@router.post("/", response_model=ConnectorResponse, status_code=status.HTTP_201_CREATED)
async def create_connector(connector_in: ConnectorCreate, db: AsyncSession = Depends(get_db)):
    return await connector_service.create(db=db, connector_in=connector_in)

@router.get("/", response_model=List[ConnectorResponse])
async def list_connectors(db: AsyncSession = Depends(get_db)):
    return await connector_service.list_connectors(db=db)

@router.get("/{connector_id}", response_model=ConnectorResponse)
async def get_connector(connector_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    connector = await connector_service.get_by_id(db=db, connector_id=connector_id)
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    return connector

@router.put("/{connector_id}", response_model=ConnectorResponse)
async def update_connector(connector_id: uuid.UUID, connector_in: ConnectorUpdate, db: AsyncSession = Depends(get_db)):
    connector = await connector_service.get_by_id(db=db, connector_id=connector_id)
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    return await connector_service.update(db=db, db_connector=connector, connector_in=connector_in)

@router.delete("/{connector_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_connector(connector_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    connector = await connector_service.get_by_id(db=db, connector_id=connector_id)
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    await connector_service.delete(db=db, db_connector=connector)

@router.post("/{connector_id}/test")
async def test_connector(connector_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    connector = await connector_service.get_by_id(db=db, connector_id=connector_id)
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    
    success = await connector_service.test_connection(connector)
    if success:
        return {"status": "success", "message": "Connection test passed"}
    return {"status": "failure", "message": "Connection test failed"}

@router.post("/{connector_id}/connect", response_model=ConnectorStatusResponse)
async def connect_connector(connector_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    connector = await connector_service.get_by_id(db=db, connector_id=connector_id)
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    return await connector_service.update_status(db=db, db_connector=connector, status=ConnectionState.CONNECTED)

@router.post("/{connector_id}/disconnect", response_model=ConnectorStatusResponse)
async def disconnect_connector(connector_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    connector = await connector_service.get_by_id(db=db, connector_id=connector_id)
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    return await connector_service.update_status(db=db, db_connector=connector, status=ConnectionState.DISCONNECTED)
""",
    r"app\connectivity\tag_mapping\models.py": """import uuid
from sqlalchemy import String, Float, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin

class TagMapping(Base, UUIDModelMixin):
    __tablename__ = "tag_mappings"

    connector_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("connectors.id"))
    source_tag: Mapped[str] = mapped_column(String)
    mapped_tag: Mapped[str] = mapped_column(String)
    sensor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("sensors.id"), nullable=True)
    data_type: Mapped[str] = mapped_column(String)
    scaling_factor: Mapped[float] = mapped_column(Float, default=1.0)
    offset: Mapped[float] = mapped_column(Float, default=0.0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
""",
    r"app\connectivity\tag_mapping\schemas.py": """from pydantic import BaseModel
from typing import Optional, List
import uuid

class TagMappingBase(BaseModel):
    connector_id: uuid.UUID
    source_tag: str
    mapped_tag: str
    sensor_id: Optional[uuid.UUID] = None
    data_type: str
    scaling_factor: float = 1.0
    offset: float = 0.0
    is_active: bool = True

class TagMappingCreate(TagMappingBase):
    pass

class TagMappingUpdate(BaseModel):
    source_tag: Optional[str] = None
    mapped_tag: Optional[str] = None
    sensor_id: Optional[uuid.UUID] = None
    data_type: Optional[str] = None
    scaling_factor: Optional[float] = None
    offset: Optional[float] = None
    is_active: Optional[bool] = None

class TagMappingResponse(TagMappingBase):
    id: uuid.UUID

    class Config:
        from_attributes = True

class TagMappingBulkCreate(BaseModel):
    mappings: List[TagMappingCreate]
""",
    r"app\connectivity\tag_mapping\service.py": """from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid
from typing import List, Optional
from app.connectivity.tag_mapping.models import TagMapping
from app.connectivity.tag_mapping.schemas import TagMappingCreate, TagMappingUpdate

class TagMappingService:
    async def get_by_id(self, db: AsyncSession, mapping_id: uuid.UUID) -> Optional[TagMapping]:
        result = await db.execute(select(TagMapping).filter(TagMapping.id == mapping_id))
        return result.scalars().first()

    async def list_by_connector(self, db: AsyncSession, connector_id: uuid.UUID) -> List[TagMapping]:
        result = await db.execute(select(TagMapping).filter(TagMapping.connector_id == connector_id))
        return result.scalars().all()

    async def create(self, db: AsyncSession, mapping_in: TagMappingCreate) -> TagMapping:
        db_mapping = TagMapping(**mapping_in.model_dump())
        db.add(db_mapping)
        await db.commit()
        await db.refresh(db_mapping)
        return db_mapping

    async def bulk_create(self, db: AsyncSession, mappings_in: List[TagMappingCreate]) -> List[TagMapping]:
        db_mappings = [TagMapping(**m.model_dump()) for m in mappings_in]
        db.add_all(db_mappings)
        await db.commit()
        for m in db_mappings:
            await db.refresh(m)
        return db_mappings

    async def update(self, db: AsyncSession, db_mapping: TagMapping, mapping_in: TagMappingUpdate) -> TagMapping:
        update_data = mapping_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_mapping, field, value)
        await db.commit()
        await db.refresh(db_mapping)
        return db_mapping

    async def delete(self, db: AsyncSession, db_mapping: TagMapping) -> None:
        await db.delete(db_mapping)
        await db.commit()
""",
    r"app\connectivity\tag_mapping\router.py": """from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import List
from app.core.database.session import get_db
from app.connectivity.tag_mapping.schemas import TagMappingCreate, TagMappingUpdate, TagMappingResponse, TagMappingBulkCreate
from app.connectivity.tag_mapping.service import TagMappingService

router = APIRouter(prefix="/tag-mappings", tags=["Tag Mappings"])
mapping_service = TagMappingService()

@router.post("/", response_model=TagMappingResponse, status_code=status.HTTP_201_CREATED)
async def create_mapping(mapping_in: TagMappingCreate, db: AsyncSession = Depends(get_db)):
    return await mapping_service.create(db=db, mapping_in=mapping_in)

@router.post("/bulk", response_model=List[TagMappingResponse], status_code=status.HTTP_201_CREATED)
async def bulk_create_mappings(bulk_in: TagMappingBulkCreate, db: AsyncSession = Depends(get_db)):
    return await mapping_service.bulk_create(db=db, mappings_in=bulk_in.mappings)

@router.get("/by-connector/{connector_id}", response_model=List[TagMappingResponse])
async def list_mappings_by_connector(connector_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return await mapping_service.list_by_connector(db=db, connector_id=connector_id)

@router.get("/{mapping_id}", response_model=TagMappingResponse)
async def get_mapping(mapping_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    mapping = await mapping_service.get_by_id(db=db, mapping_id=mapping_id)
    if not mapping:
        raise HTTPException(status_code=404, detail="Mapping not found")
    return mapping

@router.put("/{mapping_id}", response_model=TagMappingResponse)
async def update_mapping(mapping_id: uuid.UUID, mapping_in: TagMappingUpdate, db: AsyncSession = Depends(get_db)):
    mapping = await mapping_service.get_by_id(db=db, mapping_id=mapping_id)
    if not mapping:
        raise HTTPException(status_code=404, detail="Mapping not found")
    return await mapping_service.update(db=db, db_mapping=mapping, mapping_in=mapping_in)

@router.delete("/{mapping_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_mapping(mapping_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    mapping = await mapping_service.get_by_id(db=db, mapping_id=mapping_id)
    if not mapping:
        raise HTTPException(status_code=404, detail="Mapping not found")
    await mapping_service.delete(db=db, db_mapping=mapping)
""",
    r"app\connectivity\siemens\plcsim_advanced\schemas.py": """from pydantic import BaseModel
from typing import Any
from datetime import datetime

class PLCReadRequest(BaseModel):
    tag_address: str

class PLCReadResponse(BaseModel):
    tag: str
    value: Any
    quality: str
    timestamp: datetime

class PLCWriteRequest(BaseModel):
    tag_address: str
    value: Any
""",
    r"app\connectivity\siemens\plcsim_advanced\service.py": """import logging
from datetime import datetime
from app.connectivity.siemens.plcsim_advanced.schemas import PLCReadResponse

logger = logging.getLogger(__name__)

class PLCSIMAdvancedService:
    def connect(self):
        logger.info("Connecting to PLCSIM Advanced")
        return True

    def disconnect(self):
        logger.info("Disconnecting from PLCSIM Advanced")
        return True

    def read_tag(self, tag_address: str) -> PLCReadResponse:
        logger.info(f"Reading tag: {tag_address}")
        return PLCReadResponse(tag=tag_address, value=0.0, quality="GOOD", timestamp=datetime.utcnow())

    def write_tag(self, tag_address: str, value: any):
        logger.info(f"Writing {value} to tag: {tag_address}")
        return True

    def get_instance_info(self):
        logger.info("Getting PLCSIM Advanced instance info")
        return {"status": "RUNNING", "version": "V3.0"}
""",
    r"app\connectivity\siemens\plcsim_advanced\router.py": """from fastapi import APIRouter
from app.connectivity.siemens.plcsim_advanced.schemas import PLCReadRequest, PLCWriteRequest, PLCReadResponse
from app.connectivity.siemens.plcsim_advanced.service import PLCSIMAdvancedService

router = APIRouter(prefix="/siemens/plcsim", tags=["Siemens PLCSIM"])
plc_service = PLCSIMAdvancedService()

@router.post("/read", response_model=PLCReadResponse)
async def read_plc_tag(request: PLCReadRequest):
    return plc_service.read_tag(request.tag_address)

@router.post("/write")
async def write_plc_tag(request: PLCWriteRequest):
    success = plc_service.write_tag(request.tag_address, request.value)
    return {"success": success}

@router.get("/status")
async def get_plc_status():
    return plc_service.get_instance_info()
""",
    r"app\connectivity\opcua\schemas.py": """from pydantic import BaseModel
from typing import Any, List
from datetime import datetime

class OPCUANodeRequest(BaseModel):
    node_id: str

class OPCUANodeResponse(BaseModel):
    node_id: str
    value: Any
    server_timestamp: datetime

class OPCUABrowseResponse(BaseModel):
    node_id: str
    children: List[str]
""",
    r"app\connectivity\opcua\service.py": """import logging
from datetime import datetime
from app.connectivity.opcua.schemas import OPCUANodeResponse, OPCUABrowseResponse

logger = logging.getLogger(__name__)

class OPCUAService:
    def connect(self, endpoint: str):
        logger.info(f"Connecting to OPC UA server: {endpoint}")
        return True

    def disconnect(self):
        logger.info("Disconnecting from OPC UA server")
        return True

    def browse_nodes(self, node_id: str) -> OPCUABrowseResponse:
        logger.info(f"Browsing node: {node_id}")
        return OPCUABrowseResponse(node_id=node_id, children=["ns=2;i=1", "ns=2;i=2"])

    def read_node(self, node_id: str) -> OPCUANodeResponse:
        logger.info(f"Reading node: {node_id}")
        return OPCUANodeResponse(node_id=node_id, value=100.5, server_timestamp=datetime.utcnow())

    def write_node(self, node_id: str, value: any):
        logger.info(f"Writing {value} to node: {node_id}")
        return True

    def subscribe_node(self, node_id: str):
        logger.info(f"Subscribing to node: {node_id}")
        return True
""",
    r"app\connectivity\opcua\router.py": """from fastapi import APIRouter
from app.connectivity.opcua.schemas import OPCUANodeRequest, OPCUANodeResponse, OPCUABrowseResponse
from app.connectivity.opcua.service import OPCUAService
from pydantic import BaseModel

router = APIRouter(prefix="/opcua", tags=["OPC UA"])
opcua_service = OPCUAService()

class ConnectRequest(BaseModel):
    endpoint: str

class WriteRequest(BaseModel):
    node_id: str
    value: float

@router.post("/connect")
async def connect_opcua(request: ConnectRequest):
    return {"success": opcua_service.connect(request.endpoint)}

@router.post("/read", response_model=OPCUANodeResponse)
async def read_opcua_node(request: OPCUANodeRequest):
    return opcua_service.read_node(request.node_id)

@router.post("/write")
async def write_opcua_node(request: WriteRequest):
    return {"success": opcua_service.write_node(request.node_id, request.value)}

@router.get("/browse", response_model=OPCUABrowseResponse)
async def browse_opcua_nodes(node_id: str = "Root"):
    return opcua_service.browse_nodes(node_id)

@router.post("/subscribe")
async def subscribe_opcua_node(request: OPCUANodeRequest):
    return {"success": opcua_service.subscribe_node(request.node_id)}
""",
    r"app\connectivity\mqtt\schemas.py": """from pydantic import BaseModel
from typing import Any

class MQTTPublishRequest(BaseModel):
    topic: str
    payload: Any

class MQTTSubscribeRequest(BaseModel):
    topic: str

class MQTTMessageResponse(BaseModel):
    topic: str
    payload: Any
""",
    r"app\connectivity\mqtt\service.py": """import logging
from app.connectivity.mqtt.schemas import MQTTMessageResponse

logger = logging.getLogger(__name__)

class MQTTService:
    def connect(self, broker: str, port: int):
        logger.info(f"Connecting to MQTT broker: {broker}:{port}")
        return True

    def disconnect(self):
        logger.info("Disconnecting from MQTT broker")
        return True

    def publish(self, topic: str, payload: any):
        logger.info(f"Publishing to topic: {topic}")
        return True

    def subscribe(self, topic: str):
        logger.info(f"Subscribing to topic: {topic}")
        return True

    def list_topics(self):
        logger.info("Listing subscribed topics")
        return ["plant/area1/sensor1", "plant/area1/sensor2"]
""",
    r"app\connectivity\mqtt\router.py": """from fastapi import APIRouter
from app.connectivity.mqtt.schemas import MQTTPublishRequest, MQTTSubscribeRequest
from app.connectivity.mqtt.service import MQTTService

router = APIRouter(prefix="/mqtt", tags=["MQTT"])
mqtt_service = MQTTService()

@router.post("/publish")
async def publish_mqtt(request: MQTTPublishRequest):
    return {"success": mqtt_service.publish(request.topic, request.payload)}

@router.post("/subscribe")
async def subscribe_mqtt(request: MQTTSubscribeRequest):
    return {"success": mqtt_service.subscribe(request.topic)}

@router.get("/topics")
async def list_mqtt_topics():
    return mqtt_service.list_topics()
""",
    r"app\connectivity\health\router.py": """from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database.session import get_db
from app.connectivity.connector_framework.service import ConnectorService

router = APIRouter(prefix="/connectivity/health", tags=["Connectivity Health"])
connector_service = ConnectorService()

@router.get("/")
async def get_connectivity_health(db: AsyncSession = Depends(get_db)):
    connectors = await connector_service.list_connectors(db=db)
    status_summary = {
        "total": len(connectors),
        "connected": sum(1 for c in connectors if c.status.value == "CONNECTED"),
        "disconnected": sum(1 for c in connectors if c.status.value == "DISCONNECTED"),
        "error": sum(1 for c in connectors if c.status.value == "ERROR"),
    }
    return {"status": "ok", "connectors": status_summary}
""",
    r"app\connectivity\router.py": """from fastapi import APIRouter
from app.connectivity.connector_framework.router import router as framework_router
from app.connectivity.tag_mapping.router import router as tag_mapping_router
from app.connectivity.siemens.plcsim_advanced.router import router as plcsim_router
from app.connectivity.opcua.router import router as opcua_router
from app.connectivity.mqtt.router import router as mqtt_router
from app.connectivity.health.router import router as health_router

router = APIRouter(prefix="/connectivity")
router.include_router(framework_router)
router.include_router(tag_mapping_router)
router.include_router(plcsim_router)
router.include_router(opcua_router)
router.include_router(mqtt_router)

# Note health router has prefix /connectivity/health so we can just include it
# wait, if parent has /connectivity, health router shouldn't duplicate it. Let's fix that.
# Let's adjust health router to not have /connectivity if it's included here.
# Actually, I'll just change the health router prefix in this file since we are modifying it.
"""
}

# Fix health router prefix
files_to_create[r"app\connectivity\health\router.py"] = files_to_create[r"app\connectivity\health\router.py"].replace('prefix="/connectivity/health"', 'prefix="/health"')

for rel_path, content in files_to_create.items():
    full_path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Connectivity module files created successfully.")
