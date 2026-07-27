from sqlalchemy.ext.asyncio import AsyncSession
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
