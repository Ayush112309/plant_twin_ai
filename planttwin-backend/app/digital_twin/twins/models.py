import uuid
from sqlalchemy import String, Boolean, JSON, ForeignKey, DateTime
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
