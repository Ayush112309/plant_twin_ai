from fastapi import APIRouter
from .tenants.router import router as tenants_router
from .licensing.router import router as licenses_router
from .audit_logs.router import router as audit_logs_router

router = APIRouter(prefix="/admin")
router.include_router(tenants_router)
router.include_router(licenses_router)
router.include_router(audit_logs_router)
