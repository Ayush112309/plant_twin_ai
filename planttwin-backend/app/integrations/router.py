from fastapi import APIRouter
from .webhook.router import router as webhook_router
from .api_clients.router import router as api_clients_router

router = APIRouter(prefix="/integrations")
router.include_router(webhook_router)
router.include_router(api_clients_router)
