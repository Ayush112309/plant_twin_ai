import os

BASE_DIR = r"C:\Users\ayush\.gemini\antigravity\scratch\planttwin-backend\app"

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")

# ==========================================
# MODULE 1: REPORTING
# ==========================================
write_file(os.path.join(BASE_DIR, "reporting", "reports", "models.py"), """
from sqlalchemy import String, Text, Integer, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin
from app.shared.mixins.timestamp_mixin import TimestampMixin
from app.shared.mixins.soft_delete_mixin import SoftDeleteMixin

class Report(Base, UUIDModelMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "reports"

    name: Mapped[str] = mapped_column(String(255), index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    report_type: Mapped[str] = mapped_column(String(50)) # operational/maintenance/performance/compliance/custom
    template_id: Mapped[str | None] = mapped_column(ForeignKey("report_templates.id"), nullable=True)
    config: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    format: Mapped[str] = mapped_column(String(20)) # pdf/excel/csv
    status: Mapped[str] = mapped_column(String(50), default="pending") # pending/generating/completed/failed
    file_path: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    generated_by: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    generated_at: Mapped[datetime | None] = mapped_column(nullable=True)
    file_size: Mapped[int | None] = mapped_column(Integer, nullable=True)
""")

write_file(os.path.join(BASE_DIR, "reporting", "reports", "schemas.py"), """
from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from datetime import datetime
from typing import Optional, Dict, Any

class ReportBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    report_type: str = Field(..., max_length=50)
    template_id: Optional[UUID] = None
    config: Optional[Dict[str, Any]] = None
    format: str = Field(..., max_length=20)

class ReportCreate(ReportBase):
    pass

class ReportUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    generated_at: Optional[datetime] = None

class ReportGenerateRequest(BaseModel):
    report_type: str
    config: Dict[str, Any]
    format: str

class ReportResponse(ReportBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    status: str
    file_path: Optional[str] = None
    generated_by: Optional[UUID] = None
    generated_at: Optional[datetime] = None
    file_size: Optional[int] = None
    created_at: datetime
    updated_at: datetime
""")

write_file(os.path.join(BASE_DIR, "reporting", "reports", "service.py"), """
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
    async def list_reports(db: AsyncSession, params: PaginationParams) -> PaginatedResponse[Report]:
        query = select(Report)
        total = await db.scalar(select(func.count()).select_from(query.subquery()))
        
        query = query.offset((params.page - 1) * params.size).limit(params.size)
        result = await db.execute(query)
        items = result.scalars().all()
        
        return PaginatedResponse(
            items=items,
            total=total or 0,
            page=params.page,
            size=params.size,
            pages=(total + params.size - 1) // params.size if total else 0
        )

    @staticmethod
    async def delete_report(db: AsyncSession, report_id: UUID) -> bool:
        report = await ReportService.get_report(db, report_id)
        if not report:
            return False
        await db.delete(report)
        await db.commit()
        return True
""")

write_file(os.path.join(BASE_DIR, "reporting", "reports", "router.py"), """
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
""")

write_file(os.path.join(BASE_DIR, "reporting", "templates", "models.py"), """
from sqlalchemy import String, Text, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin
from app.shared.mixins.timestamp_mixin import TimestampMixin
from app.shared.mixins.soft_delete_mixin import SoftDeleteMixin

class ReportTemplate(Base, UUIDModelMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "report_templates"

    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    template_type: Mapped[str] = mapped_column(String(50))
    layout: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    default_config: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    is_system: Mapped[bool] = mapped_column(Boolean, default=False)
""")

write_file(os.path.join(BASE_DIR, "reporting", "templates", "schemas.py"), """
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional, Dict, Any
from datetime import datetime

class ReportTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    template_type: str
    layout: Optional[Dict[str, Any]] = None
    default_config: Optional[Dict[str, Any]] = None
    is_system: bool = False

class ReportTemplateCreate(ReportTemplateBase):
    pass

class ReportTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    layout: Optional[Dict[str, Any]] = None
    default_config: Optional[Dict[str, Any]] = None

class ReportTemplateResponse(ReportTemplateBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    created_at: datetime
    updated_at: datetime
""")

write_file(os.path.join(BASE_DIR, "reporting", "templates", "service.py"), """
from uuid import UUID
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from .models import ReportTemplate
from .schemas import ReportTemplateCreate, ReportTemplateUpdate
from app.shared.pagination import PaginationParams, PaginatedResponse

class ReportTemplateService:
    @staticmethod
    async def create(db: AsyncSession, data: ReportTemplateCreate) -> ReportTemplate:
        obj = ReportTemplate(**data.model_dump())
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def get(db: AsyncSession, id: UUID) -> Optional[ReportTemplate]:
        result = await db.execute(select(ReportTemplate).where(ReportTemplate.id == str(id)))
        return result.scalars().first()

    @staticmethod
    async def list_templates(db: AsyncSession, params: PaginationParams) -> PaginatedResponse[ReportTemplate]:
        query = select(ReportTemplate)
        total = await db.scalar(select(func.count()).select_from(query.subquery()))
        
        query = query.offset((params.page - 1) * params.size).limit(params.size)
        result = await db.execute(query)
        
        return PaginatedResponse(
            items=result.scalars().all(),
            total=total or 0, page=params.page, size=params.size,
            pages=(total + params.size - 1) // params.size if total else 0
        )

    @staticmethod
    async def update(db: AsyncSession, id: UUID, data: ReportTemplateUpdate) -> Optional[ReportTemplate]:
        obj = await ReportTemplateService.get(db, id)
        if not obj:
            return None
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(obj, k, v)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def delete(db: AsyncSession, id: UUID) -> bool:
        obj = await ReportTemplateService.get(db, id)
        if not obj:
            return False
        await db.delete(obj)
        await db.commit()
        return True
""")

write_file(os.path.join(BASE_DIR, "reporting", "templates", "router.py"), """
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
""")

write_file(os.path.join(BASE_DIR, "reporting", "dashboard", "models.py"), """
from sqlalchemy import String, Text, Boolean, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin
from app.shared.mixins.timestamp_mixin import TimestampMixin
from app.shared.mixins.soft_delete_mixin import SoftDeleteMixin

class Dashboard(Base, UUIDModelMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "dashboards"

    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    layout: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    widgets: Mapped[list | None] = mapped_column(JSON, nullable=True)
    owner_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    is_shared: Mapped[bool] = mapped_column(Boolean, default=False)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
""")

write_file(os.path.join(BASE_DIR, "reporting", "dashboard", "schemas.py"), """
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional, Dict, Any, List
from datetime import datetime

class DashboardBase(BaseModel):
    name: str
    description: Optional[str] = None
    layout: Optional[Dict[str, Any]] = None
    widgets: Optional[List[Dict[str, Any]]] = None
    is_shared: bool = False
    is_default: bool = False

class DashboardCreate(DashboardBase):
    pass

class DashboardUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    layout: Optional[Dict[str, Any]] = None
    widgets: Optional[List[Dict[str, Any]]] = None
    is_shared: Optional[bool] = None
    is_default: Optional[bool] = None

class DashboardResponse(DashboardBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    owner_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
""")

