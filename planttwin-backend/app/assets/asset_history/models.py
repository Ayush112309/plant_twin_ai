import uuid
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
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"), index=True)
    event_type: Mapped[str] = mapped_column(String) # status_change/maintenance/calibration/inspection
    description: Mapped[str] = mapped_column(String)
    performed_by: Mapped[str] = mapped_column(String)
    old_value: Mapped[dict] = mapped_column(JSON, nullable=True)
    new_value: Mapped[dict] = mapped_column(JSON, nullable=True)
