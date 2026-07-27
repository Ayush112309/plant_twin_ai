import uuid
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
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"), index=True)
    min_value: Mapped[float] = mapped_column(Float, nullable=True)
    max_value: Mapped[float] = mapped_column(Float, nullable=True)
    precision: Mapped[int] = mapped_column(Integer, default=2)
    data_type: Mapped[str] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