write_file(os.path.join(BASE_DIR, "reporting", "dashboard", "service.py"), """
from uuid import UUID
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from .models import Dashboard
from .schemas import DashboardCreate, DashboardUpdate
from app.shared.pagination import PaginationParams, PaginatedResponse

class DashboardService:
    @staticmethod
    async def create(db: AsyncSession, data: DashboardCreate, owner_id: Optional[UUID] = None) -> Dashboard:
        obj = Dashboard(**data.model_dump(), owner_id=str(owner_id) if owner_id else None)
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def get(db: AsyncSession, id: UUID) -> Optional[Dashboard]:
        result = await db.execute(select(Dashboard).where(Dashboard.id == str(id)))
        return result.scalars().first()

    @staticmethod
    async def list_dashboards(db: AsyncSession, params: PaginationParams) -> PaginatedResponse[Dashboard]:
        query = select(Dashboard)
        total = await db.scalar(select(func.count()).select_from(query.subquery()))
        
        query = query.offset((params.page - 1) * params.size).limit(params.size)
        result = await db.execute(query)
        
        return PaginatedResponse(
            items=result.scalars().all(),
            total=total or 0, page=params.page, size=params.size,
            pages=(total + params.size - 1) // params.size if total else 0
        )

    @staticmethod
    async def update(db: AsyncSession, id: UUID, data: DashboardUpdate) -> Optional[Dashboard]:
        obj = await DashboardService.get(db, id)
        if not obj:
            return None
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(obj, k, v)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def delete(db: AsyncSession, id: UUID) -> bool:
        obj = await DashboardService.get(db, id)
        if not obj:
            return False
        await db.delete(obj)
        await db.commit()
        return True
        
    @staticmethod
    async def clone_dashboard(db: AsyncSession, id: UUID, new_owner_id: Optional[UUID] = None) -> Optional[Dashboard]:
        obj = await DashboardService.get(db, id)
        if not obj:
            return None
        cloned = Dashboard(
            name=f"Copy of {obj.name}",
            description=obj.description,
            layout=obj.layout,
            widgets=obj.widgets,
            owner_id=str(new_owner_id) if new_owner_id else obj.owner_id,
            is_shared=False,
            is_default=False
        )
        db.add(cloned)
        await db.commit()
        await db.refresh(cloned)
        return cloned
""")

write_file(os.path.join(BASE_DIR, "reporting", "dashboard", "router.py"), """
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
""")

write_file(os.path.join(BASE_DIR, "reporting", "router.py"), """
from fastapi import APIRouter
from .reports.router import router as reports_router
from .templates.router import router as templates_router
from .dashboard.router import router as dashboard_router

router = APIRouter(prefix="/reporting")
router.include_router(reports_router)
router.include_router(templates_router)
router.include_router(dashboard_router)
""")

# ==========================================
# MODULE 2: NOTIFICATIONS
# ==========================================
write_file(os.path.join(BASE_DIR, "notifications", "channels", "models.py"), """
from sqlalchemy import String, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin
from app.shared.mixins.timestamp_mixin import TimestampMixin
from app.shared.mixins.soft_delete_mixin import SoftDeleteMixin

class NotificationChannel(Base, UUIDModelMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "notification_channels"

    channel_type: Mapped[str] = mapped_column(String(50))
    name: Mapped[str] = mapped_column(String(255))
    config: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
""")

write_file(os.path.join(BASE_DIR, "notifications", "channels", "schemas.py"), """
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional, Dict, Any
from datetime import datetime

class ChannelBase(BaseModel):
    channel_type: str
    name: str
    config: Optional[Dict[str, Any]] = None
    is_enabled: bool = True
    is_default: bool = False

class ChannelCreate(ChannelBase):
    pass

class ChannelUpdate(BaseModel):
    name: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    is_enabled: Optional[bool] = None
    is_default: Optional[bool] = None

class ChannelResponse(ChannelBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    created_at: datetime
    updated_at: datetime
""")

write_file(os.path.join(BASE_DIR, "notifications", "channels", "service.py"), """
from uuid import UUID
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from .models import NotificationChannel
from .schemas import ChannelCreate, ChannelUpdate
from app.shared.pagination import PaginationParams, PaginatedResponse

class NotificationChannelService:
    @staticmethod
    async def create(db: AsyncSession, data: ChannelCreate) -> NotificationChannel:
        obj = NotificationChannel(**data.model_dump())
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def get(db: AsyncSession, id: UUID) -> Optional[NotificationChannel]:
        result = await db.execute(select(NotificationChannel).where(NotificationChannel.id == str(id)))
        return result.scalars().first()

    @staticmethod
    async def list_channels(db: AsyncSession, params: PaginationParams) -> PaginatedResponse[NotificationChannel]:
        query = select(NotificationChannel)
        total = await db.scalar(select(func.count()).select_from(query.subquery()))
        
        query = query.offset((params.page - 1) * params.size).limit(params.size)
        result = await db.execute(query)
        
        return PaginatedResponse(
            items=result.scalars().all(),
            total=total or 0, page=params.page, size=params.size,
            pages=(total + params.size - 1) // params.size if total else 0
        )

    @staticmethod
    async def update(db: AsyncSession, id: UUID, data: ChannelUpdate) -> Optional[NotificationChannel]:
        obj = await NotificationChannelService.get(db, id)
        if not obj:
            return None
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(obj, k, v)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def delete(db: AsyncSession, id: UUID) -> bool:
        obj = await NotificationChannelService.get(db, id)
        if not obj:
            return False
        await db.delete(obj)
        await db.commit()
        return True

    @staticmethod
    async def test_channel(db: AsyncSession, id: UUID) -> bool:
        obj = await NotificationChannelService.get(db, id)
        if not obj:
            return False
        # Mock logic
        return True
""")

