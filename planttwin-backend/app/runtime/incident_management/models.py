from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.shared.mixins.base_model import Base
from app.shared.mixins import UUIDModelMixin, TimestampMixin, SoftDeleteMixin
from app.shared.enums import AlarmSeverity

class Incident(Base, UUIDModelMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "incidents"

    title = mapped_column(String, nullable=False)
    description = mapped_column(Text, nullable=True)
    severity = mapped_column(SAEnum(AlarmSeverity), nullable=False)
    status = mapped_column(String, default="reported", nullable=False) # reported/investigating/mitigated/resolved/closed
    equipment_id = mapped_column(UUID(as_uuid=True), ForeignKey("equipment.id"), nullable=True)
    reported_by = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    assigned_to = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    root_cause = mapped_column(Text, nullable=True)
    resolution = mapped_column(Text, nullable=True)
    started_at = mapped_column(DateTime, nullable=True)
    resolved_at = mapped_column(DateTime, nullable=True)
    impact_description = mapped_column(Text, nullable=True)
