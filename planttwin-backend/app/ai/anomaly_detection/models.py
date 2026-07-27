from sqlalchemy import Column, String, Float, DateTime, Boolean, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
import datetime
from app.shared.mixins.base_model import Base
from app.shared.mixins import UUIDModelMixin, TimestampMixin, SoftDeleteMixin
from app.shared.enums import AlarmSeverity

class AnomalyEvent(Base, UUIDModelMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "anomaly_events"

    sensor_id = mapped_column(UUID(as_uuid=True), ForeignKey("sensors.id"), nullable=True)
    equipment_id = mapped_column(UUID(as_uuid=True), ForeignKey("equipment.id"), nullable=True)
    anomaly_type = mapped_column(String, nullable=False) # point/contextual/collective
    severity = mapped_column(SAEnum(AlarmSeverity), nullable=False)
    score = mapped_column(Float, nullable=False)
    description = mapped_column(String, nullable=True)
    detected_at = mapped_column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    acknowledged = mapped_column(Boolean, default=False, nullable=False)
    acknowledged_by = mapped_column(String, nullable=True)