write_file(os.path.join(BASE_DIR, "notifications", "channels", "router.py"), """
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.shared.pagination import PaginationParams, PaginatedResponse
from .schemas import ChannelCreate, ChannelUpdate, ChannelResponse
from .service import NotificationChannelService

router = APIRouter(prefix="/notification-channels", tags=["Notification Channels"])

@router.post("/", response_model=APIResponse[ChannelResponse])
async def create(data: ChannelCreate, db: AsyncSession = Depends(get_db)):
    obj = await NotificationChannelService.create(db, data)
    return APIResponse(data=obj, message="Channel created")

@router.get("/{id}", response_model=APIResponse[ChannelResponse])
async def get(id: UUID, db: AsyncSession = Depends(get_db)):
    obj = await NotificationChannelService.get(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Channel not found")
    return APIResponse(data=obj)

@router.get("/", response_model=APIResponse[PaginatedResponse[ChannelResponse]])
async def list_channels(params: PaginationParams = Depends(), db: AsyncSession = Depends(get_db)):
    return APIResponse(data=await NotificationChannelService.list_channels(db, params))

@router.put("/{id}", response_model=APIResponse[ChannelResponse])
async def update(id: UUID, data: ChannelUpdate, db: AsyncSession = Depends(get_db)):
    obj = await NotificationChannelService.update(db, id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Channel not found")
    return APIResponse(data=obj, message="Channel updated")

@router.delete("/{id}", response_model=APIResponse[bool])
async def delete(id: UUID, db: AsyncSession = Depends(get_db)):
    success = await NotificationChannelService.delete(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Channel not found")
    return APIResponse(data=True, message="Channel deleted")

@router.post("/{id}/test", response_model=APIResponse[bool])
async def test_channel(id: UUID, db: AsyncSession = Depends(get_db)):
    success = await NotificationChannelService.test_channel(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Channel not found or test failed")
    return APIResponse(data=True, message="Channel tested successfully")
""")

write_file(os.path.join(BASE_DIR, "notifications", "templates", "models.py"), """
from sqlalchemy import String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin
from app.shared.mixins.timestamp_mixin import TimestampMixin
from app.shared.mixins.soft_delete_mixin import SoftDeleteMixin

class NotificationTemplate(Base, UUIDModelMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "notification_templates"

    name: Mapped[str] = mapped_column(String(255))
    event_type: Mapped[str] = mapped_column(String(100))
    subject_template: Mapped[str] = mapped_column(String(255))
    body_template: Mapped[str] = mapped_column(Text)
    channel_type: Mapped[str] = mapped_column(String(50))
    variables: Mapped[list | None] = mapped_column(JSON, nullable=True)
""")

write_file(os.path.join(BASE_DIR, "notifications", "templates", "schemas.py"), """
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional, List
from datetime import datetime

class TemplateBase(BaseModel):
    name: str
    event_type: str
    subject_template: str
    body_template: str
    channel_type: str
    variables: Optional[List[str]] = None

class TemplateCreate(TemplateBase):
    pass

class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    subject_template: Optional[str] = None
    body_template: Optional[str] = None
    variables: Optional[List[str]] = None

class TemplateResponse(TemplateBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    created_at: datetime
    updated_at: datetime
""")

write_file(os.path.join(BASE_DIR, "notifications", "templates", "service.py"), """
from uuid import UUID
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from .models import NotificationTemplate
from .schemas import TemplateCreate, TemplateUpdate
from app.shared.pagination import PaginationParams, PaginatedResponse

class NotificationTemplateService:
    @staticmethod
    async def create(db: AsyncSession, data: TemplateCreate) -> NotificationTemplate:
        obj = NotificationTemplate(**data.model_dump())
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def get(db: AsyncSession, id: UUID) -> Optional[NotificationTemplate]:
        result = await db.execute(select(NotificationTemplate).where(NotificationTemplate.id == str(id)))
        return result.scalars().first()

    @staticmethod
    async def list_templates(db: AsyncSession, params: PaginationParams) -> PaginatedResponse[NotificationTemplate]:
        query = select(NotificationTemplate)
        total = await db.scalar(select(func.count()).select_from(query.subquery()))
        
        query = query.offset((params.page - 1) * params.size).limit(params.size)
        result = await db.execute(query)
        
        return PaginatedResponse(
            items=result.scalars().all(),
            total=total or 0, page=params.page, size=params.size,
            pages=(total + params.size - 1) // params.size if total else 0
        )

    @staticmethod
    async def update(db: AsyncSession, id: UUID, data: TemplateUpdate) -> Optional[NotificationTemplate]:
        obj = await NotificationTemplateService.get(db, id)
        if not obj:
            return None
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(obj, k, v)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def delete(db: AsyncSession, id: UUID) -> bool:
        obj = await NotificationTemplateService.get(db, id)
        if not obj:
            return False
        await db.delete(obj)
        await db.commit()
        return True

    @staticmethod
    async def preview(db: AsyncSession, id: UUID, data: Dict[str, Any]) -> Optional[Dict[str, str]]:
        obj = await NotificationTemplateService.get(db, id)
        if not obj:
            return None
        return {
            "subject": obj.subject_template.format(**data) if "{" in obj.subject_template else obj.subject_template,
            "body": obj.body_template.format(**data) if "{" in obj.body_template else obj.body_template
        }
""")

write_file(os.path.join(BASE_DIR, "notifications", "templates", "router.py"), """
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Dict, Any
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.shared.pagination import PaginationParams, PaginatedResponse
from .schemas import TemplateCreate, TemplateUpdate, TemplateResponse
from .service import NotificationTemplateService

router = APIRouter(prefix="/notification-templates", tags=["Notification Templates"])

@router.post("/", response_model=APIResponse[TemplateResponse])
async def create(data: TemplateCreate, db: AsyncSession = Depends(get_db)):
    obj = await NotificationTemplateService.create(db, data)
    return APIResponse(data=obj, message="Template created")

@router.get("/{id}", response_model=APIResponse[TemplateResponse])
async def get(id: UUID, db: AsyncSession = Depends(get_db)):
    obj = await NotificationTemplateService.get(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Template not found")
    return APIResponse(data=obj)

@router.get("/", response_model=APIResponse[PaginatedResponse[TemplateResponse]])
async def list_templates(params: PaginationParams = Depends(), db: AsyncSession = Depends(get_db)):
    return APIResponse(data=await NotificationTemplateService.list_templates(db, params))

@router.put("/{id}", response_model=APIResponse[TemplateResponse])
async def update(id: UUID, data: TemplateUpdate, db: AsyncSession = Depends(get_db)):
    obj = await NotificationTemplateService.update(db, id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Template not found")
    return APIResponse(data=obj, message="Template updated")

@router.delete("/{id}", response_model=APIResponse[bool])
async def delete(id: UUID, db: AsyncSession = Depends(get_db)):
    success = await NotificationTemplateService.delete(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Template not found")
    return APIResponse(data=True, message="Template deleted")

@router.post("/{id}/preview", response_model=APIResponse[Dict[str, str]])
async def preview(id: UUID, data: Dict[str, Any] = Body(...), db: AsyncSession = Depends(get_db)):
    preview_data = await NotificationTemplateService.preview(db, id, data)
    if not preview_data:
        raise HTTPException(status_code=404, detail="Template not found")
    return APIResponse(data=preview_data)
""")

write_file(os.path.join(BASE_DIR, "notifications", "preferences", "models.py"), """
from sqlalchemy import String, Boolean, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin
from app.shared.mixins.timestamp_mixin import TimestampMixin

class NotificationPreference(Base, UUIDModelMixin, TimestampMixin):
    __tablename__ = "notification_preferences"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    event_type: Mapped[str] = mapped_column(String(100))
    channels: Mapped[list] = mapped_column(JSON)
    is_muted: Mapped[bool] = mapped_column(Boolean, default=False)
    quiet_hours_start: Mapped[str | None] = mapped_column(String(5), nullable=True)
    quiet_hours_end: Mapped[str | None] = mapped_column(String(5), nullable=True)
""")

