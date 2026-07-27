from fastapi import APIRouter, Depends, HTTPException, status
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
