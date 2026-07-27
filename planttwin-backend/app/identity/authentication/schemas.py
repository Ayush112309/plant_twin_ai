from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from app.shared.enums import UserRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserProfileResponse(BaseModel):
    """Returned by /auth/me — full user profile with organization context."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: bool = True
    is_superuser: bool = False
    organization_id: Optional[UUID] = None
    avatar_url: Optional[str] = None
    last_login_at: Optional[datetime] = None
    created_at: Optional[datetime] = None


class MeResponse(BaseModel):
    """Complete /auth/me response including organization info and permissions."""
    user: UserProfileResponse
    organization: Optional[Dict[str, Any]] = None
    permissions: Dict[str, bool] = {}
