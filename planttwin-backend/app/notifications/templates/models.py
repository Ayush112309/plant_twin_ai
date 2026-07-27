from sqlalchemy import String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin
from app.shared.mixins.timestamp_mixin import TimestampMixin
from app.shared.mixins.soft_delete_mixin import SoftDeleteMixin

class NotificationTemplate(Base, UUIDModelMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "notification_templates"

    name: Mapped[str] = mapped_column(String(255))
    event_type: Mapped[str] = mapped_column(String(100))
    subject_template: Mapped[str] = mapped_column(String(255))
    body_template: Mapped[str] = mapped_column(Text)
    channel_type: Mapped[str] = mapped_column(String(50))
    variables: Mapped[list | None] = mapped_column(JSON, nullable=True)
