from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
import datetime
from app.shared.mixins.base_model import Base
from app.shared.mixins import UUIDModelMixin, TimestampMixin, SoftDeleteMixin

class Prediction(Base, UUIDModelMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "predictions"

    equipment_id = mapped_column(UUID(as_uuid=True), ForeignKey("equipment.id"), nullable=False)
    prediction_type = mapped_column(String, nullable=False) # failure/degradation/maintenance
    predicted_value = mapped_column(Float, nullable=True)
    confidence = mapped_column(Float, nullable=False)
    predicted_at = mapped_column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    target_date = mapped_column(DateTime, nullable=True)
    model_version = mapped_column(String, nullable=True)
