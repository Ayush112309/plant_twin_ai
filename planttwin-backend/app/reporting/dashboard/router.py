from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.shared.pagination import PaginationParams, PaginatedResponse
from .schemas import DashboardCreate, DashboardUpdate, DashboardResponse
from .service import DashboardService

router = APIRouter(prefix="/dashboards", tags=["Dashboards"])

@router.post("/", response_model=APIResponse[DashboardResponse])
async def create(data: DashboardCreate, db: AsyncSession = Depends(get_db)):
    obj = await DashboardService.create(db, data)
    return APIResponse(data=obj, message="Dashboard created")

@router.get("/{id}", response_model=APIResponse[DashboardResponse])
async def get(id: UUID, db: AsyncSession = Depends(get_db)):
    obj = await DashboardService.get(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    return APIResponse(data=obj)

@router.get("/", response_model=APIResponse[PaginatedResponse[DashboardResponse]])
async def list_dashboards(params: PaginationParams = Depends(), db: AsyncSession = Depends(get_db)):
    return APIResponse(data=await DashboardService.list_dashboards(db, params))

@router.put("/{id}", response_model=APIResponse[DashboardResponse])
async def update(id: UUID, data: DashboardUpdate, db: AsyncSession = Depends(get_db)):
    obj = await DashboardService.update(db, id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    return APIResponse(data=obj, message="Dashboard updated")

@router.delete("/{id}", response_model=APIResponse[bool])
async def delete(id: UUID, db: AsyncSession = Depends(get_db)):
    success = await DashboardService.delete(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    return APIResponse(data=True, message="Dashboard deleted")

@router.post("/{id}/clone", response_model=APIResponse[DashboardResponse])
async def clone(id: UUID, db: AsyncSession = Depends(get_db)):
    obj = await DashboardService.clone_dashboard(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    return APIResponse(data=obj, message="Dashboard cloned")
