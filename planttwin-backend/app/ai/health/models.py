from sqlalchemy import Column, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
import datetime
from app.shared.mixins.base_model import Base
from app.shared.mixins import UUIDModelMixin, TimestampMixin, SoftDeleteMixin

class EquipmentHealthScore(Base, UUIDModelMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "equipment_health_scores"

    equipment_id = mapped_column(UUID(as_uuid=True), ForeignKey("equipment.id"), nullable=False)
    overall_score = mapped_column(Float, nullable=False) # 0-100
    component_scores = mapped_column(JSON, nullable=True)
    factors = mapped_column(JSON, nullable=True)
    calculated_at = mapped_column(DateTime, default=datetime.datetime.utcnow, nullable=False)
