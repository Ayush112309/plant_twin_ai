from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.identity.users.service import UserService
from app.identity.users.models import User
from app.enterprise.organizations.models import Organization
from app.shared.enums import UserRole

from .schemas import LoginRequest, TokenResponse, RefreshRequest, MeResponse, UserProfileResponse
from .jwt import create_access_token, create_refresh_token, decode_token, CREDENTIALS_EXCEPTION
from .dependencies import get_current_active_user


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=APIResponse[TokenResponse])
async def login(login_req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Authenticate user credentials against PostgreSQL, update last_login_at,
    and return real signed JWT access and refresh tokens containing user_id, org_id, and role.
    """
    user_service = UserService(db)
    user = await user_service.authenticate(login_req.email, login_req.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated. Please contact your System Administrator.",
        )
        
    # Update last login timestamp
    user.last_login_at = datetime.now(timezone.utc)
    await db.commit()

    role_str = user.role.value if user.role else None

    access_token = create_access_token(
        user_id=user.id,
        organization_id=user.organization_id,
        role=role_str,
    )
    refresh_token = create_refresh_token(
        user_id=user.id,
        organization_id=user.organization_id,
    )
    
    tokens = TokenResponse(access_token=access_token, refresh_token=refresh_token)
    return APIResponse(data=tokens, message="Login successful")


@router.post("/refresh", response_model=APIResponse[TokenResponse])
async def refresh(refresh_req: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """
    Issue a new JWT access token using a valid refresh token.
    """
    payload = decode_token(refresh_req.refresh_token)
    if payload.get("type") != "refresh":
        raise CREDENTIALS_EXCEPTION

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise CREDENTIALS_EXCEPTION

    user_service = UserService(db)
    user = await user_service.get_by_id(user_id_str)
    if not user or not user.is_active:
        raise CREDENTIALS_EXCEPTION

    role_str = user.role.value if user.role else None

    new_access_token = create_access_token(
        user_id=user.id,
        organization_id=user.organization_id,
        role=role_str,
    )

    tokens = TokenResponse(access_token=new_access_token, refresh_token=refresh_req.refresh_token)
    return APIResponse(data=tokens, message="Token refreshed successfully")


@router.get("/me", response_model=APIResponse[MeResponse])
async def get_me(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Return current authenticated user's profile, organization info, and computed RBAC permissions matrix.
    """
    org_dict = None
    if current_user.organization_id:
        result = await db.execute(
            select(Organization).where(Organization.id == current_user.organization_id)
        )
        org = result.scalars().first()
        if org:
            org_dict = {
                "id": str(org.id),
                "name": org.name,
                "slug": org.slug,
                "description": org.description,
                "logo_url": org.logo_url,
                "subscription_tier": org.subscription_tier,
            }

    # Compute permission flags based on role
    role = current_user.role
    is_admin = current_user.is_superuser or role == UserRole.SYSTEM_ADMIN
    
    permissions = {
        "is_system_admin": is_admin,
        "can_view_all_plants": is_admin or role in [UserRole.PLANT_MANAGER, UserRole.MAINTENANCE_MANAGER],
        "can_write_plc": is_admin or role == UserRole.CONTROL_OPERATOR,
        "can_manage_work_orders": is_admin or role == UserRole.MAINTENANCE_MANAGER,
        "can_promote_models": is_admin or role == UserRole.AI_SPECIALIST,
        "can_export_reports": is_admin or role in [UserRole.PLANT_MANAGER, UserRole.MAINTENANCE_MANAGER, UserRole.AI_SPECIALIST],
        "can_administer_system": is_admin,
        "can_invite_users": is_admin,
    }

    user_profile = UserProfileResponse.model_validate(current_user)
    me_data = MeResponse(
        user=user_profile,
        organization=org_dict,
        permissions=permissions,
    )

    return APIResponse(data=me_data, message="Current user profile retrieved")


@router.post("/logout", response_model=APIResponse)
async def logout():
    return APIResponse(data=None, message="Logout successful")
