"""
PlantTwin AI Backend — Enterprise Notification Engine
======================================================
Multi-channel notifications, escalation rules engine, preferences & inbox history.
"""
from typing import List, Dict, Any
from datetime import datetime, timedelta
import uuid
from app.core.logging.logger import logger
from .schemas import NotificationItem, UserNotificationPreferences, EscalationRule

_NOTIFICATIONS_STORE: List[Dict[str, Any]] = [
    {
        "id": "notif-001",
        "title": "CRITICAL ALARM: Reactor-001 Thermal Spike 100°C",
        "message": "ISA-18.2 Critical Alarm ALM-2024-001 triggered on DB100.DBD12. Immediate intervention required.",
        "category": "Critical",
        "severity": "CRITICAL",
        "channels_sent": ["In-App", "Push", "Email", "Slack", "MS Teams"],
        "read": False,
        "archived": False,
        "escalation_stage": 1,
        "associated_asset": "Reactor-001",
        "associated_work_order": None,
        "created_at": (datetime.utcnow() - timedelta(minutes=12)).isoformat()
    },
    {
        "id": "notif-002",
        "title": "PREDICTIVE MAINTENANCE: Pump-002 Bearing Wear Horizon",
        "message": "AI RUL Engine predicts bearing degradation in 142 days. Preventive overhaul suggested.",
        "category": "Prediction",
        "severity": "HIGH",
        "channels_sent": ["In-App", "Email"],
        "read": False,
        "archived": False,
        "escalation_stage": 0,
        "associated_asset": "Pump-002",
        "associated_work_order": "WO-PMP-02",
        "created_at": (datetime.utcnow() - timedelta(hours=2)).isoformat()
    },
    {
        "id": "notif-003",
        "title": "WORKFLOW ESCALATED: Unacknowledged Alarm Escalated to Supervisor",
        "message": "Critical alarm ALM-2024-001 was unacknowledged for >10 mins. Escalated to Plant Supervisor & Work Order Created.",
        "category": "Workflow",
        "severity": "HIGH",
        "channels_sent": ["In-App", "SMS", "Email"],
        "read": True,
        "archived": False,
        "escalation_stage": 4,
        "associated_asset": "Reactor-001",
        "associated_work_order": "WO-EMERGENCY-001",
        "created_at": (datetime.utcnow() - timedelta(hours=5)).isoformat()
    },
    {
        "id": "notif-004",
        "title": "SECURITY AUDIT: Role Persona Switched to System Administrator",
        "message": "User admin@planttwin.ai authenticated with Super Admin 100% full privileges.",
        "category": "Security",
        "severity": "MEDIUM",
        "channels_sent": ["In-App", "Email", "Webhook"],
        "read": True,
        "archived": False,
        "escalation_stage": 0,
        "associated_asset": "System-Auth",
        "associated_work_order": None,
        "created_at": (datetime.utcnow() - timedelta(days=1)).isoformat()
    },
    {
        "id": "notif-005",
        "title": "EXECUTIVE REPORT: Daily OEE & Production PDF Ready",
        "message": "Monthly Operational OEE Summary PDF-1.4 report compiled (OEE 77.8%, MTBF 342h).",
        "category": "Reports",
        "severity": "LOW",
        "channels_sent": ["In-App", "Email"],
        "read": True,
        "archived": True,
        "escalation_stage": 0,
        "associated_asset": "Refinery Alpha",
        "associated_work_order": None,
        "created_at": (datetime.utcnow() - timedelta(days=2)).isoformat()
    }
]

_USER_PREFERENCES = {
    "receive_critical": True,
    "receive_warning": True,
    "receive_maintenance": True,
    "receive_ai_predictions": True,
    "receive_security": True,
    "receive_system": True,
    "receive_workflow": True,
    "receive_reports": False,
    "receive_marketing": False,
    "preferred_channels": ["In-App", "Email", "Push", "Slack", "MS Teams", "SMS", "Webhook"]
}


class NotificationCenterService:

    @staticmethod
    async def get_notifications(
        category: str = None,
        unread_only: bool = False,
        archived: bool = False
    ) -> List[Dict[str, Any]]:
        results = []
        for n in _NOTIFICATIONS_STORE:
            if archived != n["archived"]:
                continue
            if unread_only and n["read"]:
                continue
            if category and category.upper() != "ALL" and n["category"].lower() != category.lower():
                continue
            results.append(n)
        return results

    @staticmethod
    async def mark_read(notif_id: str) -> bool:
        for n in _NOTIFICATIONS_STORE:
            if n["id"] == notif_id or notif_id == "ALL":
                n["read"] = True
        return True

    @staticmethod
    async def archive_notification(notif_id: str) -> bool:
        for n in _NOTIFICATIONS_STORE:
            if n["id"] == notif_id:
                n["archived"] = True
        return True

    @staticmethod
    async def trigger_escalation(notif_id: str) -> Dict[str, Any]:
        target = None
        for n in _NOTIFICATIONS_STORE:
            if n["id"] == notif_id:
                target = n
                break
        if not target:
            target = _NOTIFICATIONS_STORE[0]

        target["escalation_stage"] = 4
        target["associated_work_order"] = f"WO-ESCALATED-{uuid.uuid4().hex[:6].upper()}"
        target["channels_sent"].extend(["SMS", "Supervisor Phone Dispatch"])
        target["message"] += f" [ESCALATED TO SUPERVISOR -> Work Order {target['associated_work_order']} CREATED]"

        logger.info(f"Escalation Rule Triggered for {target['id']}: Escalated to supervisor and created WO {target['associated_work_order']}")

        return {
            "success": True,
            "escalated_notification_id": target["id"],
            "new_stage": 4,
            "supervisor_notified": "supervisor.oncall@planttwin.ai",
            "work_order_created": target["associated_work_order"],
            "message": "Notification escalated to Supervisor & Emergency Work Order dispatched."
        }

    @staticmethod
    async def get_preferences() -> Dict[str, Any]:
        return _USER_PREFERENCES

    @staticmethod
    async def update_preferences(prefs: Dict[str, Any]) -> Dict[str, Any]:
        _USER_PREFERENCES.update(prefs)
        logger.info("Updated User Notification Preferences")
        return _USER_PREFERENCES
