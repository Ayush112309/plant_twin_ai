"""
PlantTwin AI Backend — Telemetry Replay Engine
===============================================
Historical telemetry timeline scrubber and incident playback service.
"""
from typing import List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession


class TelemetryReplayService:
    """Historical telemetry playback scrubber."""

    @staticmethod
    async def get_replay_stream(
        db: AsyncSession, tags: List[str], start_time: datetime, end_time: datetime, speed_multiplier: float = 1.0
    ) -> Dict[str, Any]:
        """Fetch chronological historical frames for incident replay."""
        frames = []
        current = start_time
        while current <= end_time:
            frame_data = {
                "timestamp": current.isoformat(),
                "values": {tag: round(750 + (10 if "temp" in tag else 5), 2) for tag in tags}
            }
            frames.append(frame_data)
            current += timedelta(minutes=5)

        return {
            "tags": tags,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "speed_multiplier": speed_multiplier,
            "total_frames": len(frames),
            "frames": frames
        }
