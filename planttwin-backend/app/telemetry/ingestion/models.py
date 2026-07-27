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
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"), index=True)
    tag: Mapped[str] = mapped_column(String, index=True)
    value: Mapped[float] = mapped_column(Float, nullable=True)
    string_value: Mapped[str] = mapped_column(String, nullable=True)
    quality: Mapped[QualityCode] = mapped_column(SAEnum(QualityCode), default=QualityCode.GOOD)
    timestamp: Mapped[DateTime] = mapped_column(DateTime(timezone=True), index=True)
    source_connector_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("connectors.id"), nullable=True)
    raw_value: Mapped[str] = mapped_column(String, nullable=True)
    unit: Mapped[str] = mapped_column(String, nullable=True)
