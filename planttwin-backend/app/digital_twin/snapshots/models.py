import uuid
from sqlalchemy import String, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin

class TwinSnapshot(Base, UUIDModelMixin):
    __tablename__ = "twin_snapshots"
    
    twin_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("digital_twins.id"), index=True)
    snapshot_data: Mapped[dict] = mapped_column(JSON)
    reason: Mapped[str] = mapped_column(String)
    triggered_by: Mapped[str] = mapped_column(String, nullable=True) # manual/scheduled/event
