from fastapi import APIRouter
from app.digital_twin.twins.router import router as twins_router
from app.digital_twin.snapshots.router import router as snapshots_router
from app.digital_twin.simulation.router import router as simulation_router
from app.digital_twin.relationships.router import router as relationships_router

router = APIRouter(prefix="/digital-twin")
router.include_router(twins_router)
router.include_router(snapshots_router)
router.include_router(simulation_router)
router.include_router(relationships_router)
