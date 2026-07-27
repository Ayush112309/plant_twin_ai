from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List, Optional
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from .schemas import ModelCreate, ModelUpdate, ModelResponse
from .service import ModelRegistryService

router = APIRouter(prefix="/models", tags=["AI - Model Registry"])
service = ModelRegistryService()

@router.post("", response_model=APIResponse[ModelResponse])
async def register_model(request: ModelCreate, db: AsyncSession = Depends(get_db)):
    result = await service.register_model(db, request)
    return APIResponse(data=ModelResponse.model_validate(result))

@router.get("", response_model=APIResponse[List[ModelResponse]])
async def list_models(model_type: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    results = await service.list_models(db, model_type)
    return APIResponse(data=[ModelResponse.model_validate(r) for r in results])

@router.get("/{id}", response_model=APIResponse[ModelResponse])
async def get_model(id: UUID, db: AsyncSession = Depends(get_db)):
    result = await service.get_model(db, id)
    if not result:
        raise HTTPException(status_code=404, detail="Model not found")
    return APIResponse(data=ModelResponse.model_validate(result))

@router.put("/{id}", response_model=APIResponse[ModelResponse])
async def update_model(id: UUID, request: ModelUpdate, db: AsyncSession = Depends(get_db)):
    result = await service.update_model(db, id, request)
    if not result:
        raise HTTPException(status_code=404, detail="Model not found")
    return APIResponse(data=ModelResponse.model_validate(result))

@router.post("/{id}/promote", response_model=APIResponse[ModelResponse])
async def promote_model(id: UUID, new_status: str = Query(...), db: AsyncSession = Depends(get_db)):
    result = await service.promote_model(db, id, new_status)
    if not result:
        raise HTTPException(status_code=404, detail="Model not found")
    return APIResponse(data=ModelResponse.model_validate(result))

@router.get("/production/{model_type}", response_model=APIResponse[ModelResponse])
async def get_production_model(model_type: str, db: AsyncSession = Depends(get_db)):
    result = await service.get_production_model(db, model_type)
    if not result:
        raise HTTPException(status_code=404, detail="Production model not found for this type")
    return APIResponse(data=ModelResponse.model_validate(result))
