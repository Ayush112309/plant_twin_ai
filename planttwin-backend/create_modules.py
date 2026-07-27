import os

base_dir = r"C:\Users\ayush\.gemini\antigravity\scratch\planttwin-backend"

files = {
    "app/identity/users/models.py": """from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum as SAEnum
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
    tenant_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    avatar_url: Mapped[str] = mapped_column(String, nullable=True)
    last_login_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
""",
    "app/identity/users/schemas.py": """from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.shared.enums import UserRole

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[UserRole] = None

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    email: EmailStr
    first_name: Optional[str]
    last_name: Optional[str]
    role: Optional[UserRole]
    is_active: bool
    created_at: datetime
""",
    "app/identity/users/service.py": """from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from typing import Optional, List
from uuid import UUID
from .models import User
from .schemas import UserCreate, UserUpdate
from passlib.context import CryptContext
from fastapi import HTTPException, status

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db
        
    async def get_by_id(self, user_id: UUID) -> Optional[User]:
        result = await self.db.execute(select(User).filter(User.id == user_id, User.is_deleted == False))
        return result.scalars().first()
        
    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).filter(User.email == email, User.is_deleted == False))
        return result.scalars().first()
        
    async def list_users(self, skip: int = 0, limit: int = 10) -> List[User]:
        result = await self.db.execute(select(User).filter(User.is_deleted == False).offset(skip).limit(limit))
        return result.scalars().all()
        
    async def create_user(self, user_in: UserCreate) -> User:
        db_user = await self.get_by_email(user_in.email)
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
            
        hashed_password = pwd_context.hash(user_in.password)
        db_user = User(
            email=user_in.email,
            hashed_password=hashed_password,
            first_name=user_in.first_name,
            last_name=user_in.last_name,
            role=user_in.role
        )
        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)
        return db_user
        
    async def update_user(self, user_id: UUID, user_in: UserUpdate) -> Optional[User]:
        db_user = await self.get_by_id(user_id)
        if not db_user:
            return None
            
        update_data = user_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_user, field, value)
            
        await self.db.commit()
        await self.db.refresh(db_user)
        return db_user
        
    async def delete_user(self, user_id: UUID) -> bool:
        db_user = await self.get_by_id(user_id)
        if not db_user:
            return False
            
        db_user.soft_delete()
        await self.db.commit()
        return True
        
    async def authenticate(self, email: str, password: str) -> Optional[User]:
        user = await self.get_by_email(email)
        if not user or not pwd_context.verify(password, user.hashed_password):
            return None
        return user
""",
    "app/identity/users/router.py": """from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.shared.pagination import PaginationParams, PaginatedResponse
from .schemas import UserCreate, UserUpdate, UserResponse
from .service import UserService

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("", response_model=APIResponse)
async def list_users(pagination: PaginationParams = Depends(), db: AsyncSession = Depends(get_db)):
    service = UserService(db)
    users = await service.list_users(skip=pagination.skip, limit=pagination.limit)
    return APIResponse(data=[UserResponse.model_validate(user).model_dump() for user in users], message="Users retrieved successfully")

@router.get("/{user_id}", response_model=APIResponse)
async def get_user(user_id: UUID, db: AsyncSession = Depends(get_db)):
    service = UserService(db)
    user = await service.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return APIResponse(data=UserResponse.model_validate(user).model_dump(), message="User retrieved successfully")

@router.post("", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    service = UserService(db)
    user = await service.create_user(user_in)
    return APIResponse(data=UserResponse.model_validate(user).model_dump(), message="User created successfully", status_code=201)

@router.put("/{user_id}", response_model=APIResponse)
async def update_user(user_id: UUID, user_in: UserUpdate, db: AsyncSession = Depends(get_db)):
    service = UserService(db)
    user = await service.update_user(user_id, user_in)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return APIResponse(data=UserResponse.model_validate(user).model_dump(), message="User updated successfully")

@router.delete("/{user_id}", response_model=APIResponse)
async def delete_user(user_id: UUID, db: AsyncSession = Depends(get_db)):
    service = UserService(db)
    success = await service.delete_user(user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return APIResponse(data=None, message="User deleted successfully")
""",
    "app/identity/roles/models.py": """from sqlalchemy import Column, String, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.shared.mixins.base_model import Base
from app.shared.mixins import UUIDModelMixin, TimestampMixin

class Role(Base, UUIDModelMixin, TimestampMixin):
    __tablename__ = "roles"
    
    name: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=True)
    is_system_role: Mapped[bool] = mapped_column(Boolean, default=False)
    permissions: Mapped[dict] = mapped_column(JSON, default=dict)
""",
    "app/identity/roles/schemas.py": """from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime

class RoleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_system_role: Optional[bool] = False
    permissions: Optional[Dict[str, Any]] = {}

class RoleUpdate(BaseModel):
    description: Optional[str] = None
    permissions: Optional[Dict[str, Any]] = None

class RoleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    name: str
    description: Optional[str]
    is_system_role: bool
    permissions: Dict[str, Any]
    created_at: datetime
""",
    "app/identity/roles/service.py": """from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, List
from uuid import UUID
from .models import Role
from .schemas import RoleCreate, RoleUpdate
from app.identity.users.models import User
from fastapi import HTTPException, status

class RoleService:
    def __init__(self, db: AsyncSession):
        self.db = db
        
    async def get_by_id(self, role_id: UUID) -> Optional[Role]:
        result = await self.db.execute(select(Role).filter(Role.id == role_id))
        return result.scalars().first()
        
    async def get_by_name(self, name: str) -> Optional[Role]:
        result = await self.db.execute(select(Role).filter(Role.name == name))
        return result.scalars().first()
        
    async def list_roles(self, skip: int = 0, limit: int = 10) -> List[Role]:
        result = await self.db.execute(select(Role).offset(skip).limit(limit))
        return result.scalars().all()
        
    async def create_role(self, role_in: RoleCreate) -> Role:
        db_role = await self.get_by_name(role_in.name)
        if db_role:
            raise HTTPException(status_code=400, detail="Role name already exists")
            
        db_role = Role(
            name=role_in.name,
            description=role_in.description,
            is_system_role=role_in.is_system_role,
            permissions=role_in.permissions
        )
        self.db.add(db_role)
        await self.db.commit()
        await self.db.refresh(db_role)
        return db_role
        
    async def update_role(self, role_id: UUID, role_in: RoleUpdate) -> Optional[Role]:
        db_role = await self.get_by_id(role_id)
        if not db_role:
            return None
        if db_role.is_system_role:
            raise HTTPException(status_code=400, detail="Cannot modify system role")
            
        update_data = role_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_role, field, value)
            
        await self.db.commit()
        await self.db.refresh(db_role)
        return db_role
        
    async def delete_role(self, role_id: UUID) -> bool:
        db_role = await self.get_by_id(role_id)
        if not db_role:
            return False
        if db_role.is_system_role:
            raise HTTPException(status_code=400, detail="Cannot delete system role")
            
        await self.db.delete(db_role)
        await self.db.commit()
        return True
        
    async def assign_to_user(self, role_name: str, user_id: UUID) -> bool:
        # For simplicity, assuming roles are tracked on the User model natively or via relations
        # In the provided spec for users, role is an Enum `UserRole`.
        # This function might just map the string to the UserRole if applicable, or manage a many-to-many.
        # Here we just show a basic implementation.
        user_result = await self.db.execute(select(User).filter(User.id == user_id))
        user = user_result.scalars().first()
        if not user:
            return False
        # Implementation depends on role relation, left basic for now
        return True
""",
    "app/identity/roles/router.py": """from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.shared.pagination import PaginationParams
from .schemas import RoleCreate, RoleUpdate, RoleResponse
from .service import RoleService

router = APIRouter(prefix="/roles", tags=["Roles"])

@router.get("", response_model=APIResponse)
async def list_roles(pagination: PaginationParams = Depends(), db: AsyncSession = Depends(get_db)):
    service = RoleService(db)
    roles = await service.list_roles(skip=pagination.skip, limit=pagination.limit)
    return APIResponse(data=[RoleResponse.model_validate(role).model_dump() for role in roles], message="Roles retrieved successfully")

@router.get("/{role_id}", response_model=APIResponse)
async def get_role(role_id: UUID, db: AsyncSession = Depends(get_db)):
    service = RoleService(db)
    role = await service.get_by_id(role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return APIResponse(data=RoleResponse.model_validate(role).model_dump(), message="Role retrieved successfully")

@router.post("", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_role(role_in: RoleCreate, db: AsyncSession = Depends(get_db)):
    service = RoleService(db)
    role = await service.create_role(role_in)
    return APIResponse(data=RoleResponse.model_validate(role).model_dump(), message="Role created successfully", status_code=201)

@router.put("/{role_id}", response_model=APIResponse)
async def update_role(role_id: UUID, role_in: RoleUpdate, db: AsyncSession = Depends(get_db)):
    service = RoleService(db)
    role = await service.update_role(role_id, role_in)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return APIResponse(data=RoleResponse.model_validate(role).model_dump(), message="Role updated successfully")

@router.delete("/{role_id}", response_model=APIResponse)
async def delete_role(role_id: UUID, db: AsyncSession = Depends(get_db)):
    service = RoleService(db)
    success = await service.delete_role(role_id)
    if not success:
        raise HTTPException(status_code=404, detail="Role not found")
    return APIResponse(data=None, message="Role deleted successfully")
""",
    "app/identity/api_keys/models.py": """from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app.shared.mixins.base_model import Base
from app.shared.mixins import UUIDModelMixin, TimestampMixin

class APIKey(Base, UUIDModelMixin, TimestampMixin):
    __tablename__ = "api_keys"
    
    key_hash: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    scopes: Mapped[dict] = mapped_column(JSON, default=dict)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_used_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
""",
    "app/identity/api_keys/schemas.py": """from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime

class APIKeyCreate(BaseModel):
    name: str
    scopes: Optional[Dict[str, Any]] = {}
    expires_at: Optional[datetime] = None

class APIKeyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    name: str
    user_id: UUID
    scopes: Dict[str, Any]
    expires_at: Optional[datetime]
    is_active: bool
    last_used_at: Optional[datetime]
    created_at: datetime
    plaintext_key: Optional[str] = None
""",
    "app/identity/api_keys/service.py": """from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, List, Tuple
from uuid import UUID
import secrets
import hashlib
from .models import APIKey
from .schemas import APIKeyCreate
from fastapi import HTTPException

class APIKeyService:
    def __init__(self, db: AsyncSession):
        self.db = db
        
    def _generate_key_and_hash(self) -> Tuple[str, str]:
        raw_key = secrets.token_urlsafe(32)
        key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
        return raw_key, key_hash
        
    async def create_key(self, user_id: UUID, key_in: APIKeyCreate) -> Tuple[APIKey, str]:
        raw_key, key_hash = self._generate_key_and_hash()
        
        db_key = APIKey(
            key_hash=key_hash,
            name=key_in.name,
            user_id=user_id,
            scopes=key_in.scopes,
            expires_at=key_in.expires_at
        )
        self.db.add(db_key)
        await self.db.commit()
        await self.db.refresh(db_key)
        return db_key, raw_key
        
    async def list_by_user(self, user_id: UUID, skip: int = 0, limit: int = 10) -> List[APIKey]:
        result = await self.db.execute(
            select(APIKey).filter(APIKey.user_id == user_id, APIKey.is_active == True)
            .offset(skip).limit(limit)
        )
        return result.scalars().all()
        
    async def revoke_key(self, key_id: UUID, user_id: UUID) -> bool:
        result = await self.db.execute(select(APIKey).filter(APIKey.id == key_id, APIKey.user_id == user_id))
        db_key = result.scalars().first()
        if not db_key:
            return False
            
        db_key.is_active = False
        await self.db.commit()
        return True
""",
    "app/identity/api_keys/router.py": """from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID, uuid4
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.shared.pagination import PaginationParams
from .schemas import APIKeyCreate, APIKeyResponse
from .service import APIKeyService

router = APIRouter(prefix="/api-keys", tags=["API Keys"])

# Dummy current user ID for placeholder logic
# In reality, this would come from a current_user dependency
def get_current_user_id() -> UUID:
    return uuid4()

@router.post("", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_api_key(key_in: APIKeyCreate, db: AsyncSession = Depends(get_db)):
    service = APIKeyService(db)
    user_id = get_current_user_id() # Placeholder
    db_key, raw_key = await service.create_key(user_id, key_in)
    
    response_data = APIKeyResponse.model_validate(db_key).model_dump()
    response_data["plaintext_key"] = raw_key
    
    return APIResponse(data=response_data, message="API Key created successfully", status_code=201)

@router.get("", response_model=APIResponse)
async def list_api_keys(pagination: PaginationParams = Depends(), db: AsyncSession = Depends(get_db)):
    service = APIKeyService(db)
    user_id = get_current_user_id() # Placeholder
    keys = await service.list_by_user(user_id, skip=pagination.skip, limit=pagination.limit)
    return APIResponse(data=[APIKeyResponse.model_validate(key).model_dump() for key in keys], message="API Keys retrieved successfully")

@router.delete("/{key_id}", response_model=APIResponse)
async def delete_api_key(key_id: UUID, db: AsyncSession = Depends(get_db)):
    service = APIKeyService(db)
    user_id = get_current_user_id() # Placeholder
    success = await service.revoke_key(key_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="API Key not found or not owned by user")
    return APIResponse(data=None, message="API Key revoked successfully")
""",
    "app/identity/authentication/schemas.py": """from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str
""",
    "app/identity/authentication/router.py": """from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.identity.users.service import UserService
from .schemas import LoginRequest, TokenResponse, RefreshRequest

# Placeholder for actual security imports if they exist
# from app.core.security import create_access_token, create_refresh_token
def create_access_token(data: dict):
    return "access-token-placeholder"

def create_refresh_token(data: dict):
    return "refresh-token-placeholder"

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=APIResponse)
async def login(login_req: LoginRequest, db: AsyncSession = Depends(get_db)):
    user_service = UserService(db)
    user = await user_service.authenticate(login_req.email, login_req.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    tokens = TokenResponse(access_token=access_token, refresh_token=refresh_token)
    return APIResponse(data=tokens.model_dump(), message="Login successful")

@router.post("/refresh", response_model=APIResponse)
async def refresh(refresh_req: RefreshRequest):
    # Placeholder logic
    access_token = create_access_token(data={"sub": "placeholder"})
    tokens = TokenResponse(access_token=access_token, refresh_token=refresh_req.refresh_token)
    return APIResponse(data=tokens.model_dump(), message="Token refreshed successfully")

@router.post("/logout", response_model=APIResponse)
async def logout():
    # Typically logout is handled client side by dropping tokens, 
    # or server side by blocklisting tokens.
    return APIResponse(data=None, message="Logout successful")
""",
    "app/identity/router.py": """from fastapi import APIRouter
from .users.router import router as users_router
from .roles.router import router as roles_router
from .api_keys.router import router as api_keys_router
from .authentication.router import router as auth_router

router = APIRouter(prefix="/identity")

router.include_router(users_router)
router.include_router(roles_router)
router.include_router(api_keys_router)
router.include_router(auth_router)
""",
    "app/enterprise/organizations/models.py": """from sqlalchemy import Column, String, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.shared.mixins.base_model import Base
from app.shared.mixins import UUIDModelMixin, SoftDeleteMixin, TimestampMixin

class Organization(Base, UUIDModelMixin, SoftDeleteMixin, TimestampMixin):
    __tablename__ = "organizations"
    
    name: Mapped[str] = mapped_column(String, nullable=False)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=True)
    logo_url: Mapped[str] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    settings: Mapped[dict] = mapped_column(JSON, default=dict)
    subscription_tier: Mapped[str] = mapped_column(String, nullable=True)
""",
    "app/enterprise/organizations/schemas.py": """from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime

class OrganizationCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    subscription_tier: Optional[str] = None

class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    is_active: Optional[bool] = None
    settings: Optional[Dict[str, Any]] = None
    subscription_tier: Optional[str] = None

class OrganizationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    name: str
    slug: str
    description: Optional[str]
    logo_url: Optional[str]
    is_active: bool
    settings: Dict[str, Any]
    subscription_tier: Optional[str]
    created_at: datetime
""",
    "app/enterprise/organizations/service.py": """from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, List
from uuid import UUID
from .models import Organization
from .schemas import OrganizationCreate, OrganizationUpdate
from fastapi import HTTPException

class OrganizationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        
    async def get_by_id(self, org_id: UUID) -> Optional[Organization]:
        result = await self.db.execute(select(Organization).filter(Organization.id == org_id, Organization.is_deleted == False))
        return result.scalars().first()
        
    async def get_by_slug(self, slug: str) -> Optional[Organization]:
        result = await self.db.execute(select(Organization).filter(Organization.slug == slug, Organization.is_deleted == False))
        return result.scalars().first()
        
    async def list_organizations(self, skip: int = 0, limit: int = 10) -> List[Organization]:
        result = await self.db.execute(select(Organization).filter(Organization.is_deleted == False).offset(skip).limit(limit))
        return result.scalars().all()
        
    async def create_organization(self, org_in: OrganizationCreate) -> Organization:
        db_org = await self.get_by_slug(org_in.slug)
        if db_org:
            raise HTTPException(status_code=400, detail="Slug already taken")
            
        db_org = Organization(
            name=org_in.name,
            slug=org_in.slug,
            description=org_in.description,
            subscription_tier=org_in.subscription_tier
        )
        self.db.add(db_org)
        await self.db.commit()
        await self.db.refresh(db_org)
        return db_org
        
    async def update_organization(self, org_id: UUID, org_in: OrganizationUpdate) -> Optional[Organization]:
        db_org = await self.get_by_id(org_id)
        if not db_org:
            return None
            
        update_data = org_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_org, field, value)
            
        await self.db.commit()
        await self.db.refresh(db_org)
        return db_org
        
    async def delete_organization(self, org_id: UUID) -> bool:
        db_org = await self.get_by_id(org_id)
        if not db_org:
            return False
            
        db_org.soft_delete()
        await self.db.commit()
        return True
""",
    "app/enterprise/organizations/router.py": """from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.shared.pagination import PaginationParams
from .schemas import OrganizationCreate, OrganizationUpdate, OrganizationResponse
from .service import OrganizationService

router = APIRouter(prefix="/organizations", tags=["Organizations"])

@router.get("", response_model=APIResponse)
async def list_organizations(pagination: PaginationParams = Depends(), db: AsyncSession = Depends(get_db)):
    service = OrganizationService(db)
    orgs = await service.list_organizations(skip=pagination.skip, limit=pagination.limit)
    return APIResponse(data=[OrganizationResponse.model_validate(org).model_dump() for org in orgs], message="Organizations retrieved successfully")

@router.get("/{org_id}", response_model=APIResponse)
async def get_organization(org_id: UUID, db: AsyncSession = Depends(get_db)):
    service = OrganizationService(db)
    org = await service.get_by_id(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return APIResponse(data=OrganizationResponse.model_validate(org).model_dump(), message="Organization retrieved successfully")

@router.post("", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(org_in: OrganizationCreate, db: AsyncSession = Depends(get_db)):
    service = OrganizationService(db)
    org = await service.create_organization(org_in)
    return APIResponse(data=OrganizationResponse.model_validate(org).model_dump(), message="Organization created successfully", status_code=201)

@router.put("/{org_id}", response_model=APIResponse)
async def update_organization(org_id: UUID, org_in: OrganizationUpdate, db: AsyncSession = Depends(get_db)):
    service = OrganizationService(db)
    org = await service.update_organization(org_id, org_in)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return APIResponse(data=OrganizationResponse.model_validate(org).model_dump(), message="Organization updated successfully")

@router.delete("/{org_id}", response_model=APIResponse)
async def delete_organization(org_id: UUID, db: AsyncSession = Depends(get_db)):
    service = OrganizationService(db)
    success = await service.delete_organization(org_id)
    if not success:
        raise HTTPException(status_code=404, detail="Organization not found")
    return APIResponse(data=None, message="Organization deleted successfully")
""",
    "app/enterprise/plants/models.py": """from sqlalchemy import Column, String, Boolean, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.shared.mixins.base_model import Base
from app.shared.mixins import UUIDModelMixin, SoftDeleteMixin, TimestampMixin

class Plant(Base, UUIDModelMixin, SoftDeleteMixin, TimestampMixin):
    __tablename__ = "plants"
    
    name: Mapped[str] = mapped_column(String, nullable=False)
    code: Mapped[str] = mapped_column(String, nullable=False)  # Unique within org, handled in logic/constraints
    organization_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    location: Mapped[str] = mapped_column(String, nullable=True)
    timezone: Mapped[str] = mapped_column(String, default="UTC")
    latitude: Mapped[float] = mapped_column(Float, nullable=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
""",
    "app/enterprise/plants/schemas.py": """from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime

class PlantCreate(BaseModel):
    name: str
    code: str
    organization_id: UUID
    location: Optional[str] = None
    timezone: Optional[str] = "UTC"
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class PlantUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    location: Optional[str] = None
    timezone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_active: Optional[bool] = None

class PlantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    name: str
    code: str
    organization_id: UUID
    location: Optional[str]
    timezone: str
    latitude: Optional[float]
    longitude: Optional[float]
    is_active: bool
    created_at: datetime
""",
    "app/enterprise/plants/service.py": """from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, List
from uuid import UUID
from .models import Plant
from .schemas import PlantCreate, PlantUpdate
from fastapi import HTTPException

class PlantService:
    def __init__(self, db: AsyncSession):
        self.db = db
        
    async def get_by_id(self, plant_id: UUID) -> Optional[Plant]:
        result = await self.db.execute(select(Plant).filter(Plant.id == plant_id, Plant.is_deleted == False))
        return result.scalars().first()
        
    async def list_plants(self, organization_id: Optional[UUID] = None, skip: int = 0, limit: int = 10) -> List[Plant]:
        query = select(Plant).filter(Plant.is_deleted == False)
        if organization_id:
            query = query.filter(Plant.organization_id == organization_id)
        result = await self.db.execute(query.offset(skip).limit(limit))
        return result.scalars().all()
        
    async def create_plant(self, plant_in: PlantCreate) -> Plant:
        # Code uniqueness within org check
        query = select(Plant).filter(Plant.organization_id == plant_in.organization_id, Plant.code == plant_in.code, Plant.is_deleted == False)
        result = await self.db.execute(query)
        if result.scalars().first():
            raise HTTPException(status_code=400, detail="Plant code already exists in this organization")
            
        db_plant = Plant(**plant_in.model_dump())
        self.db.add(db_plant)
        await self.db.commit()
        await self.db.refresh(db_plant)
        return db_plant
        
    async def update_plant(self, plant_id: UUID, plant_in: PlantUpdate) -> Optional[Plant]:
        db_plant = await self.get_by_id(plant_id)
        if not db_plant:
            return None
            
        update_data = plant_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_plant, field, value)
            
        await self.db.commit()
        await self.db.refresh(db_plant)
        return db_plant
        
    async def delete_plant(self, plant_id: UUID) -> bool:
        db_plant = await self.get_by_id(plant_id)
        if not db_plant:
            return False
            
        db_plant.soft_delete()
        await self.db.commit()
        return True
""",
    "app/enterprise/plants/router.py": """from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.shared.pagination import PaginationParams
from .schemas import PlantCreate, PlantUpdate, PlantResponse
from .service import PlantService

router = APIRouter(prefix="/plants", tags=["Plants"])

@router.get("", response_model=APIResponse)
async def list_plants(organization_id: Optional[UUID] = None, pagination: PaginationParams = Depends(), db: AsyncSession = Depends(get_db)):
    service = PlantService(db)
    plants = await service.list_plants(organization_id=organization_id, skip=pagination.skip, limit=pagination.limit)
    return APIResponse(data=[PlantResponse.model_validate(p).model_dump() for p in plants], message="Plants retrieved successfully")

@router.get("/{plant_id}", response_model=APIResponse)
async def get_plant(plant_id: UUID, db: AsyncSession = Depends(get_db)):
    service = PlantService(db)
    plant = await service.get_by_id(plant_id)
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    return APIResponse(data=PlantResponse.model_validate(plant).model_dump(), message="Plant retrieved successfully")

@router.post("", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_plant(plant_in: PlantCreate, db: AsyncSession = Depends(get_db)):
    service = PlantService(db)
    plant = await service.create_plant(plant_in)
    return APIResponse(data=PlantResponse.model_validate(plant).model_dump(), message="Plant created successfully", status_code=201)

@router.put("/{plant_id}", response_model=APIResponse)
async def update_plant(plant_id: UUID, plant_in: PlantUpdate, db: AsyncSession = Depends(get_db)):
    service = PlantService(db)
    plant = await service.update_plant(plant_id, plant_in)
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    return APIResponse(data=PlantResponse.model_validate(plant).model_dump(), message="Plant updated successfully")

@router.delete("/{plant_id}", response_model=APIResponse)
async def delete_plant(plant_id: UUID, db: AsyncSession = Depends(get_db)):
    service = PlantService(db)
    success = await service.delete_plant(plant_id)
    if not success:
        raise HTTPException(status_code=404, detail="Plant not found")
    return APIResponse(data=None, message="Plant deleted successfully")
""",
    "app/enterprise/areas/models.py": """from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.shared.mixins.base_model import Base
from app.shared.mixins import UUIDModelMixin, TimestampMixin

class Area(Base, UUIDModelMixin, TimestampMixin):
    __tablename__ = "areas"
    
    name: Mapped[str] = mapped_column(String, nullable=False)
    code: Mapped[str] = mapped_column(String, nullable=False)
    plant_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("plants.id"), nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
""",
    "app/enterprise/areas/schemas.py": """from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime

class AreaCreate(BaseModel):
    name: str
    code: str
    plant_id: UUID
    description: Optional[str] = None

class AreaUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class AreaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    name: str
    code: str
    plant_id: UUID
    description: Optional[str]
    is_active: bool
    created_at: datetime
""",
    "app/enterprise/areas/service.py": """from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, List
from uuid import UUID
from .models import Area
from .schemas import AreaCreate, AreaUpdate

class AreaService:
    def __init__(self, db: AsyncSession):
        self.db = db
        
    async def get_by_id(self, area_id: UUID) -> Optional[Area]:
        result = await self.db.execute(select(Area).filter(Area.id == area_id))
        return result.scalars().first()
        
    async def list_areas(self, plant_id: Optional[UUID] = None, skip: int = 0, limit: int = 10) -> List[Area]:
        query = select(Area)
        if plant_id:
            query = query.filter(Area.plant_id == plant_id)
        result = await self.db.execute(query.offset(skip).limit(limit))
        return result.scalars().all()
        
    async def create_area(self, area_in: AreaCreate) -> Area:
        db_area = Area(**area_in.model_dump())
        self.db.add(db_area)
        await self.db.commit()
        await self.db.refresh(db_area)
        return db_area
        
    async def update_area(self, area_id: UUID, area_in: AreaUpdate) -> Optional[Area]:
        db_area = await self.get_by_id(area_id)
        if not db_area:
            return None
            
        update_data = area_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_area, field, value)
            
        await self.db.commit()
        await self.db.refresh(db_area)
        return db_area
        
    async def delete_area(self, area_id: UUID) -> bool:
        db_area = await self.get_by_id(area_id)
        if not db_area:
            return False
            
        await self.db.delete(db_area)
        await self.db.commit()
        return True
""",
    "app/enterprise/areas/router.py": """from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.shared.pagination import PaginationParams
from .schemas import AreaCreate, AreaUpdate, AreaResponse
from .service import AreaService

router = APIRouter(prefix="/areas", tags=["Areas"])

@router.get("", response_model=APIResponse)
async def list_areas(plant_id: Optional[UUID] = None, pagination: PaginationParams = Depends(), db: AsyncSession = Depends(get_db)):
    service = AreaService(db)
    areas = await service.list_areas(plant_id=plant_id, skip=pagination.skip, limit=pagination.limit)
    return APIResponse(data=[AreaResponse.model_validate(a).model_dump() for a in areas], message="Areas retrieved successfully")

@router.get("/{area_id}", response_model=APIResponse)
async def get_area(area_id: UUID, db: AsyncSession = Depends(get_db)):
    service = AreaService(db)
    area = await service.get_by_id(area_id)
    if not area:
        raise HTTPException(status_code=404, detail="Area not found")
    return APIResponse(data=AreaResponse.model_validate(area).model_dump(), message="Area retrieved successfully")

@router.post("", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_area(area_in: AreaCreate, db: AsyncSession = Depends(get_db)):
    service = AreaService(db)
    area = await service.create_area(area_in)
    return APIResponse(data=AreaResponse.model_validate(area).model_dump(), message="Area created successfully", status_code=201)

@router.put("/{area_id}", response_model=APIResponse)
async def update_area(area_id: UUID, area_in: AreaUpdate, db: AsyncSession = Depends(get_db)):
    service = AreaService(db)
    area = await service.update_area(area_id, area_in)
    if not area:
        raise HTTPException(status_code=404, detail="Area not found")
    return APIResponse(data=AreaResponse.model_validate(area).model_dump(), message="Area updated successfully")

@router.delete("/{area_id}", response_model=APIResponse)
async def delete_area(area_id: UUID, db: AsyncSession = Depends(get_db)):
    service = AreaService(db)
    success = await service.delete_area(area_id)
    if not success:
        raise HTTPException(status_code=404, detail="Area not found")
    return APIResponse(data=None, message="Area deleted successfully")
""",
    "app/enterprise/production_lines/models.py": """from sqlalchemy import Column, String, Boolean, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.shared.mixins.base_model import Base
from app.shared.mixins import UUIDModelMixin, TimestampMixin

class ProductionLine(Base, UUIDModelMixin, TimestampMixin):
    __tablename__ = "production_lines"
    
    name: Mapped[str] = mapped_column(String, nullable=False)
    code: Mapped[str] = mapped_column(String, nullable=False)
    area_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("areas.id"), nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=True)
    capacity: Mapped[float] = mapped_column(Float, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
""",
    "app/enterprise/production_lines/schemas.py": """from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime

class ProductionLineCreate(BaseModel):
    name: str
    code: str
    area_id: UUID
    description: Optional[str] = None
    capacity: Optional[float] = None

class ProductionLineUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    capacity: Optional[float] = None
    is_active: Optional[bool] = None

class ProductionLineResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    name: str
    code: str
    area_id: UUID
    description: Optional[str]
    capacity: Optional[float]
    is_active: bool
    created_at: datetime
""",
    "app/enterprise/production_lines/service.py": """from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, List
from uuid import UUID
from .models import ProductionLine
from .schemas import ProductionLineCreate, ProductionLineUpdate

class ProductionLineService:
    def __init__(self, db: AsyncSession):
        self.db = db
        
    async def get_by_id(self, line_id: UUID) -> Optional[ProductionLine]:
        result = await self.db.execute(select(ProductionLine).filter(ProductionLine.id == line_id))
        return result.scalars().first()
        
    async def list_lines(self, area_id: Optional[UUID] = None, skip: int = 0, limit: int = 10) -> List[ProductionLine]:
        query = select(ProductionLine)
        if area_id:
            query = query.filter(ProductionLine.area_id == area_id)
        result = await self.db.execute(query.offset(skip).limit(limit))
        return result.scalars().all()
        
    async def create_line(self, line_in: ProductionLineCreate) -> ProductionLine:
        db_line = ProductionLine(**line_in.model_dump())
        self.db.add(db_line)
        await self.db.commit()
        await self.db.refresh(db_line)
        return db_line
        
    async def update_line(self, line_id: UUID, line_in: ProductionLineUpdate) -> Optional[ProductionLine]:
        db_line = await self.get_by_id(line_id)
        if not db_line:
            return None
            
        update_data = line_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_line, field, value)
            
        await self.db.commit()
        await self.db.refresh(db_line)
        return db_line
        
    async def delete_line(self, line_id: UUID) -> bool:
        db_line = await self.get_by_id(line_id)
        if not db_line:
            return False
            
        await self.db.delete(db_line)
        await self.db.commit()
        return True
""",
    "app/enterprise/production_lines/router.py": """from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.shared.pagination import PaginationParams
from .schemas import ProductionLineCreate, ProductionLineUpdate, ProductionLineResponse
from .service import ProductionLineService

router = APIRouter(prefix="/production-lines", tags=["Production Lines"])

@router.get("", response_model=APIResponse)
async def list_lines(area_id: Optional[UUID] = None, pagination: PaginationParams = Depends(), db: AsyncSession = Depends(get_db)):
    service = ProductionLineService(db)
    lines = await service.list_lines(area_id=area_id, skip=pagination.skip, limit=pagination.limit)
    return APIResponse(data=[ProductionLineResponse.model_validate(l).model_dump() for l in lines], message="Production Lines retrieved successfully")

@router.get("/{line_id}", response_model=APIResponse)
async def get_line(line_id: UUID, db: AsyncSession = Depends(get_db)):
    service = ProductionLineService(db)
    line = await service.get_by_id(line_id)
    if not line:
        raise HTTPException(status_code=404, detail="Production Line not found")
    return APIResponse(data=ProductionLineResponse.model_validate(line).model_dump(), message="Production Line retrieved successfully")

@router.post("", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_line(line_in: ProductionLineCreate, db: AsyncSession = Depends(get_db)):
    service = ProductionLineService(db)
    line = await service.create_line(line_in)
    return APIResponse(data=ProductionLineResponse.model_validate(line).model_dump(), message="Production Line created successfully", status_code=201)

@router.put("/{line_id}", response_model=APIResponse)
async def update_line(line_id: UUID, line_in: ProductionLineUpdate, db: AsyncSession = Depends(get_db)):
    service = ProductionLineService(db)
    line = await service.update_line(line_id, line_in)
    if not line:
        raise HTTPException(status_code=404, detail="Production Line not found")
    return APIResponse(data=ProductionLineResponse.model_validate(line).model_dump(), message="Production Line updated successfully")

@router.delete("/{line_id}", response_model=APIResponse)
async def delete_line(line_id: UUID, db: AsyncSession = Depends(get_db)):
    service = ProductionLineService(db)
    success = await service.delete_line(line_id)
    if not success:
        raise HTTPException(status_code=404, detail="Production Line not found")
    return APIResponse(data=None, message="Production Line deleted successfully")
""",
    "app/enterprise/hierarchy/router.py": """from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.enterprise.organizations.models import Organization
from app.enterprise.plants.models import Plant
from app.enterprise.areas.models import Area
from app.enterprise.production_lines.models import ProductionLine

router = APIRouter(prefix="/hierarchy", tags=["Hierarchy"])

@router.get("/tree/{org_id}", response_model=APIResponse)
async def get_hierarchy_tree(org_id: UUID, db: AsyncSession = Depends(get_db)):
    org_res = await db.execute(select(Organization).filter(Organization.id == org_id, Organization.is_deleted == False))
    org = org_res.scalars().first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    plants_res = await db.execute(select(Plant).filter(Plant.organization_id == org_id, Plant.is_deleted == False))
    plants = plants_res.scalars().all()
    
    plant_ids = [p.id for p in plants]
    
    areas = []
    lines = []
    
    if plant_ids:
        areas_res = await db.execute(select(Area).filter(Area.plant_id.in_(plant_ids)))
        areas = areas_res.scalars().all()
        
        area_ids = [a.id for a in areas]
        if area_ids:
            lines_res = await db.execute(select(ProductionLine).filter(ProductionLine.area_id.in_(area_ids)))
            lines = lines_res.scalars().all()
            
    tree = {
        "id": str(org.id),
        "name": org.name,
        "type": "organization",
        "children": []
    }
    
    for plant in plants:
        plant_node = {
            "id": str(plant.id),
            "name": plant.name,
            "type": "plant",
            "children": []
        }
        
        plant_areas = [a for a in areas if a.plant_id == plant.id]
        for area in plant_areas:
            area_node = {
                "id": str(area.id),
                "name": area.name,
                "type": "area",
                "children": []
            }
            
            area_lines = [l for l in lines if l.area_id == area.id]
            for line in area_lines:
                line_node = {
                    "id": str(line.id),
                    "name": line.name,
                    "type": "production_line"
                }
                area_node["children"].append(line_node)
                
            plant_node["children"].append(area_node)
            
        tree["children"].append(plant_node)
        
    return APIResponse(data=tree, message="Hierarchy tree retrieved successfully")
""",
    "app/enterprise/router.py": """from fastapi import APIRouter
from .organizations.router import router as organizations_router
from .plants.router import router as plants_router
from .areas.router import router as areas_router
from .production_lines.router import router as production_lines_router
from .hierarchy.router import router as hierarchy_router

router = APIRouter(prefix="/enterprise")

router.include_router(organizations_router)
router.include_router(plants_router)
router.include_router(areas_router)
router.include_router(production_lines_router)
router.include_router(hierarchy_router)
"""
}

for path, content in files.items():
    full_path = os.path.join(base_dir, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content)

print("Modules generated successfully.")
