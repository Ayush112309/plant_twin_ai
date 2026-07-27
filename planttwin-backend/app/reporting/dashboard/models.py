from sqlalchemy import String, Text, Boolean, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin
from app.shared.mixins.timestamp_mixin import TimestampMixin
from app.shared.mixins.soft_delete_mixin import SoftDeleteMixin

class Dashboard(Base, UUIDModelMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "dashboards"

    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    layout: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    widgets: Mapped[list | None] = mapped_column(JSON, nullable=True)
    owner_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    is_shared: Mapped[bool] = mapped_column(Boolean, default=False)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
