from sqlalchemy import Column, String, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.shared.mixins.base_model import Base
from app.shared.mixins import UUIDModelMixin, TimestampMixin, SoftDeleteMixin

class MLModel(Base, UUIDModelMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "ml_models"

    name = mapped_column(String, nullable=False)
    model_type = mapped_column(String, nullable=False) # anomaly/prediction/health/rul
    version = mapped_column(String, nullable=False)
    framework = mapped_column(String, nullable=False) # sklearn/pytorch/tensorflow
    artifact_path = mapped_column(String, nullable=False)
    metrics = mapped_column(JSON, nullable=True)
    parameters = mapped_column(JSON, nullable=True)
    status = mapped_column(String, default="draft", nullable=False) # draft/staging/production/archived
    created_by = mapped_column(String, nullable=True)
