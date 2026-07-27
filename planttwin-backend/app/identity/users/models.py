from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app.shared.mixins.base_model import Base
from app.shared.mixins import UUIDModelMixin, SoftDeleteMixin, TimestampMixin
from app.shared.enums import UserRole

class User(Base, UUIDModelMixin, SoftDeleteMixin, TimestampMixin):
    __tablename__ = "users"
    
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    first_name: Mapped[str] = mapped_column(String, nullable=True)
    last_name: Mapped[str] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole), nullable=True)

    # ── Multi-Tenant: Organization Ownership ──────────────
    organization_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True, index=True
    )

    # ── Invitation Tracking ───────────────────────────────
    invited_by: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )

    avatar_url: Mapped[str] = mapped_column(String, nullable=True)
    last_login_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