write_file(os.path.join(BASE_DIR, "notifications", "preferences", "schemas.py"), """
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional, List

class PreferenceBase(BaseModel):
    event_type: str
    channels: List[str]
    is_muted: bool = False
    quiet_hours_start: Optional[str] = None
    quiet_hours_end: Optional[str] = None

class PreferenceUpdate(PreferenceBase):
    pass

class PreferenceResponse(PreferenceBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    user_id: UUID
""")

write_file(os.path.join(BASE_DIR, "notifications", "preferences", "service.py"), """
from uuid import UUID
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .models import NotificationPreference
from .schemas import PreferenceUpdate

class NotificationPreferenceService:
    @staticmethod
    async def get_by_user(db: AsyncSession, user_id: UUID) -> List[NotificationPreference]:
        result = await db.execute(select(NotificationPreference).where(NotificationPreference.user_id == str(user_id)))
        return list(result.scalars().all())

    @staticmethod
    async def update_preferences(db: AsyncSession, user_id: UUID, prefs: List[PreferenceUpdate]) -> List[NotificationPreference]:
        # Delete existing and insert new
        existing = await NotificationPreferenceService.get_by_user(db, user_id)
        for e in existing:
            await db.delete(e)
            
        new_prefs = []
        for p in prefs:
            obj = NotificationPreference(user_id=str(user_id), **p.model_dump())
            db.add(obj)
            new_prefs.append(obj)
            
        await db.commit()
        for obj in new_prefs:
            await db.refresh(obj)
        return new_prefs
""")

write_file(os.path.join(BASE_DIR, "notifications", "preferences", "router.py"), """
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from .schemas import PreferenceUpdate, PreferenceResponse
from .service import NotificationPreferenceService

router = APIRouter(prefix="/notification-preferences", tags=["Notification Preferences"])

@router.get("/{user_id}", response_model=APIResponse[List[PreferenceResponse]])
async def get_preferences(user_id: UUID, db: AsyncSession = Depends(get_db)):
    prefs = await NotificationPreferenceService.get_by_user(db, user_id)
    return APIResponse(data=prefs)

@router.put("/{user_id}", response_model=APIResponse[List[PreferenceResponse]])
async def update_preferences(user_id: UUID, data: List[PreferenceUpdate], db: AsyncSession = Depends(get_db)):
    prefs = await NotificationPreferenceService.update_preferences(db, user_id, data)
    return APIResponse(data=prefs, message="Preferences updated")
""")

write_file(os.path.join(BASE_DIR, "notifications", "router.py"), """
from fastapi import APIRouter
from .channels.router import router as channels_router
from .templates.router import router as templates_router
from .preferences.router import router as preferences_router

router = APIRouter(prefix="/notifications")
router.include_router(channels_router)
router.include_router(templates_router)
router.include_router(preferences_router)
""")

# ==========================================
# MODULE 3: ENTERPRISE ADMIN
# ==========================================
write_file(os.path.join(BASE_DIR, "enterprise_admin", "tenants", "models.py"), """
from sqlalchemy import String, Integer, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin
from app.shared.mixins.timestamp_mixin import TimestampMixin
from app.shared.mixins.soft_delete_mixin import SoftDeleteMixin

class Tenant(Base, UUIDModelMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "tenants"

    name: Mapped[str] = mapped_column(String(255))
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    organization_id: Mapped[str | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="active") # active/suspended/trial
    tier: Mapped[str] = mapped_column(String(50), default="free")
    max_users: Mapped[int | None] = mapped_column(Integer, nullable=True)
    max_devices: Mapped[int | None] = mapped_column(Integer, nullable=True)
    storage_limit_gb: Mapped[int | None] = mapped_column(Integer, nullable=True)
    features: Mapped[dict | None] = mapped_column(JSON, nullable=True)
""")

write_file(os.path.join(BASE_DIR, "enterprise_admin", "tenants", "schemas.py"), """
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional, Dict, Any
from datetime import datetime

class TenantBase(BaseModel):
    name: str
    slug: str
    organization_id: Optional[UUID] = None
    status: str = "active"
    tier: str = "free"
    max_users: Optional[int] = None
    max_devices: Optional[int] = None
    storage_limit_gb: Optional[int] = None
    features: Optional[Dict[str, Any]] = None

class TenantCreate(TenantBase):
    pass

class TenantUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    tier: Optional[str] = None
    max_users: Optional[int] = None
    max_devices: Optional[int] = None
    storage_limit_gb: Optional[int] = None
    features: Optional[Dict[str, Any]] = None

class TenantResponse(TenantBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    created_at: datetime
    updated_at: datetime
""")

write_file(os.path.join(BASE_DIR, "enterprise_admin", "tenants", "service.py"), """
from uuid import UUID
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from .models import Tenant
from .schemas import TenantCreate, TenantUpdate
from app.shared.pagination import PaginationParams, PaginatedResponse

class TenantService:
    @staticmethod
    async def create(db: AsyncSession, data: TenantCreate) -> Tenant:
        obj = Tenant(**data.model_dump())
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def get(db: AsyncSession, id: UUID) -> Optional[Tenant]:
        result = await db.execute(select(Tenant).where(Tenant.id == str(id)))
        return result.scalars().first()

    @staticmethod
    async def list_tenants(db: AsyncSession, params: PaginationParams) -> PaginatedResponse[Tenant]:
        query = select(Tenant)
        total = await db.scalar(select(func.count()).select_from(query.subquery()))
        
        query = query.offset((params.page - 1) * params.size).limit(params.size)
        result = await db.execute(query)
        
        return PaginatedResponse(
            items=result.scalars().all(),
            total=total or 0, page=params.page, size=params.size,
            pages=(total + params.size - 1) // params.size if total else 0
        )

    @staticmethod
    async def update(db: AsyncSession, id: UUID, data: TenantUpdate) -> Optional[Tenant]:
        obj = await TenantService.get(db, id)
        if not obj:
            return None
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(obj, k, v)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def delete(db: AsyncSession, id: UUID) -> bool:
        obj = await TenantService.get(db, id)
        if not obj:
            return False
        await db.delete(obj)
        await db.commit()
        return True

    @staticmethod
    async def set_status(db: AsyncSession, id: UUID, status: str) -> Optional[Tenant]:
        obj = await TenantService.get(db, id)
        if not obj:
            return None
        obj.status = status
        await db.commit()
        await db.refresh(obj)
        return obj
""")

