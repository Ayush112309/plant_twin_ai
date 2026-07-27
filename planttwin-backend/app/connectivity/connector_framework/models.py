import uuid
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
