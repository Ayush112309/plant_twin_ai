from fastapi import APIRouter
from app.connectivity.opcua.schemas import OPCUANodeRequest, OPCUANodeResponse, OPCUABrowseResponse
from app.connectivity.opcua.service import OPCUAService
from pydantic import BaseModel

router = APIRouter(prefix="/opcua", tags=["OPC UA"])
opcua_service = OPCUAService()

class ConnectRequest(BaseModel):
    endpoint: str

class WriteRequest(BaseModel):
    node_id: str
    value: float

@router.post("/connect")
async def connect_opcua(request: ConnectRequest):
    return {"success": opcua_service.connect(request.endpoint)}

@router.post("/read", response_model=OPCUANodeResponse)
async def read_opcua_node(request: OPCUANodeRequest):
    return opcua_service.read_node(request.node_id)

@router.post("/write")
async def write_opcua_node(request: WriteRequest):
    return {"success": opcua_service.write_node(request.node_id, request.value)}

@router.get("/browse", response_model=OPCUABrowseResponse)
async def browse_opcua_nodes(node_id: str = "Root"):
    return opcua_service.browse_nodes(node_id)

@router.post("/subscribe")
async def subscribe_opcua_node(request: OPCUANodeRequest):
    return {"success": opcua_service.subscribe_node(request.node_id)}
