from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.shared.mixins.base_model import Base
from app.shared.mixins import UUIDModelMixin, TimestampMixin, SoftDeleteMixin
from app.shared.enums import AlarmSeverity

class WorkOrder(Base, UUIDModelMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "work_orders"

    title = mapped_column(String, nullable=False)
    description = mapped_column(Text, nullable=True)
    work_order_type = mapped_column(String, nullable=False) # preventive/corrective/predictive/emergency
    priority = mapped_column(SAEnum(AlarmSeverity), nullable=False)
    status = mapped_column(String, default="open", nullable=False) # open/in_progress/completed/cancelled
    equipment_id = mapped_column(UUID(as_uuid=True), ForeignKey("equipment.id"), nullable=True)
    assigned_to = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    requested_by = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    due_date = mapped_column(DateTime, nullable=True)
    completed_at = mapped_column(DateTime, nullable=True)
    estimated_hours = mapped_column(Float, nullable=True)
    actual_hours = mapped_column(Float, nullable=True)
    notes = mapped_column(Text, nullable=True)
