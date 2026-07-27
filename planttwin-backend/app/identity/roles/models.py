from sqlalchemy import Column, String, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.shared.mixins.base_model import Base
from app.shared.mixins import UUIDModelMixin, TimestampMixin

class Role(Base, UUIDModelMixin, TimestampMixin):
    __tablename__ = "roles"
    
    name: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=True)
    is_system_role: Mapped[bool] = mapped_column(Boolean, default=False)
    permissions: Mapped[dict] = mapped_column(JSON, default=dict)
