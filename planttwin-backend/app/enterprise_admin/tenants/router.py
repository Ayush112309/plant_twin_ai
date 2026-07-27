from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.shared.pagination import PaginationParams, PaginatedResponse
from .schemas import TenantCreate, TenantUpdate, TenantResponse
from .service import TenantService

router = APIRouter(prefix="/tenants", tags=["Tenants"])

@router.post("/", response_model=APIResponse[TenantResponse])
async def create(data: TenantCreate, db: AsyncSession = Depends(get_db)):
    obj = await TenantService.create(db, data)
    return APIResponse(data=obj, message="Tenant created")

@router.get("/{id}", response_model=APIResponse[TenantResponse])
async def get(id: UUID, db: AsyncSession = Depends(get_db)):
    obj = await TenantService.get(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return APIResponse(data=obj)

@router.get("/", response_model=APIResponse[PaginatedResponse[TenantResponse]])
async def list_tenants(params: PaginationParams = Depends(), db: AsyncSession = Depends(get_db)):
    return APIResponse(data=await TenantService.list_tenants(db, params))

@router.put("/{id}", response_model=APIResponse[TenantResponse])
async def update(id: UUID, data: TenantUpdate, db: AsyncSession = Depends(get_db)):
    obj = await TenantService.update(db, id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return APIResponse(data=obj, message="Tenant updated")

@router.delete("/{id}", response_model=APIResponse[bool])
async def delete(id: UUID, db: AsyncSession = Depends(get_db)):
    success = await TenantService.delete(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return APIResponse(data=True, message="Tenant deleted")

@router.post("/{id}/suspend", response_model=APIResponse[TenantResponse])
async def suspend(id: UUID, db: AsyncSession = Depends(get_db)):
    obj = await TenantService.set_status(db, id, "suspended")
    if not obj:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return APIResponse(data=obj, message="Tenant suspended")

@router.post("/{id}/activate", response_model=APIResponse[TenantResponse])
async def activate(id: UUID, db: AsyncSession = Depends(get_db)):
    obj = await TenantService.set_status(db, id, "active")
    if not obj:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return APIResponse(data=obj, message="Tenant activated")
