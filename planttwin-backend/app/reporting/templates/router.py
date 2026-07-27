from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.shared.pagination import PaginationParams, PaginatedResponse
from .schemas import ReportTemplateCreate, ReportTemplateUpdate, ReportTemplateResponse
from .service import ReportTemplateService

router = APIRouter(prefix="/report-templates", tags=["Report Templates"])

@router.post("/", response_model=APIResponse[ReportTemplateResponse])
async def create(data: ReportTemplateCreate, db: AsyncSession = Depends(get_db)):
    obj = await ReportTemplateService.create(db, data)
    return APIResponse(data=obj, message="Template created")

@router.get("/{id}", response_model=APIResponse[ReportTemplateResponse])
async def get(id: UUID, db: AsyncSession = Depends(get_db)):
    obj = await ReportTemplateService.get(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Template not found")
    return APIResponse(data=obj)

@router.get("/", response_model=APIResponse[PaginatedResponse[ReportTemplateResponse]])
async def list_templates(params: PaginationParams = Depends(), db: AsyncSession = Depends(get_db)):
    return APIResponse(data=await ReportTemplateService.list_templates(db, params))

@router.put("/{id}", response_model=APIResponse[ReportTemplateResponse])
async def update(id: UUID, data: ReportTemplateUpdate, db: AsyncSession = Depends(get_db)):
    obj = await ReportTemplateService.update(db, id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Template not found")
    return APIResponse(data=obj, message="Template updated")

@router.delete("/{id}", response_model=APIResponse[bool])
async def delete(id: UUID, db: AsyncSession = Depends(get_db)):
    success = await ReportTemplateService.delete(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Template not found")
    return APIResponse(data=True, message="Template deleted")
