from sqlalchemy import String, Integer, JSON, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin
from app.shared.mixins.timestamp_mixin import TimestampMixin
from app.shared.mixins.soft_delete_mixin import SoftDeleteMixin

class License(Base, UUIDModelMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "licenses"

    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"))
    license_key: Mapped[str] = mapped_column(String(255), unique=True)
    license_type: Mapped[str] = mapped_column(String(50))
    issued_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    max_assets: Mapped[int | None] = mapped_column(Integer, nullable=True)
    max_connections: Mapped[int | None] = mapped_column(Integer, nullable=True)
    features: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
