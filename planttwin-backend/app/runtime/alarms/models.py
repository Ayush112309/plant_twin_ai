from sqlalchemy import Column, String, Boolean, DateTime, JSON, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
import datetime
from app.shared.mixins.base_model import Base
from app.shared.mixins import UUIDModelMixin, TimestampMixin, SoftDeleteMixin
from app.shared.enums import AlarmSeverity

class Alarm(Base, UUIDModelMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "alarms"

    name = mapped_column(String, nullable=False)
    alarm_type = mapped_column(String, nullable=False) # threshold/rate_of_change/state_change/compound
    severity = mapped_column(SAEnum(AlarmSeverity), nullable=False)
    source_type = mapped_column(String, nullable=False) # sensor/equipment/system
    source_id = mapped_column(String, nullable=False)
    condition_config = mapped_column(JSON, nullable=False)
    message_template = mapped_column(String, nullable=True)
    is_active = mapped_column(Boolean, default=True, nullable=False)
    is_triggered = mapped_column(Boolean, default=False, nullable=False)
    triggered_at = mapped_column(DateTime, nullable=True)
    acknowledged = mapped_column(Boolean, default=False, nullable=False)
    acknowledged_by = mapped_column(String, nullable=True)
    acknowledged_at = mapped_column(DateTime, nullable=True)
