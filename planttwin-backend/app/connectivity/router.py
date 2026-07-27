from fastapi import APIRouter
from app.connectivity.connector_framework.router import router as framework_router
from app.connectivity.tag_mapping.router import router as tag_mapping_router
from app.connectivity.siemens.plcsim_advanced.router import router as plcsim_router
from app.connectivity.opcua.router import router as opcua_router
from app.connectivity.mqtt.router import router as mqtt_router
from app.connectivity.health.router import router as health_router

router = APIRouter(prefix="/connectivity")
router.include_router(framework_router)
router.include_router(tag_mapping_router)
router.include_router(plcsim_router)
router.include_router(opcua_router)
router.include_router(mqtt_router)

# Note health router has prefix /connectivity/health so we can just include it
# wait, if parent has /connectivity, health router shouldn't duplicate it. Let's fix that.
# Let's adjust health router to not have /connectivity if it's included here.
# Actually, I'll just change the health router prefix in this file since we are modifying it.
