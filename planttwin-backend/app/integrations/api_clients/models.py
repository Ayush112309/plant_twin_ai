from sqlalchemy import String, JSON, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin
from app.shared.mixins.timestamp_mixin import TimestampMixin
from app.shared.mixins.soft_delete_mixin import SoftDeleteMixin

class ApiClient(Base, UUIDModelMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "external_api_clients"

    name: Mapped[str] = mapped_column(String(255))
    client_type: Mapped[str] = mapped_column(String(100)) # sap/oracle/maximo/cmms/mes/scada/historian/powerbi/grafana
    base_url: Mapped[str] = mapped_column(String(1024))
    auth_type: Mapped[str] = mapped_column(String(50)) # none/basic/bearer/oauth
    credentials: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    config: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_sync_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
