from fastapi import APIRouter
from .reports.router import router as reports_router
from .templates.router import router as templates_router
from .dashboard.router import router as dashboard_router

router = APIRouter(prefix="/reporting")
router.include_router(reports_router)
router.include_router(templates_router)
router.include_router(dashboard_router)
