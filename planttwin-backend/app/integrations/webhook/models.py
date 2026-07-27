from sqlalchemy import String, Integer, JSON, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin
from app.shared.mixins.timestamp_mixin import TimestampMixin
from app.shared.mixins.soft_delete_mixin import SoftDeleteMixin

class Webhook(Base, UUIDModelMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "webhooks"

    name: Mapped[str] = mapped_column(String(255))
    url: Mapped[str] = mapped_column(String(1024))
    secret: Mapped[str | None] = mapped_column(String(255), nullable=True)
    events: Mapped[list] = mapped_column(JSON)
    headers: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_triggered_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    failure_count: Mapped[int] = mapped_column(Integer, default=0)
