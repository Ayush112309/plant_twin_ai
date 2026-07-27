from uuid import UUID
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime
from .models import Report
from .schemas import ReportCreate, ReportUpdate, ReportGenerateRequest
from app.shared.pagination import PaginationParams, PaginatedResponse

class ReportService:
    @staticmethod
    async def create_report(db: AsyncSession, data: ReportCreate, user_id: Optional[UUID] = None) -> Report:
        report = Report(**data.model_dump(), generated_by=str(user_id) if user_id else None)
        db.add(report)
        await db.commit()
        await db.refresh(report)
        return report

    @staticmethod
    async def generate_report(db: AsyncSession, request: ReportGenerateRequest, user_id: Optional[UUID] = None) -> Report:
        # Mock logic
        report = Report(
            name=f"Generated {request.report_type} Report",
            report_type=request.report_type,
            config=request.config,
            format=request.format,
            status="completed",
            file_path="/mock/path/to/report.pdf",
            generated_by=str(user_id) if user_id else None,
            generated_at=datetime.utcnow(),
            file_size=1024 * 5
        )
        db.add(report)
        await db.commit()
        await db.refresh(report)
        return report

    @staticmethod
    async def get_report(db: AsyncSession, report_id: UUID) -> Optional[Report]:
        result = await db.execute(select(Report).where(Report.id == str(report_id)))
        return result.scalars().first()

    @staticmethod
    async def list_reports(db: AsyncSession, params: PaginationParams):
        query = select(Report)
        total = await db.scalar(select(func.count()).select_from(query.subquery()))
        
        query = query.offset(params.offset).limit(params.page_size)
        result = await db.execute(query)
        items = list(result.scalars().all())
        
        return PaginatedResponse.create(
            items=items,
            total=total or 0,
            params=params
        )

    @staticmethod
    async def delete_report(db: AsyncSession, report_id: UUID) -> bool:
        report = await ReportService.get_report(db, report_id)
        if not report:
            return False
        await db.delete(report)
        await db.commit()
        return True
