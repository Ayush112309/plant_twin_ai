from sqlalchemy import Column, String, Boolean, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.shared.mixins.base_model import Base
from app.shared.mixins import UUIDModelMixin, SoftDeleteMixin, TimestampMixin

class Plant(Base, UUIDModelMixin, SoftDeleteMixin, TimestampMixin):
    __tablename__ = "plants"
    
    name: Mapped[str] = mapped_column(String, nullable=False)
    code: Mapped[str] = mapped_column(String, nullable=False)  # Unique within org, handled in logic/constraints
    organization_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    location: Mapped[str] = mapped_column(String, nullable=True)
    timezone: Mapped[str] = mapped_column(String, default="UTC")
    latitude: Mapped[float] = mapped_column(Float, nullable=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
