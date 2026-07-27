from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Dict, Any
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.shared.pagination import PaginationParams, PaginatedResponse
from .schemas import LicenseCreate, LicenseUpdate, LicenseResponse
from .service import LicenseService

router = APIRouter(prefix="/licenses", tags=["Licensing"])

@router.post("/", response_model=APIResponse[LicenseResponse])
async def create(data: LicenseCreate, db: AsyncSession = Depends(get_db)):
    obj = await LicenseService.create(db, data)
    return APIResponse(data=obj, message="License created")

@router.get("/{id}", response_model=APIResponse[LicenseResponse])
async def get(id: UUID, db: AsyncSession = Depends(get_db)):
    obj = await LicenseService.get(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="License not found")
    return APIResponse(data=obj)

@router.get("/", response_model=APIResponse[PaginatedResponse[LicenseResponse]])
async def list_licenses(params: PaginationParams = Depends(), db: AsyncSession = Depends(get_db)):
    return APIResponse(data=await LicenseService.list_licenses(db, params))

@router.put("/{id}", response_model=APIResponse[LicenseResponse])
async def update(id: UUID, data: LicenseUpdate, db: AsyncSession = Depends(get_db)):
    obj = await LicenseService.update(db, id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="License not found")
    return APIResponse(data=obj, message="License updated")

@router.delete("/{id}", response_model=APIResponse[bool])
async def delete(id: UUID, db: AsyncSession = Depends(get_db)):
    success = await LicenseService.delete(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="License not found")
    return APIResponse(data=True, message="License deleted")

@router.post("/validate/{license_key}", response_model=APIResponse[bool])
async def validate(license_key: str, db: AsyncSession = Depends(get_db)):
    is_valid = await LicenseService.validate_license(db, license_key)
    return APIResponse(data=is_valid)

@router.get("/limits/{tenant_id}", response_model=APIResponse[Dict[str, Any]])
async def check_limits(tenant_id: UUID, db: AsyncSession = Depends(get_db)):
    limits = await LicenseService.check_limits(db, tenant_id)
    return APIResponse(data=limits)