write_file(os.path.join(BASE_DIR, "enterprise_admin", "tenants", "router.py"), """
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.shared.pagination import PaginationParams, PaginatedResponse
from .schemas import TenantCreate, TenantUpdate, TenantResponse
from .service import TenantService

router = APIRouter(prefix="/tenants", tags=["Tenants"])

@router.post("/", response_model=APIResponse[TenantResponse])
async def create(data: TenantCreate, db: AsyncSession = Depends(get_db)):
    obj = await TenantService.create(db, data)
    return APIResponse(data=obj, message="Tenant created")

@router.get("/{id}", response_model=APIResponse[TenantResponse])
async def get(id: UUID, db: AsyncSession = Depends(get_db)):
    obj = await TenantService.get(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return APIResponse(data=obj)

@router.get("/", response_model=APIResponse[PaginatedResponse[TenantResponse]])
async def list_tenants(params: PaginationParams = Depends(), db: AsyncSession = Depends(get_db)):
    return APIResponse(data=await TenantService.list_tenants(db, params))

@router.put("/{id}", response_model=APIResponse[TenantResponse])
async def update(id: UUID, data: TenantUpdate, db: AsyncSession = Depends(get_db)):
    obj = await TenantService.update(db, id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return APIResponse(data=obj, message="Tenant updated")

@router.delete("/{id}", response_model=APIResponse[bool])
async def delete(id: UUID, db: AsyncSession = Depends(get_db)):
    success = await TenantService.delete(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return APIResponse(data=True, message="Tenant deleted")

@router.post("/{id}/suspend", response_model=APIResponse[TenantResponse])
async def suspend(id: UUID, db: AsyncSession = Depends(get_db)):
    obj = await TenantService.set_status(db, id, "suspended")
    if not obj:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return APIResponse(data=obj, message="Tenant suspended")

@router.post("/{id}/activate", response_model=APIResponse[TenantResponse])
async def activate(id: UUID, db: AsyncSession = Depends(get_db)):
    obj = await TenantService.set_status(db, id, "active")
    if not obj:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return APIResponse(data=obj, message="Tenant activated")
""")

write_file(os.path.join(BASE_DIR, "enterprise_admin", "licensing", "models.py"), """
from sqlalchemy import String, Integer, JSON, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin
from app.shared.mixins.timestamp_mixin import TimestampMixin
from app.shared.mixins.soft_delete_mixin import SoftDeleteMixin

class License(Base, UUIDModelMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "licenses"

    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"))
    license_key: Mapped[str] = mapped_column(String(255), unique=True)
    license_type: Mapped[str] = mapped_column(String(50))
    issued_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    max_assets: Mapped[int | None] = mapped_column(Integer, nullable=True)
    max_connections: Mapped[int | None] = mapped_column(Integer, nullable=True)
    features: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
""")

write_file(os.path.join(BASE_DIR, "enterprise_admin", "licensing", "schemas.py"), """
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional, Dict, Any
from datetime import datetime

class LicenseBase(BaseModel):
    tenant_id: UUID
    license_key: str
    license_type: str
    issued_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    max_assets: Optional[int] = None
    max_connections: Optional[int] = None
    features: Optional[Dict[str, Any]] = None
    is_active: bool = True

class LicenseCreate(LicenseBase):
    pass

class LicenseUpdate(BaseModel):
    expires_at: Optional[datetime] = None
    max_assets: Optional[int] = None
    max_connections: Optional[int] = None
    features: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class LicenseResponse(LicenseBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    issued_at: datetime
    created_at: datetime
    updated_at: datetime
""")

write_file(os.path.join(BASE_DIR, "enterprise_admin", "licensing", "service.py"), """
from uuid import UUID
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from .models import License
from .schemas import LicenseCreate, LicenseUpdate
from app.shared.pagination import PaginationParams, PaginatedResponse
from datetime import datetime

class LicenseService:
    @staticmethod
    async def create(db: AsyncSession, data: LicenseCreate) -> License:
        dump = data.model_dump()
        dump["tenant_id"] = str(dump["tenant_id"])
        if not dump.get("issued_at"):
            dump["issued_at"] = datetime.utcnow()
        obj = License(**dump)
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def get(db: AsyncSession, id: UUID) -> Optional[License]:
        result = await db.execute(select(License).where(License.id == str(id)))
        return result.scalars().first()

    @staticmethod
    async def list_licenses(db: AsyncSession, params: PaginationParams) -> PaginatedResponse[License]:
        query = select(License)
        total = await db.scalar(select(func.count()).select_from(query.subquery()))
        
        query = query.offset((params.page - 1) * params.size).limit(params.size)
        result = await db.execute(query)
        
        return PaginatedResponse(
            items=result.scalars().all(),
            total=total or 0, page=params.page, size=params.size,
            pages=(total + params.size - 1) // params.size if total else 0
        )

    @staticmethod
    async def update(db: AsyncSession, id: UUID, data: LicenseUpdate) -> Optional[License]:
        obj = await LicenseService.get(db, id)
        if not obj:
            return None
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(obj, k, v)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def delete(db: AsyncSession, id: UUID) -> bool:
        obj = await LicenseService.get(db, id)
        if not obj:
            return False
        await db.delete(obj)
        await db.commit()
        return True

    @staticmethod
    async def validate_license(db: AsyncSession, license_key: str) -> bool:
        result = await db.execute(select(License).where(License.license_key == license_key))
        obj = result.scalars().first()
        if not obj or not obj.is_active:
            return False
        if obj.expires_at and obj.expires_at < datetime.utcnow():
            return False
        return True

    @staticmethod
    async def check_limits(db: AsyncSession, tenant_id: UUID) -> Dict[str, Any]:
        result = await db.execute(select(License).where(License.tenant_id == str(tenant_id), License.is_active == True))
        obj = result.scalars().first()
        if not obj:
            return {}
        return {
            "max_assets": obj.max_assets,
            "max_connections": obj.max_connections,
            "features": obj.features
        }
""")

write_file(os.path.join(BASE_DIR, "enterprise_admin", "licensing", "router.py"), """
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Dict, Any
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.shared.pagination import PaginationParams, PaginatedResponse
from .schemas import LicenseCreate, LicenseUpdate, LicenseResponse
from .service import LicenseService

router = APIRouter(prefix="/licenses", tags=["Licensing"])

@router.post("/", response_model=APIResponse[LicenseResponse])
async def create(data: LicenseCreate, db: AsyncSession = Depends(get_db)):
    obj = await LicenseService.create(db, data)
    return APIResponse(data=obj, message="License created")

@router.get("/{id}", response_model=APIResponse[LicenseResponse])
async def get(id: UUID, db: AsyncSession = Depends(get_db)):
    obj = await LicenseService.get(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="License not found")
    return APIResponse(data=obj)

@router.get("/", response_model=APIResponse[PaginatedResponse[LicenseResponse]])
async def list_licenses(params: PaginationParams = Depends(), db: AsyncSession = Depends(get_db)):
    return APIResponse(data=await LicenseService.list_licenses(db, params))

@router.put("/{id}", response_model=APIResponse[LicenseResponse])
async def update(id: UUID, data: LicenseUpdate, db: AsyncSession = Depends(get_db)):
    obj = await LicenseService.update(db, id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="License not found")
    return APIResponse(data=obj, message="License updated")

@router.delete("/{id}", response_model=APIResponse[bool])
async def delete(id: UUID, db: AsyncSession = Depends(get_db)):
    success = await LicenseService.delete(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="License not found")
    return APIResponse(data=True, message="License deleted")

@router.post("/validate/{license_key}", response_model=APIResponse[bool])
async def validate(license_key: str, db: AsyncSession = Depends(get_db)):
    is_valid = await LicenseService.validate_license(db, license_key)
    return APIResponse(data=is_valid)

@router.get("/limits/{tenant_id}", response_model=APIResponse[Dict[str, Any]])
async def check_limits(tenant_id: UUID, db: AsyncSession = Depends(get_db)):
    limits = await LicenseService.check_limits(db, tenant_id)
    return APIResponse(data=limits)
""")

