import asyncio
from typing import Callable, Dict, List, Any
from app.core.logging.logger import logger

EventHandler = Callable[[str, Dict[str, Any]], Any]

class EventBus:
    """Decoupled internal Event Bus for system-wide events (telemetry, alarm, twin sync, audit)."""
    
    def __init__(self):
        self._subscribers: Dict[str, List[EventHandler]] = {}

    def subscribe(self, event_type: str, handler: EventHandler):
        if event_type not in self._subscribers:
            self._subscribers[event_type] = []
        self._subscribers[event_type].append(handler)
        logger.debug(f"Subscribed handler to event '{event_type}'")

    async def publish(self, event_type: str, payload: Dict[str, Any]):
        handlers = self._subscribers.get(event_type, [])
        if not handlers:
            return

        for handler in handlers:
            try:
                if asyncio.iscoroutinefunction(handler):
                    await handler(event_type, payload)
                else:
                    handler(event_type, payload)
            except Exception as e:
                logger.error(f"Error handling event '{event_type}' in handler {handler.__name__}: {e}")


event_bus = EventBus()
