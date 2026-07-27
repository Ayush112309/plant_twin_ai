from sqlalchemy import String, Integer, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin
from app.shared.mixins.timestamp_mixin import TimestampMixin
from app.shared.mixins.soft_delete_mixin import SoftDeleteMixin

class Tenant(Base, UUIDModelMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "tenants"

    name: Mapped[str] = mapped_column(String(255))
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    organization_id: Mapped[str | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="active") # active/suspended/trial
    tier: Mapped[str] = mapped_column(String(50), default="free")
    max_users: Mapped[int | None] = mapped_column(Integer, nullable=True)
    max_devices: Mapped[int | None] = mapped_column(Integer, nullable=True)
    storage_limit_gb: Mapped[int | None] = mapped_column(Integer, nullable=True)
    features: Mapped[dict | None] = mapped_column(JSON, nullable=True)