write_file(os.path.join(BASE_DIR, "enterprise_admin", "audit_logs", "models.py"), """
from sqlalchemy import String, JSON, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin

class AuditLog(Base, UUIDModelMixin):
    __tablename__ = "audit_logs"

    tenant_id: Mapped[str | None] = mapped_column(ForeignKey("tenants.id"), nullable=True)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    action: Mapped[str] = mapped_column(String(100))
    resource_type: Mapped[str] = mapped_column(String(100))
    resource_id: Mapped[str] = mapped_column(String(255))
    old_values: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    new_values: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(50), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(50)) # success/failure
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
""")

write_file(os.path.join(BASE_DIR, "enterprise_admin", "audit_logs", "schemas.py"), """
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional, Dict, Any
from datetime import datetime

class AuditLogCreate(BaseModel):
    tenant_id: Optional[UUID] = None
    user_id: Optional[UUID] = None
    action: str
    resource_type: str
    resource_id: str
    old_values: Optional[Dict[str, Any]] = None
    new_values: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    status: str

class AuditLogResponse(AuditLogCreate):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    created_at: datetime
""")

write_file(os.path.join(BASE_DIR, "enterprise_admin", "audit_logs", "service.py"), """
from uuid import UUID
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from .models import AuditLog
from .schemas import AuditLogCreate
from app.shared.pagination import PaginationParams, PaginatedResponse

class AuditLogService:
    @staticmethod
    async def create(db: AsyncSession, data: AuditLogCreate) -> AuditLog:
        dump = data.model_dump()
        if dump.get("tenant_id"):
            dump["tenant_id"] = str(dump["tenant_id"])
        if dump.get("user_id"):
            dump["user_id"] = str(dump["user_id"])
        obj = AuditLog(**dump)
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def list_logs(db: AsyncSession, params: PaginationParams, user_id: Optional[UUID] = None, action: Optional[str] = None, resource_type: Optional[str] = None) -> PaginatedResponse[AuditLog]:
        query = select(AuditLog)
        if user_id:
            query = query.where(AuditLog.user_id == str(user_id))
        if action:
            query = query.where(AuditLog.action == action)
        if resource_type:
            query = query.where(AuditLog.resource_type == resource_type)

        total = await db.scalar(select(func.count()).select_from(query.subquery()))
        
        query = query.offset((params.page - 1) * params.size).limit(params.size).order_by(AuditLog.created_at.desc())
        result = await db.execute(query)
        
        return PaginatedResponse(
            items=result.scalars().all(),
            total=total or 0, page=params.page, size=params.size,
            pages=(total + params.size - 1) // params.size if total else 0
        )
""")

write_file(os.path.join(BASE_DIR, "enterprise_admin", "audit_logs", "router.py"), """
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.shared.pagination import PaginationParams, PaginatedResponse
from .schemas import AuditLogCreate, AuditLogResponse
from .service import AuditLogService

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])

@router.post("/", response_model=APIResponse[AuditLogResponse])
async def create(data: AuditLogCreate, db: AsyncSession = Depends(get_db)):
    obj = await AuditLogService.create(db, data)
    return APIResponse(data=obj, message="Audit log created")

@router.get("/", response_model=APIResponse[PaginatedResponse[AuditLogResponse]])
async def list_logs(
    user_id: Optional[UUID] = None,
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    params: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db)
):
    return APIResponse(data=await AuditLogService.list_logs(db, params, user_id, action, resource_type))
""")

write_file(os.path.join(BASE_DIR, "enterprise_admin", "router.py"), """
from fastapi import APIRouter
from .tenants.router import router as tenants_router
from .licensing.router import router as licenses_router
from .audit_logs.router import router as audit_logs_router

router = APIRouter(prefix="/admin")
router.include_router(tenants_router)
router.include_router(licenses_router)
router.include_router(audit_logs_router)
""")


# ==========================================
# MODULE 4: INTEGRATIONS
# ==========================================
write_file(os.path.join(BASE_DIR, "integrations", "webhook", "models.py"), """
from sqlalchemy import String, Integer, JSON, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin
from app.shared.mixins.timestamp_mixin import TimestampMixin
from app.shared.mixins.soft_delete_mixin import SoftDeleteMixin

class Webhook(Base, UUIDModelMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "webhooks"

    name: Mapped[str] = mapped_column(String(255))
    url: Mapped[str] = mapped_column(String(1024))
    secret: Mapped[str | None] = mapped_column(String(255), nullable=True)
    events: Mapped[list] = mapped_column(JSON)
    headers: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_triggered_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    failure_count: Mapped[int] = mapped_column(Integer, default=0)
""")

write_file(os.path.join(BASE_DIR, "integrations", "webhook", "schemas.py"), """
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional, Dict, Any, List
from datetime import datetime

class WebhookBase(BaseModel):
    name: str
    url: str
    secret: Optional[str] = None
    events: List[str]
    headers: Optional[Dict[str, str]] = None
    is_active: bool = True

class WebhookCreate(WebhookBase):
    pass

class WebhookUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    secret: Optional[str] = None
    events: Optional[List[str]] = None
    headers: Optional[Dict[str, str]] = None
    is_active: Optional[bool] = None

class WebhookResponse(WebhookBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    last_triggered_at: Optional[datetime] = None
    failure_count: int
    created_at: datetime
    updated_at: datetime

class WebhookTestResult(BaseModel):
    success: bool
    status_code: Optional[int] = None
    response: Optional[str] = None
""")

