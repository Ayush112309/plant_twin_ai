from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.shared.pagination import PaginationParams, PaginatedResponse
from .schemas import UserCreate, UserUpdate, UserResponse
from .service import UserService

router = APIRouter(prefix="/users", tags=["Users"])

from app.identity.authentication.dependencies import get_current_org_id, require_manager, require_admin

@router.get("", response_model=APIResponse, dependencies=[Depends(require_manager)])
async def list_users(
    pagination: PaginationParams = Depends(), 
    org_id: UUID = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db)
):
    try:
        service = UserService(db)
        users = await service.list_users(skip=pagination.offset, limit=pagination.page_size, org_id=org_id)
        return APIResponse(data=[UserResponse.model_validate(user).model_dump() for user in users], message="Users retrieved successfully")
    except Exception as e:
        import traceback
        with open("debug.txt", "w") as f:
            traceback.print_exc(file=f)
        raise

@router.get("/{user_id}", response_model=APIResponse, dependencies=[Depends(require_manager)])
async def get_user(user_id: UUID, db: AsyncSession = Depends(get_db)):
    service = UserService(db)
    user = await service.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return APIResponse(data=UserResponse.model_validate(user).model_dump(), message="User retrieved successfully")

@router.post("", response_model=APIResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
async def create_user(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    service = UserService(db)
    user = await service.create_user(user_in)
    return APIResponse(data=UserResponse.model_validate(user).model_dump(), message="User created successfully", status_code=201)

@router.put("/{user_id}", response_model=APIResponse, dependencies=[Depends(require_admin)])
async def update_user(user_id: UUID, user_in: UserUpdate, db: AsyncSession = Depends(get_db)):
    service = UserService(db)
    user = await service.update_user(user_id, user_in)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return APIResponse(data=UserResponse.model_validate(user).model_dump(), message="User updated successfully")

@router.delete("/{user_id}", response_model=APIResponse, dependencies=[Depends(require_admin)])
async def delete_user(user_id: UUID, db: AsyncSession = Depends(get_db)):
    service = UserService(db)
    success = await service.delete_user(user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return APIResponse(data=None, message="User deleted successfully")
