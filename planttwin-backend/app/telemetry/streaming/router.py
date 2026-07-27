from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.telemetry.streaming.schemas import StreamConfig, StreamStatus
from app.telemetry.streaming.service import StreamingService
from app.shared.responses import APIResponse
from app.telemetry.streaming.websocket import manager

router = APIRouter(prefix="/streaming", tags=["Telemetry Streaming"])
service = StreamingService()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We don't expect the client to send messages right now, but we must keep connection open
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@router.post("/start", response_model=APIResponse[bool])
async def start_stream(config: StreamConfig):
    success = await service.start_stream(config)
    return APIResponse(data=success)

@router.post("/stop", response_model=APIResponse[bool])
async def stop_stream(tags: list[str]):
    success = await service.stop_stream(tags)
    return APIResponse(data=success)

@router.get("/status", response_model=APIResponse[StreamStatus])
async def stream_status():
    status = await service.list_active_streams()
    return APIResponse(data=status)
