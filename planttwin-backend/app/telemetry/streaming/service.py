from typing import List
from app.telemetry.streaming.schemas import StreamConfig, StreamStatus

class StreamingService:
    def __init__(self):
        self.active_tags = set()
        self.streams_count = 0

    async def start_stream(self, config: StreamConfig):
        for tag in config.tags:
            self.active_tags.add(tag)
        self.streams_count += 1
        return True

    async def stop_stream(self, tags: List[str]):
        for tag in tags:
            if tag in self.active_tags:
                self.active_tags.remove(tag)
        if self.streams_count > 0:
            self.streams_count -= 1
        return True

    async def list_active_streams(self) -> StreamStatus:
        return StreamStatus(active_streams=self.streams_count, tags=list(self.active_tags))
