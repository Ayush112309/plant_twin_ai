from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID, uuid4
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.shared.pagination import PaginationParams
from .schemas import APIKeyCreate, APIKeyResponse
from .service import APIKeyService

router = APIRouter(prefix="/api-keys", tags=["API Keys"])

# Dummy current user ID for placeholder logic
# In reality, this would come from a current_user dependency
def get_current_user_id() -> UUID:
    return uuid4()

@router.post("", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_api_key(key_in: APIKeyCreate, db: AsyncSession = Depends(get_db)):
    service = APIKeyService(db)
    user_id = get_current_user_id() # Placeholder
    db_key, raw_key = await service.create_key(user_id, key_in)
    
    response_data = APIKeyResponse.model_validate(db_key).model_dump()
    response_data["plaintext_key"] = raw_key
    
    return APIResponse(data=response_data, message="API Key created successfully", status_code=201)

@router.get("", response_model=APIResponse)
async def list_api_keys(pagination: PaginationParams = Depends(), db: AsyncSession = Depends(get_db)):
    service = APIKeyService(db)
    user_id = get_current_user_id() # Placeholder
    keys = await service.list_by_user(user_id, skip=pagination.skip, limit=pagination.limit)
    return APIResponse(data=[APIKeyResponse.model_validate(key).model_dump() for key in keys], message="API Keys retrieved successfully")

@router.delete("/{key_id}", response_model=APIResponse)
async def delete_api_key(key_id: UUID, db: AsyncSession = Depends(get_db)):
    service = APIKeyService(db)
    user_id = get_current_user_id() # Placeholder
    success = await service.revoke_key(key_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="API Key not found or not owned by user")
    return APIResponse(data=None, message="API Key revoked successfully")
