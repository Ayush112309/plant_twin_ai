from uuid import UUID
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from .models import License
from .schemas import LicenseCreate, LicenseUpdate
from app.shared.pagination import PaginationParams, PaginatedResponse
from datetime import datetime

class LicenseService:
    @staticmethod
    async def create(db: AsyncSession, data: LicenseCreate) -> License:
        dump = data.model_dump()
        dump["tenant_id"] = str(dump["tenant_id"])
        if not dump.get("issued_at"):
            dump["issued_at"] = datetime.utcnow()
        obj = License(**dump)
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def get(db: AsyncSession, id: UUID) -> Optional[License]:
        result = await db.execute(select(License).where(License.id == str(id)))
        return result.scalars().first()

    @staticmethod
    async def list_licenses(db: AsyncSession, params: PaginationParams) :
        query = select(License)
        total = await db.scalar(select(func.count()).select_from(query.subquery()))
        
        query = query.offset(params.offset).limit(params.page_size)
        result = await db.execute(query)
        
        return PaginatedResponse(
            items=result.scalars().all(),
            total=total or 0, page=params.page, size=params.page_size,
            pages=(total + params.page_size - 1) // params.page_size if total else 0
        )

    @staticmethod
    async def update(db: AsyncSession, id: UUID, data: LicenseUpdate) -> Optional[License]:
        obj = await LicenseService.get(db, id)
        if not obj:
            return None
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(obj, k, v)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def delete(db: AsyncSession, id: UUID) -> bool:
        obj = await LicenseService.get(db, id)
        if not obj:
            return False
        await db.delete(obj)
        await db.commit()
        return True

    @staticmethod
    async def validate_license(db: AsyncSession, license_key: str) -> bool:
        result = await db.execute(select(License).where(License.license_key == license_key))
        obj = result.scalars().first()
        if not obj or not obj.is_active:
            return False
        if obj.expires_at and obj.expires_at < datetime.utcnow():
            return False
        return True

    @staticmethod
    async def check_limits(db: AsyncSession, tenant_id: UUID) -> Dict[str, Any]:
        result = await db.execute(select(License).where(License.tenant_id == str(tenant_id), License.is_active == True))
        obj = result.scalars().first()
        if not obj:
            return {}
        return {
            "max_assets": obj.max_assets,
            "max_connections": obj.max_connections,
            "features": obj.features
        }
