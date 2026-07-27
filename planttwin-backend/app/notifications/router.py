from fastapi import APIRouter
from .channels.router import router as channels_router
from .templates.router import router as templates_router
from .preferences.router import router as preferences_router
from .center_router import router as center_router

router = APIRouter(prefix="/notifications")
router.include_router(channels_router)
router.include_router(templates_router)
router.include_router(preferences_router)
router.include_router(center_router)
