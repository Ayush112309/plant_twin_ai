from sqlalchemy.ext.asyncio import AsyncSession
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
        
    async def list_users(self, skip: int = 0, limit: int = 10, org_id: Optional[UUID] = None) -> List[User]:
        query = select(User).filter(User.is_deleted == False)
        if org_id:
            query = query.filter(User.organization_id == org_id)
        result = await self.db.execute(query.offset(skip).limit(limit))
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
