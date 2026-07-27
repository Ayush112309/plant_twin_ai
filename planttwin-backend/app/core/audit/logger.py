from datetime import datetime, timezone
from typing import Optional, Dict, Any
from app.core.logging.logger import logger

class AuditLogger:
    """Security and compliance audit logger."""

    @staticmethod
    async def log(
        action: str,
        user_id: Optional[str] = None,
        tenant_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        status: str = "SUCCESS"
    ):
        audit_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "action": action,
            "user_id": user_id or "SYSTEM",
            "tenant_id": tenant_id or "GLOBAL",
            "resource_type": resource_type,
            "resource_id": resource_id,
            "status": status,
            "details": details or {}
        }
        logger.info(f"AUDIT_EVENT: {action}", **audit_entry)


audit_logger = AuditLogger()
