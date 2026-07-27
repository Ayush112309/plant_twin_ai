from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.shared.mixins.base_model import Base
from app.shared.mixins import UUIDModelMixin, TimestampMixin

class Area(Base, UUIDModelMixin, TimestampMixin):
    __tablename__ = "areas"
    
    name: Mapped[str] = mapped_column(String, nullable=False)
    code: Mapped[str] = mapped_column(String, nullable=False)
    plant_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("plants.id"), nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
