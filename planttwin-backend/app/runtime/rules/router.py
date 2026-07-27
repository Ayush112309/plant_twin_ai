from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List, Dict, Any
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from .schemas import RuleCreate, RuleUpdate, RuleResponse, RuleEvaluationResult
from .service import RuleEngineService

router = APIRouter(prefix="/rules", tags=["Runtime - Rules Engine"])
service = RuleEngineService()

@router.post("", response_model=APIResponse[RuleResponse])
async def create_rule(request: RuleCreate, db: AsyncSession = Depends(get_db)):
    result = await service.create_rule(db, request)
    return APIResponse(data=RuleResponse.model_validate(result))

@router.get("", response_model=APIResponse[List[RuleResponse]])
async def list_rules(db: AsyncSession = Depends(get_db)):
    results = await service.list_rules(db)
    return APIResponse(data=[RuleResponse.model_validate(r) for r in results])

@router.get("/{id}", response_model=APIResponse[RuleResponse])
async def get_rule(id: UUID, db: AsyncSession = Depends(get_db)):
    result = await service.get_rule(db, id)
    if not result:
        raise HTTPException(status_code=404, detail="Rule not found")
    return APIResponse(data=RuleResponse.model_validate(result))

@router.put("/{id}", response_model=APIResponse[RuleResponse])
async def update_rule(id: UUID, request: RuleUpdate, db: AsyncSession = Depends(get_db)):
    result = await service.update_rule(db, id, request)
    if not result:
        raise HTTPException(status_code=404, detail="Rule not found")
    return APIResponse(data=RuleResponse.model_validate(result))

@router.post("/{id}/evaluate", response_model=APIResponse[RuleEvaluationResult])
async def evaluate_rule(id: UUID, context_data: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    result = await service.evaluate_rule(db, id, context_data)
    if not result:
        raise HTTPException(status_code=404, detail="Rule not found or inactive")
    return APIResponse(data=result)

@router.post("/{id}/toggle", response_model=APIResponse[RuleResponse])
async def toggle_rule(id: UUID, db: AsyncSession = Depends(get_db)):
    rule = await service.get_rule(db, id)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    result = await service.update_rule(db, id, RuleUpdate(is_enabled=not rule.is_enabled))
    return APIResponse(data=RuleResponse.model_validate(result))
