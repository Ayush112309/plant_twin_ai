"""
PlantTwin AI Backend — Notification Escalation Engine
======================================================
ISA-18.2 unacknowledged alarm escalation matrix service.
"""
from typing import Dict, Any
from app.core.logging.logger import logger


class EscalationService:
    """Unacknowledged alarm escalation engine."""

    @staticmethod
    async def evaluate_escalations(alarm_id: str, unacknowledged_minutes: int) -> Dict[str, Any]:
        """Check if an unacknowledged alarm should escalate to management."""
        if unacknowledged_minutes > 15:
            logger.warn(f"Alarm {alarm_id} unacknowledged for {unacknowledged_minutes}m. Escalating to Plant Manager.")
            return {
                "alarm_id": alarm_id,
                "escalated": True,
                "escalation_level": "LEVEL_2_MANAGER",
                "notified": ["plant_manager@enterprise.com", "duty_supervisor@enterprise.com"]
            }
        return {"alarm_id": alarm_id, "escalated": False}
