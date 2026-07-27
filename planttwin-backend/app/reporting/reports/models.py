from sqlalchemy import String, Text, Integer, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin
from app.shared.mixins.timestamp_mixin import TimestampMixin
from app.shared.mixins.soft_delete_mixin import SoftDeleteMixin

class Report(Base, UUIDModelMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "reports"

    name: Mapped[str] = mapped_column(String(255), index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    report_type: Mapped[str] = mapped_column(String(50)) # operational/maintenance/performance/compliance/custom
    template_id: Mapped[str | None] = mapped_column(ForeignKey("report_templates.id"), nullable=True)
    config: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    format: Mapped[str] = mapped_column(String(20)) # pdf/excel/csv
    status: Mapped[str] = mapped_column(String(50), default="pending") # pending/generating/completed/failed
    file_path: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    generated_by: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    generated_at: Mapped[datetime | None] = mapped_column(nullable=True)
    file_size: Mapped[int | None] = mapped_column(Integer, nullable=True)
