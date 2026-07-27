import uuid
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
