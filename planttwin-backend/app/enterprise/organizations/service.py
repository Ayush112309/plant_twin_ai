from sqlalchemy.ext.asyncio import AsyncSession
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
