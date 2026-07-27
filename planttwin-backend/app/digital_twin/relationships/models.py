import uuid
from sqlalchemy import String, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin

class TwinRelationship(Base, UUIDModelMixin):
    __tablename__ = "twin_relationships"
    
    source_twin_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("digital_twins.id"), index=True)
    target_twin_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("digital_twins.id"), index=True)
    relationship_type: Mapped[str] = mapped_column(String) # parent/child/feeds_into/depends_on
    metadata_: Mapped[dict] = mapped_column("metadata", JSON, nullable=True)
