from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.identity.users.models import User
from app.identity.authentication.dependencies import get_current_active_user, get_current_org_id, require_admin
from app.identity.authentication.schemas import TokenResponse
from .schemas import InvitationCreate, InvitationResponse, InvitationAccept, VerifyInvitationResponse
from .service import InvitationService

router = APIRouter(prefix="/invitations", tags=["Invitations"])

@router.post("", response_model=APIResponse[InvitationResponse], dependencies=[Depends(require_admin)])
async def create_invitation(
    req: InvitationCreate, 
    current_user: User = Depends(get_current_active_user),
    org_id: UUID = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db)
):
    service = InvitationService(db)
    invitation = await service.send_invitation(org_id, current_user.id, req)
    return APIResponse(data=InvitationResponse.model_validate(invitation), message="Invitation sent successfully")


@router.get("", response_model=APIResponse[List[InvitationResponse]], dependencies=[Depends(require_admin)])
async def list_invitations(
    org_id: UUID = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db)
):
    service = InvitationService(db)
    invitations = await service.list_invitations(org_id)
    return APIResponse(
        data=[InvitationResponse.model_validate(i) for i in invitations], 
        message="Invitations retrieved"
    )


@router.get("/verify/{token}", response_model=APIResponse[VerifyInvitationResponse])
async def verify_invitation(token: str, db: AsyncSession = Depends(get_db)):
    # Public endpoint
    service = InvitationService(db)
    result = await service.verify_token(token)
    return APIResponse(data=result, message="Token is valid")


@router.post("/accept", response_model=APIResponse[TokenResponse])
async def accept_invitation(req: InvitationAccept, db: AsyncSession = Depends(get_db)):
    # Public endpoint
    service = InvitationService(db)
    tokens = await service.accept_invitation(req)
    return APIResponse(data=tokens, message="Invitation accepted successfully")


@router.post("/{invite_id}/resend", response_model=APIResponse[InvitationResponse], dependencies=[Depends(require_admin)])
async def resend_invitation(
    invite_id: UUID,
    current_user: User = Depends(get_current_active_user),
    org_id: UUID = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db)
):
    service = InvitationService(db)
    invitation = await service.resend_invitation(invite_id, org_id, current_user.id)
    return APIResponse(data=InvitationResponse.model_validate(invitation), message="Invitation resent successfully")


@router.delete("/{invite_id}", response_model=APIResponse, dependencies=[Depends(require_admin)])
async def revoke_invitation(
    invite_id: UUID,
    org_id: UUID = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db)
):
    service = InvitationService(db)
    await service.revoke_invitation(invite_id, org_id)
    return APIResponse(data=None, message="Invitation revoked successfully")
