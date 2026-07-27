from fastapi import APIRouter
from .organizations.router import router as organizations_router
from .plants.router import router as plants_router
from .areas.router import router as areas_router
from .production_lines.router import router as production_lines_router
from .hierarchy.router import router as hierarchy_router

router = APIRouter(prefix="/enterprise")

router.include_router(organizations_router)
router.include_router(plants_router)
router.include_router(areas_router)
router.include_router(production_lines_router)
router.include_router(hierarchy_router)
