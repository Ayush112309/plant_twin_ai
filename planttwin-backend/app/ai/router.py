from fastapi import APIRouter
from .anomaly_detection.router import router as anomaly_router
from .health.router import router as health_router
from .prediction.router import router as prediction_router
from .model_registry.router import router as model_registry_router
from .copilot.router import router as copilot_router
from .feedback.router import router as feedback_router
from .case_library.router import router as case_library_router

router = APIRouter(prefix="/ai")

router.include_router(anomaly_router)
router.include_router(health_router)
router.include_router(prediction_router)
router.include_router(model_registry_router)
router.include_router(copilot_router)
router.include_router(feedback_router)
router.include_router(case_library_router)
