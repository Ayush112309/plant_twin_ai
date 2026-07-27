from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.shared.enums import UserRole, InvitationStatus
from app.identity.authentication.schemas import TokenResponse

class InvitationCreate(BaseModel):
    email: EmailStr
    role: UserRole

class InvitationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: EmailStr
    organization_id: UUID
    role: UserRole
    invited_by: UUID
    token: Optional[str] = None
    status: InvitationStatus
    expires_at: datetime
    accepted_at: Optional[datetime]
    created_at: datetime

class InvitationAccept(BaseModel):
    token: str
    password: str
    first_name: str
    last_name: str

class VerifyInvitationResponse(BaseModel):
    email: str
    organization_name: str
    role: UserRole
