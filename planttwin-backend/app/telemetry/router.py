from fastapi import APIRouter
from app.telemetry.ingestion.router import router as ingestion_router
from app.telemetry.historian.router import router as historian_router
from app.telemetry.streaming.router import router as streaming_router
from app.telemetry.quality.router import router as quality_router
from app.telemetry.replay.router import router as replay_router

router = APIRouter(prefix="/telemetry")
router.include_router(ingestion_router)
router.include_router(historian_router)
router.include_router(streaming_router)
router.include_router(quality_router)
router.include_router(replay_router)
