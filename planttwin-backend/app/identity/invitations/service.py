from typing import List
from uuid import UUID
from datetime import datetime, timezone, timedelta
import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from passlib.context import CryptContext

from app.core.config.settings import settings
from app.identity.users.models import User
from app.enterprise.organizations.models import Organization
from app.shared.enums import InvitationStatus
from app.identity.authentication.jwt import create_access_token, create_refresh_token
from app.identity.authentication.schemas import TokenResponse
from .models import Invitation
from .schemas import InvitationCreate, InvitationAccept, VerifyInvitationResponse
from .email_service import EmailService

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class InvitationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _update_expired_invitations(self, org_id: UUID):
        """Helper to lazy-update expired invitations on read."""
        now = datetime.now(timezone.utc)
        result = await self.db.execute(
            select(Invitation).where(
                Invitation.organization_id == org_id,
                Invitation.status == InvitationStatus.PENDING,
                Invitation.expires_at < now
            )
        )
        expired_invites = result.scalars().all()
        for invite in expired_invites:
            invite.status = InvitationStatus.EXPIRED
        if expired_invites:
            await self.db.commit()

    async def list_invitations(self, org_id: UUID) -> List[Invitation]:
        await self._update_expired_invitations(org_id)
        result = await self.db.execute(
            select(Invitation).where(Invitation.organization_id == org_id)
        )
        return result.scalars().all()

    async def send_invitation(self, org_id: UUID, invited_by_id: UUID, req: InvitationCreate) -> Invitation:
        # Check if user already exists
        user_result = await self.db.execute(select(User).where(User.email == req.email, User.is_deleted == False))
        if user_result.scalars().first():
            raise HTTPException(status_code=400, detail="User with this email already exists")

        # Check if pending invite already exists
        invite_result = await self.db.execute(
            select(Invitation).where(
                Invitation.email == req.email,
                Invitation.organization_id == org_id,
                Invitation.status == InvitationStatus.PENDING
            )
        )
        existing_invite = invite_result.scalars().first()
        if existing_invite and not existing_invite.is_expired:
            raise HTTPException(status_code=400, detail="A pending invitation already exists for this email")

        invitation = Invitation(
            email=req.email,
            organization_id=org_id,
            role=req.role,
            invited_by=invited_by_id
        )
        self.db.add(invitation)
        await self.db.commit()
        await self.db.refresh(invitation)

        # Get org and inviter names for email
        org = (await self.db.execute(select(Organization).where(Organization.id == org_id))).scalars().first()
        inviter = (await self.db.execute(select(User).where(User.id == invited_by_id))).scalars().first()

        accept_url = f"{settings.FRONTEND_URL}/accept-invitation?token={invitation.token}"
        EmailService.send_invitation_email(
            to_email=invitation.email,
            org_name=org.name if org else "PlantTwin AI",
            inviter_name=f"{inviter.first_name} {inviter.last_name}" if inviter else "System Administrator",
            role=invitation.role.value,
            accept_url=accept_url
        )

        return invitation

    async def verify_token(self, token: str) -> VerifyInvitationResponse:
        result = await self.db.execute(select(Invitation).where(Invitation.token == token))
        invitation = result.scalars().first()

        if not invitation:
            raise HTTPException(status_code=404, detail="Invitation not found")
        
        if invitation.status != InvitationStatus.PENDING or invitation.is_expired:
            raise HTTPException(status_code=400, detail="Invitation is expired or no longer valid")

        org = (await self.db.execute(select(Organization).where(Organization.id == invitation.organization_id))).scalars().first()

        return VerifyInvitationResponse(
            email=invitation.email,
            organization_name=org.name if org else "PlantTwin AI",
            role=invitation.role
        )

    async def accept_invitation(self, req: InvitationAccept) -> TokenResponse:
        result = await self.db.execute(select(Invitation).where(Invitation.token == req.token))
        invitation = result.scalars().first()

        if not invitation or invitation.status != InvitationStatus.PENDING or invitation.is_expired:
            raise HTTPException(status_code=400, detail="Invalid or expired invitation token")

        # Create user
        hashed_password = pwd_context.hash(req.password)
        user = User(
            email=invitation.email,
            hashed_password=hashed_password,
            first_name=req.first_name,
            last_name=req.last_name,
            role=invitation.role,
            organization_id=invitation.organization_id,
            invited_by=invitation.invited_by,
            is_active=True
        )
        self.db.add(user)

        # Update invitation
        invitation.status = InvitationStatus.ACCEPTED
        invitation.accepted_at = datetime.now(timezone.utc)

        await self.db.commit()
        await self.db.refresh(user)

        # Generate tokens
        access_token = create_access_token(
            user_id=user.id,
            organization_id=user.organization_id,
            role=user.role.value
        )
        refresh_token = create_refresh_token(
            user_id=user.id,
            organization_id=user.organization_id
        )

        return TokenResponse(access_token=access_token, refresh_token=refresh_token)

    async def revoke_invitation(self, invite_id: UUID, org_id: UUID):
        result = await self.db.execute(
            select(Invitation).where(Invitation.id == invite_id, Invitation.organization_id == org_id)
        )
        invitation = result.scalars().first()
        
        if not invitation:
            raise HTTPException(status_code=404, detail="Invitation not found")
            
        if invitation.status == InvitationStatus.ACCEPTED:
            raise HTTPException(status_code=400, detail="Cannot revoke an accepted invitation")
            
        invitation.status = InvitationStatus.REVOKED
        await self.db.commit()

    async def resend_invitation(self, invite_id: UUID, org_id: UUID, inviter_id: UUID) -> Invitation:
        result = await self.db.execute(
            select(Invitation).where(Invitation.id == invite_id, Invitation.organization_id == org_id)
        )
        invitation = result.scalars().first()
        
        if not invitation:
            raise HTTPException(status_code=404, detail="Invitation not found")
            
        if invitation.status == InvitationStatus.ACCEPTED:
            raise HTTPException(status_code=400, detail="Cannot resend an accepted invitation")

        # Regenerate token and reset expiry
        invitation.token = str(uuid.uuid4())
        invitation.expires_at = datetime.now(timezone.utc) + timedelta(days=settings.INVITATION_EXPIRE_DAYS)
        invitation.status = InvitationStatus.PENDING
        await self.db.commit()
        await self.db.refresh(invitation)

        # Send email again
        org = (await self.db.execute(select(Organization).where(Organization.id == org_id))).scalars().first()
        inviter = (await self.db.execute(select(User).where(User.id == inviter_id))).scalars().first()

        accept_url = f"{settings.FRONTEND_URL}/accept-invitation?token={invitation.token}"
        EmailService.send_invitation_email(
            to_email=invitation.email,
            org_name=org.name if org else "PlantTwin AI",
            inviter_name=f"{inviter.first_name} {inviter.last_name}" if inviter else "System Administrator",
            role=invitation.role.value,
            accept_url=accept_url
        )
        
        return invitation
