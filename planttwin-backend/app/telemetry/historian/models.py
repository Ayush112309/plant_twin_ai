import uuid
from sqlalchemy import String, Boolean, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin

class HistorianQuery(Base, UUIDModelMixin):
    __tablename__ = "historian_queries"
    
    name: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[str] = mapped_column(String, nullable=True)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"), index=True)
    query_config: Mapped[dict] = mapped_column(JSON)
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    is_shared: Mapped[bool] = mapped_column(Boolean, default=False)
