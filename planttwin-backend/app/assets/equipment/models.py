import uuid
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
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"), index=True)
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
