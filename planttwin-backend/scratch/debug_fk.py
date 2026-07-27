import app.ai.anomaly_detection.models
import app.ai.feedback.models
import app.ai.health.models
import app.ai.model_registry.models
import app.ai.prediction.models
import app.assets.asset_history.models
import app.assets.documents.models
import app.assets.equipment.models
import app.assets.sensors.models
import app.connectivity.connector_framework.models
import app.connectivity.tag_mapping.models
import app.digital_twin.relationships.models
import app.digital_twin.snapshots.models
import app.digital_twin.twins.models
import app.enterprise.areas.models
import app.enterprise.organizations.models
import app.enterprise.plants.models
import app.enterprise.production_lines.models
import app.enterprise_admin.audit_logs.models
import app.enterprise_admin.licensing.models
import app.enterprise_admin.tenants.models
import app.files.uploads.models
import app.identity.api_keys.models
import app.identity.invitations.models
import app.identity.roles.models
import app.identity.users.models
import app.integrations.api_clients.models
import app.integrations.webhook.models
import app.notifications.channels.models
import app.notifications.preferences.models
import app.notifications.templates.models
import app.reporting.dashboard.models
import app.reporting.reports.models
import app.reporting.templates.models
import app.runtime.alarms.models
import app.runtime.incident_management.models
import app.runtime.rules.models
import app.runtime.work_orders.models
import app.telemetry.historian.models
import app.telemetry.ingestion.models

from app.telemetry.ingestion.models import TelemetryData
from sqlalchemy.orm import configure_mappers
configure_mappers()

fk = list(TelemetryData.__table__.c.sensor_id.foreign_keys)[0]
try:
    print(fk.column)
    print("SUCCESS")
except Exception as e:
    import traceback
    traceback.print_exc()
