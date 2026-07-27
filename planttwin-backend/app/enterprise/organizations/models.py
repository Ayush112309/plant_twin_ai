from sqlalchemy import Column, String, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.shared.mixins.base_model import Base
from app.shared.mixins import UUIDModelMixin, SoftDeleteMixin, TimestampMixin

class Organization(Base, UUIDModelMixin, SoftDeleteMixin, TimestampMixin):
    __tablename__ = "organizations"
    
    name: Mapped[str] = mapped_column(String, nullable=False)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=True)
    logo_url: Mapped[str] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    settings: Mapped[dict] = mapped_column(JSON, default=dict)
    subscription_tier: Mapped[str] = mapped_column(String, nullable=True)
