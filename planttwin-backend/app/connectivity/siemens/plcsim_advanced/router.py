from fastapi import APIRouter
from app.connectivity.siemens.plcsim_advanced.schemas import PLCReadRequest, PLCWriteRequest, PLCReadResponse
from app.connectivity.siemens.plcsim_advanced.service import PLCSIMAdvancedService

router = APIRouter(prefix="/siemens/plcsim", tags=["Siemens PLCSIM"])
plc_service = PLCSIMAdvancedService()

@router.post("/read", response_model=PLCReadResponse)
async def read_plc_tag(request: PLCReadRequest):
    return plc_service.read_tag(request.tag_address)

@router.post("/write")
async def write_plc_tag(request: PLCWriteRequest):
    success = plc_service.write_tag(request.tag_address, request.value)
    return {"success": success}

@router.get("/status")
async def get_plc_status():
    return plc_service.get_instance_info()
