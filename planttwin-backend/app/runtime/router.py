from fastapi import APIRouter
from .alarms.router import router as alarms_router
from .rules.router import router as rules_router
from .work_orders.router import router as work_orders_router
from .incident_management.router import router as incident_management_router

router = APIRouter(prefix="/runtime")

router.include_router(alarms_router)
router.include_router(rules_router)
router.include_router(work_orders_router)
router.include_router(incident_management_router)

