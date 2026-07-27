from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from passlib.context import CryptContext

from app.identity.users.models import User
from app.enterprise.organizations.models import Organization
from app.shared.enums import UserRole
from app.identity.authentication.jwt import create_access_token, create_refresh_token
from app.identity.authentication.schemas import TokenResponse
from .schemas import OrganizationRegistrationRequest, OrganizationRegistrationResponse

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class RegistrationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register_organization(self, req: OrganizationRegistrationRequest) -> OrganizationRegistrationResponse:
        # 1. Check if organization slug already exists
        org_result = await self.db.execute(
            select(Organization).filter(Organization.slug == req.organization_slug, Organization.is_deleted == False)
        )
        if org_result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Organization slug already exists"
            )

        # 2. Check if admin email already exists
        user_result = await self.db.execute(
            select(User).filter(User.email == req.admin_email, User.is_deleted == False)
        )
        if user_result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # 3. Create Organization
        organization = Organization(
            name=req.organization_name,
            slug=req.organization_slug,
            description=f"{req.industry_type} organization",
            is_active=True
        )
        self.db.add(organization)
        await self.db.flush() # Flush to get the organization ID

        # 4. Create System Admin User
        hashed_password = pwd_context.hash(req.admin_password)
        admin_user = User(
            email=req.admin_email,
            hashed_password=hashed_password,
            first_name=req.admin_first_name,
            last_name=req.admin_last_name,
            role=UserRole.SYSTEM_ADMIN,
            organization_id=organization.id,
            is_active=True
        )
        self.db.add(admin_user)
        
        # Commit the transaction
        await self.db.commit()
        await self.db.refresh(organization)
        await self.db.refresh(admin_user)

        # 5. Generate Tokens
        access_token = create_access_token(
            user_id=admin_user.id,
            organization_id=organization.id,
            role=admin_user.role.value
        )
        refresh_token = create_refresh_token(
            user_id=admin_user.id,
            organization_id=organization.id
        )
        
        tokens = TokenResponse(access_token=access_token, refresh_token=refresh_token)

        return OrganizationRegistrationResponse(
            user_id=str(admin_user.id),
            organization_id=str(organization.id),
            token=tokens
        )