write_file(os.path.join(BASE_DIR, "integrations", "webhook", "service.py"), """
from uuid import UUID
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from .models import Webhook
from .schemas import WebhookCreate, WebhookUpdate, WebhookTestResult
from app.shared.pagination import PaginationParams, PaginatedResponse
from datetime import datetime

class WebhookService:
    @staticmethod
    async def create(db: AsyncSession, data: WebhookCreate) -> Webhook:
        obj = Webhook(**data.model_dump())
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def get(db: AsyncSession, id: UUID) -> Optional[Webhook]:
        result = await db.execute(select(Webhook).where(Webhook.id == str(id)))
        return result.scalars().first()

    @staticmethod
    async def list_webhooks(db: AsyncSession, params: PaginationParams) -> PaginatedResponse[Webhook]:
        query = select(Webhook)
        total = await db.scalar(select(func.count()).select_from(query.subquery()))
        
        query = query.offset((params.page - 1) * params.size).limit(params.size)
        result = await db.execute(query)
        
        return PaginatedResponse(
            items=result.scalars().all(),
            total=total or 0, page=params.page, size=params.size,
            pages=(total + params.size - 1) // params.size if total else 0
        )

    @staticmethod
    async def list_by_event_type(db: AsyncSession, event_type: str) -> List[Webhook]:
        # Using simple filter since events is JSON list; exact match or contains check needed
        # In a real app we might use JSON operators depending on DB
        result = await db.execute(select(Webhook).where(Webhook.is_active == True))
        all_hooks = result.scalars().all()
        return [h for h in all_hooks if event_type in h.events]

    @staticmethod
    async def update(db: AsyncSession, id: UUID, data: WebhookUpdate) -> Optional[Webhook]:
        obj = await WebhookService.get(db, id)
        if not obj:
            return None
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(obj, k, v)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def delete(db: AsyncSession, id: UUID) -> bool:
        obj = await WebhookService.get(db, id)
        if not obj:
            return False
        await db.delete(obj)
        await db.commit()
        return True

    @staticmethod
    async def trigger_webhook(db: AsyncSession, id: UUID, payload: dict) -> bool:
        obj = await WebhookService.get(db, id)
        if not obj:
            return False
        # Mock httpx post
        obj.last_triggered_at = datetime.utcnow()
        await db.commit()
        return True

    @staticmethod
    async def test_webhook(db: AsyncSession, id: UUID) -> Optional[WebhookTestResult]:
        obj = await WebhookService.get(db, id)
        if not obj:
            return None
        return WebhookTestResult(success=True, status_code=200, response="OK")
""")

write_file(os.path.join(BASE_DIR, "integrations", "webhook", "router.py"), """
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.shared.pagination import PaginationParams, PaginatedResponse
from .schemas import WebhookCreate, WebhookUpdate, WebhookResponse, WebhookTestResult
from .service import WebhookService

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])

@router.post("/", response_model=APIResponse[WebhookResponse])
async def create(data: WebhookCreate, db: AsyncSession = Depends(get_db)):
    obj = await WebhookService.create(db, data)
    return APIResponse(data=obj, message="Webhook created")

@router.get("/{id}", response_model=APIResponse[WebhookResponse])
async def get(id: UUID, db: AsyncSession = Depends(get_db)):
    obj = await WebhookService.get(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Webhook not found")
    return APIResponse(data=obj)

@router.get("/", response_model=APIResponse[PaginatedResponse[WebhookResponse]])
async def list_webhooks(params: PaginationParams = Depends(), db: AsyncSession = Depends(get_db)):
    return APIResponse(data=await WebhookService.list_webhooks(db, params))

@router.get("/by-event/{event_type}", response_model=APIResponse[List[WebhookResponse]])
async def list_by_event(event_type: str, db: AsyncSession = Depends(get_db)):
    hooks = await WebhookService.list_by_event_type(db, event_type)
    return APIResponse(data=hooks)

@router.put("/{id}", response_model=APIResponse[WebhookResponse])
async def update(id: UUID, data: WebhookUpdate, db: AsyncSession = Depends(get_db)):
    obj = await WebhookService.update(db, id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Webhook not found")
    return APIResponse(data=obj, message="Webhook updated")

@router.delete("/{id}", response_model=APIResponse[bool])
async def delete(id: UUID, db: AsyncSession = Depends(get_db)):
    success = await WebhookService.delete(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Webhook not found")
    return APIResponse(data=True, message="Webhook deleted")

@router.post("/{id}/test", response_model=APIResponse[WebhookTestResult])
async def test(id: UUID, db: AsyncSession = Depends(get_db)):
    result = await WebhookService.test_webhook(db, id)
    if not result:
        raise HTTPException(status_code=404, detail="Webhook not found")
    return APIResponse(data=result, message="Webhook tested")
""")

write_file(os.path.join(BASE_DIR, "integrations", "api_clients", "models.py"), """
from sqlalchemy import String, JSON, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin
from app.shared.mixins.timestamp_mixin import TimestampMixin
from app.shared.mixins.soft_delete_mixin import SoftDeleteMixin

class ApiClient(Base, UUIDModelMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "external_api_clients"

    name: Mapped[str] = mapped_column(String(255))
    client_type: Mapped[str] = mapped_column(String(100)) # sap/oracle/maximo/cmms/mes/scada/historian/powerbi/grafana
    base_url: Mapped[str] = mapped_column(String(1024))
    auth_type: Mapped[str] = mapped_column(String(50)) # none/basic/bearer/oauth
    credentials: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    config: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_sync_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
""")

write_file(os.path.join(BASE_DIR, "integrations", "api_clients", "schemas.py"), """
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional, Dict, Any
from datetime import datetime

class ApiClientBase(BaseModel):
    name: str
    client_type: str
    base_url: str
    auth_type: str
    credentials: Optional[Dict[str, Any]] = None
    config: Optional[Dict[str, Any]] = None
    is_active: bool = True

class ApiClientCreate(ApiClientBase):
    pass

class ApiClientUpdate(BaseModel):
    name: Optional[str] = None
    base_url: Optional[str] = None
    auth_type: Optional[str] = None
    credentials: Optional[Dict[str, Any]] = None
    config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class ApiClientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    client_type: str
    base_url: str
    auth_type: str
    config: Optional[Dict[str, Any]] = None
    is_active: bool
    last_sync_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
""")

