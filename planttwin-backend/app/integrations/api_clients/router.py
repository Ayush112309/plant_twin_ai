from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.shared.pagination import PaginationParams, PaginatedResponse
from .schemas import ApiClientCreate, ApiClientUpdate, ApiClientResponse
from .service import ApiClientService

router = APIRouter(prefix="/api-clients", tags=["API Clients"])

@router.post("/", response_model=APIResponse[ApiClientResponse])
async def create(data: ApiClientCreate, db: AsyncSession = Depends(get_db)):
    obj = await ApiClientService.create(db, data)
    return APIResponse(data=obj, message="API Client created")

@router.get("/{id}", response_model=APIResponse[ApiClientResponse])
async def get(id: UUID, db: AsyncSession = Depends(get_db)):
    obj = await ApiClientService.get(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="API Client not found")
    return APIResponse(data=obj)

@router.get("/", response_model=APIResponse[PaginatedResponse[ApiClientResponse]])
async def list_clients(params: PaginationParams = Depends(), db: AsyncSession = Depends(get_db)):
    return APIResponse(data=await ApiClientService.list_clients(db, params))

@router.put("/{id}", response_model=APIResponse[ApiClientResponse])
async def update(id: UUID, data: ApiClientUpdate, db: AsyncSession = Depends(get_db)):
    obj = await ApiClientService.update(db, id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="API Client not found")
    return APIResponse(data=obj, message="API Client updated")

@router.delete("/{id}", response_model=APIResponse[bool])
async def delete(id: UUID, db: AsyncSession = Depends(get_db)):
    success = await ApiClientService.delete(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="API Client not found")
    return APIResponse(data=True, message="API Client deleted")

@router.post("/{id}/test-connection", response_model=APIResponse[bool])
async def test_connection(id: UUID, db: AsyncSession = Depends(get_db)):
    success = await ApiClientService.test_connection(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="API Client not found or connection failed")
    return APIResponse(data=True, message="Connection successful")

@router.post("/{id}/sync", response_model=APIResponse[bool])
async def sync(id: UUID, db: AsyncSession = Depends(get_db)):
    success = await ApiClientService.sync(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="API Client not found")
    return APIResponse(data=True, message="Sync triggered")
