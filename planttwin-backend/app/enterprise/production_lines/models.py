from sqlalchemy import Column, String, Boolean, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.shared.mixins.base_model import Base
from app.shared.mixins import UUIDModelMixin, TimestampMixin

class ProductionLine(Base, UUIDModelMixin, TimestampMixin):
    __tablename__ = "production_lines"
    
    name: Mapped[str] = mapped_column(String, nullable=False)
    code: Mapped[str] = mapped_column(String, nullable=False)
    area_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("areas.id"), nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=True)
    capacity: Mapped[float] = mapped_column(Float, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
