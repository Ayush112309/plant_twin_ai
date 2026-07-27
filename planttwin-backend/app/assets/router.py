from fastapi import APIRouter
from app.assets.equipment.router import router as equipment_router
from app.assets.sensors.router import router as sensors_router
from app.assets.documents.router import router as documents_router
from app.assets.asset_history.router import router as history_router

router = APIRouter(prefix="/assets")
router.include_router(equipment_router)
router.include_router(sensors_router)
router.include_router(documents_router)
router.include_router(history_router)
