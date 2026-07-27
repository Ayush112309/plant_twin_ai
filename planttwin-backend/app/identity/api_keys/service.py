from sqlalchemy.ext.asyncio import AsyncSession
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
