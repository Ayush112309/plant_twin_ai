from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional
from app.shared.responses import APIResponse
from .center_service import NotificationCenterService
from .schemas import UserNotificationPreferences

router = APIRouter(prefix="/center", tags=["Enterprise Notification Center"])


@router.get("", response_model=APIResponse[List[Dict[str, Any]]])
async def get_notifications(
    category: Optional[str] = Query(None),
    unread_only: bool = Query(False),
    archived: bool = Query(False)
):
    """Retrieve filtered notification history & unread items."""
    items = await NotificationCenterService.get_notifications(category, unread_only, archived)
    return APIResponse.ok(data=items, message="Notifications retrieved successfully")


@router.post("/{notif_id}/read", response_model=APIResponse[bool])
async def mark_notification_read(notif_id: str):
    """Mark a notification or all notifications as read."""
    res = await NotificationCenterService.mark_read(notif_id)
    return APIResponse.ok(data=res, message="Notification marked as read")


@router.post("/{notif_id}/archive", response_model=APIResponse[bool])
async def archive_notification(notif_id: str):
    """Archive a notification."""
    res = await NotificationCenterService.archive_notification(notif_id)
    return APIResponse.ok(data=res, message="Notification archived")


@router.post("/{notif_id}/escalate", response_model=APIResponse[Dict[str, Any]])
async def trigger_escalation(notif_id: str):
    """Trigger Escalation Rule: Critical Alarm -> Push -> Email -> Supervisor Escalation -> Auto Work Order."""
    res = await NotificationCenterService.trigger_escalation(notif_id)
    return APIResponse.ok(data=res, message="Escalation rule executed successfully")


@router.get("/preferences", response_model=APIResponse[Dict[str, Any]])
async def get_user_preferences():
    """Retrieve user notification preferences across all categories and channels."""
    prefs = await NotificationCenterService.get_preferences()
    return APIResponse.ok(data=prefs, message="Notification preferences retrieved")


@router.put("/preferences", response_model=APIResponse[Dict[str, Any]])
async def update_user_preferences(prefs: UserNotificationPreferences):
    """Update user notification preferences."""
    updated = await NotificationCenterService.update_preferences(prefs.dict())
    return APIResponse.ok(data=updated, message="Notification preferences updated")