write_file(os.path.join(BASE_DIR, "integrations", "api_clients", "service.py"), """
from uuid import UUID
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from .models import ApiClient
from .schemas import ApiClientCreate, ApiClientUpdate
from app.shared.pagination import PaginationParams, PaginatedResponse
from datetime import datetime

class ApiClientService:
    @staticmethod
    async def create(db: AsyncSession, data: ApiClientCreate) -> ApiClient:
        obj = ApiClient(**data.model_dump())
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def get(db: AsyncSession, id: UUID) -> Optional[ApiClient]:
        result = await db.execute(select(ApiClient).where(ApiClient.id == str(id)))
        return result.scalars().first()

    @staticmethod
    async def list_clients(db: AsyncSession, params: PaginationParams) -> PaginatedResponse[ApiClient]:
        query = select(ApiClient)
        total = await db.scalar(select(func.count()).select_from(query.subquery()))
        
        query = query.offset((params.page - 1) * params.size).limit(params.size)
        result = await db.execute(query)
        
        return PaginatedResponse(
            items=result.scalars().all(),
            total=total or 0, page=params.page, size=params.size,
            pages=(total + params.size - 1) // params.size if total else 0
        )

    @staticmethod
    async def update(db: AsyncSession, id: UUID, data: ApiClientUpdate) -> Optional[ApiClient]:
        obj = await ApiClientService.get(db, id)
        if not obj:
            return None
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(obj, k, v)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def delete(db: AsyncSession, id: UUID) -> bool:
        obj = await ApiClientService.get(db, id)
        if not obj:
            return False
        await db.delete(obj)
        await db.commit()
        return True

    @staticmethod
    async def test_connection(db: AsyncSession, id: UUID) -> bool:
        obj = await ApiClientService.get(db, id)
        if not obj:
            return False
        return True

    @staticmethod
    async def sync(db: AsyncSession, id: UUID) -> bool:
        obj = await ApiClientService.get(db, id)
        if not obj:
            return False
        obj.last_sync_at = datetime.utcnow()
        await db.commit()
        return True
""")

write_file(os.path.join(BASE_DIR, "integrations", "api_clients", "router.py"), """
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
""")

write_file(os.path.join(BASE_DIR, "integrations", "router.py"), """
from fastapi import APIRouter
from .webhook.router import router as webhook_router
from .api_clients.router import router as api_clients_router

router = APIRouter(prefix="/integrations")
router.include_router(webhook_router)
router.include_router(api_clients_router)
""")


# ==========================================
# MODULE 5: FILES
# ==========================================
write_file(os.path.join(BASE_DIR, "files", "uploads", "models.py"), """
from sqlalchemy import String, Integer, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.shared.mixins.base_model import Base
from app.shared.mixins.uuid_mixin import UUIDModelMixin
from app.shared.mixins.timestamp_mixin import TimestampMixin
from app.shared.mixins.soft_delete_mixin import SoftDeleteMixin

class UploadedFile(Base, UUIDModelMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "uploaded_files"

    original_filename: Mapped[str] = mapped_column(String(255))
    stored_filename: Mapped[str] = mapped_column(String(255))
    file_path: Mapped[str] = mapped_column(String(1024))
    mime_type: Mapped[str] = mapped_column(String(100))
    file_size: Mapped[int] = mapped_column(Integer)
    uploaded_by: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    category: Mapped[str] = mapped_column(String(50)) # document/image/video/data/other
    tenant_id: Mapped[str | None] = mapped_column(ForeignKey("tenants.id"), nullable=True)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
""")

write_file(os.path.join(BASE_DIR, "files", "uploads", "schemas.py"), """
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional
from datetime import datetime

class FileMetadata(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    original_filename: str
    mime_type: str
    file_size: int
    category: str
    is_public: bool
    uploaded_by: Optional[UUID] = None
    tenant_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

class FileUploadResponse(BaseModel):
    id: UUID
    url: str
    metadata: FileMetadata
""")

write_file(os.path.join(BASE_DIR, "files", "uploads", "service.py"), """
from uuid import UUID, uuid4
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import UploadFile
from .models import UploadedFile
from .schemas import FileMetadata, FileUploadResponse
from app.shared.pagination import PaginationParams, PaginatedResponse

class FileService:
    @staticmethod
    async def upload_file(db: AsyncSession, file: UploadFile, category: str, uploader_id: Optional[UUID] = None, tenant_id: Optional[UUID] = None, is_public: bool = False) -> FileUploadResponse:
        # Mock save
        stored_name = f"{uuid4()}_{file.filename}"
        path = f"/storage/{category}/{stored_name}"
        
        obj = UploadedFile(
            original_filename=file.filename or "unknown",
            stored_filename=stored_name,
            file_path=path,
            mime_type=file.content_type or "application/octet-stream",
            file_size=1024, # mock size
            uploaded_by=str(uploader_id) if uploader_id else None,
            category=category,
            tenant_id=str(tenant_id) if tenant_id else None,
            is_public=is_public
        )
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        
        metadata = FileMetadata.model_validate(obj)
        return FileUploadResponse(id=obj.id, url=f"/api/files/{obj.id}/download", metadata=metadata)

    @staticmethod
    async def get_file_metadata(db: AsyncSession, id: UUID) -> Optional[UploadedFile]:
        result = await db.execute(select(UploadedFile).where(UploadedFile.id == str(id)))
        return result.scalars().first()

    @staticmethod
    async def list_files(db: AsyncSession, params: PaginationParams) -> PaginatedResponse[UploadedFile]:
        query = select(UploadedFile)
        total = await db.scalar(select(func.count()).select_from(query.subquery()))
        
        query = query.offset((params.page - 1) * params.size).limit(params.size)
        result = await db.execute(query)
        
        return PaginatedResponse(
            items=result.scalars().all(),
            total=total or 0, page=params.page, size=params.size,
            pages=(total + params.size - 1) // params.size if total else 0
        )

    @staticmethod
    async def delete_file(db: AsyncSession, id: UUID) -> bool:
        obj = await FileService.get_file_metadata(db, id)
        if not obj:
            return False
        await db.delete(obj)
        await db.commit()
        return True
""")

write_file(os.path.join(BASE_DIR, "files", "uploads", "router.py"), """
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.shared.pagination import PaginationParams, PaginatedResponse
from .schemas import FileMetadata, FileUploadResponse
from .service import FileService

router = APIRouter(prefix="/files", tags=["Files"])

@router.post("/upload", response_model=APIResponse[FileUploadResponse])
async def upload(
    file: UploadFile = File(...),
    category: str = Form("other"),
    tenant_id: Optional[UUID] = Form(None),
    is_public: bool = Form(False),
    db: AsyncSession = Depends(get_db)
):
    result = await FileService.upload_file(db, file, category, tenant_id=tenant_id, is_public=is_public)
    return APIResponse(data=result, message="File uploaded successfully")

@router.get("/{id}", response_model=APIResponse[FileMetadata])
async def get(id: UUID, db: AsyncSession = Depends(get_db)):
    obj = await FileService.get_file_metadata(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="File not found")
    return APIResponse(data=FileMetadata.model_validate(obj))

@router.get("/", response_model=APIResponse[PaginatedResponse[FileMetadata]])
async def list_files(params: PaginationParams = Depends(), db: AsyncSession = Depends(get_db)):
    paginated = await FileService.list_files(db, params)
    return APIResponse(data=paginated)

@router.delete("/{id}", response_model=APIResponse[bool])
async def delete(id: UUID, db: AsyncSession = Depends(get_db)):
    success = await FileService.delete_file(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="File not found")
    return APIResponse(data=True, message="File deleted")
""")

write_file(os.path.join(BASE_DIR, "files", "router.py"), """
from fastapi import APIRouter
from .uploads.router import router as uploads_router

router = APIRouter()
router.include_router(uploads_router)
""")

print("All modules generated successfully!")
