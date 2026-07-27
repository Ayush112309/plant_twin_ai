from enum import Enum


class UserRole(str, Enum):
    """
    User roles for RBAC across the PlantTwin AI platform.
    Aligned with the 5 organizational personas + system-level roles.
    """
    SYSTEM_ADMIN = "SYSTEM_ADMIN"          # Organization System Administrator (full access)
    PLANT_MANAGER = "PLANT_MANAGER"        # Executive leadership & KPI oversight
    MAINTENANCE_MANAGER = "MAINTENANCE_MANAGER"  # Work orders, asset reliability, scheduling
    AI_SPECIALIST = "AI_SPECIALIST"        # ML models, anomaly detection, RUL forecasting
    CONTROL_OPERATOR = "CONTROL_OPERATOR"  # SCADA, telemetry, PLC tag read/write
    VIEWER = "VIEWER"                      # Read-only access across the platform


class InvitationStatus(str, Enum):
    """Status lifecycle for user invitations."""
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    EXPIRED = "EXPIRED"
    REVOKED = "REVOKED"


class AssetStatus(str, Enum):
    RUNNING = "RUNNING"
    IDLE = "IDLE"
    MAINTENANCE = "MAINTENANCE"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"
    OFFLINE = "OFFLINE"


class AlarmSeverity(str, Enum):
    INFO = "INFO"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ConnectionState(str, Enum):
    CONNECTED = "CONNECTED"
    CONNECTING = "CONNECTING"
    DISCONNECTED = "DISCONNECTED"
    ERROR = "ERROR"


class QualityCode(str, Enum):
    GOOD = "GOOD"
    UNCERTAIN = "UNCERTAIN"
    BAD = "BAD"
    OVERFLOW = "OVERFLOW"
