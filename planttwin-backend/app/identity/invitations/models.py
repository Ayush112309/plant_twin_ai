"""
Invitation Model — Multi-Tenant User Onboarding
=================================================
Tracks email invitations sent by System Administrators to onboard
new users into their organization. Supports configurable expiration,
token regeneration (resend), and revocation.
"""
import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy import String, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.shared.mixins.base_model import Base
from app.shared.mixins import UUIDModelMixin, TimestampMixin
from app.shared.enums import UserRole, InvitationStatus
from app.core.config.settings import settings


def _default_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(days=settings.INVITATION_EXPIRE_DAYS)


class Invitation(Base, UUIDModelMixin, TimestampMixin):
    __tablename__ = "invitations"

    # Who is being invited
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)

    # Which organization the invite belongs to (tenant boundary)
    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, index=True
    )

    # Role to assign upon acceptance
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole), nullable=False)

    # Who sent the invitation (System Admin)
    invited_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )

    # Unique, cryptographically random token for the invitation link
    token: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False, default=lambda: str(uuid.uuid4())
    )

    # Invitation lifecycle status
    status: Mapped[InvitationStatus] = mapped_column(
        SAEnum(InvitationStatus), nullable=False, default=InvitationStatus.PENDING
    )

    # Expiration timestamp (configurable, default 7 days from creation)
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_default_expiry
    )

    # When the invited user accepted (null until accepted)
    accepted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    @property
    def is_expired(self) -> bool:
        """Check if the invitation has passed its expiration time."""
        if not self.expires_at:
            return False
        expires = self.expires_at
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        return datetime.now(timezone.utc) > expires

    @property
    def is_actionable(self) -> bool:
        """Check if the invitation can still be accepted."""
        return self.status == InvitationStatus.PENDING and not self.is_expired
