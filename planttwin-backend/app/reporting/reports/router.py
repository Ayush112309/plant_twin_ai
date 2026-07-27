from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.shared.pagination import PaginationParams, PaginatedResponse
from .schemas import ReportCreate, ReportResponse, ReportGenerateRequest
from .service import ReportService

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("/", response_model=APIResponse[ReportResponse])
async def create_report(data: ReportCreate, db: AsyncSession = Depends(get_db)):
    report = await ReportService.create_report(db, data)
    return APIResponse(data=report, message="Report created")

@router.post("/generate", response_model=APIResponse[ReportResponse])
async def generate_report(request: ReportGenerateRequest, db: AsyncSession = Depends(get_db)):
    report = await ReportService.generate_report(db, request)
    return APIResponse(data=report, message="Report generated successfully")

@router.get("/{report_id}", response_model=APIResponse[ReportResponse])
async def get_report(report_id: UUID, db: AsyncSession = Depends(get_db)):
    report = await ReportService.get_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return APIResponse(data=report)

@router.get("/", response_model=APIResponse[PaginatedResponse[ReportResponse]])
async def list_reports(params: PaginationParams = Depends(), db: AsyncSession = Depends(get_db)):
    paginated = await ReportService.list_reports(db, params)
    return APIResponse(data=paginated)

@router.delete("/{report_id}", response_model=APIResponse[bool])
async def delete_report(report_id: UUID, db: AsyncSession = Depends(get_db)):
    success = await ReportService.delete_report(db, report_id)
    if not success:
        raise HTTPException(status_code=404, detail="Report not found")
    return APIResponse(data=True, message="Report deleted")
