import json
from typing import Dict, List, Set, Any
from fastapi import WebSocket
from app.core.logging.logger import logger


class WebSocketManager:
    """Centralized WebSocket connection manager supporting channel topics."""
    
    def __init__(self):
        # Active connections per channel topic (e.g. "telemetry:plant1", "alarms", "twin:motor_101")
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, channel: str = "global"):
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = set()
        self.active_connections[channel].add(websocket)
        logger.info(f"WebSocket client connected to channel '{channel}'. Total: {len(self.active_connections[channel])}")

    def disconnect(self, websocket: WebSocket, channel: str = "global"):
        if channel in self.active_connections:
            self.active_connections[channel].discard(websocket)
            if not self.active_connections[channel]:
                del self.active_connections[channel]
        logger.info(f"WebSocket client disconnected from channel '{channel}'.")

    async def broadcast_to_channel(self, channel: str, message: Dict[str, Any]):
        if channel not in self.active_connections:
            return
            
        payload = json.dumps(message)
        dead_sockets = set()
        
        for connection in list(self.active_connections[channel]):
            try:
                await connection.send_text(payload)
            except Exception as e:
                logger.warning(f"Error sending message to WebSocket client on channel {channel}: {e}")
                dead_sockets.add(connection)
                
        for dead in dead_sockets:
            self.disconnect(dead, channel)

    async def broadcast_global(self, message: Dict[str, Any]):
        for channel in list(self.active_connections.keys()):
            await self.broadcast_to_channel(channel, message)


ws_manager = WebSocketManager()
