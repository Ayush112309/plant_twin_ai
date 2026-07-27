import asyncio
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context
from app.core.config.settings import settings
from app.shared.mixins.base_model import Base

config = context.config

if config.config_file_name:
    fileConfig(config.config_file_name)

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

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    url = settings.SQLALCHEMY_DATABASE_URI
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations() -> None:
    configuration = config.get_section(config.config_ini_section) or {}
    configuration["sqlalchemy.url"] = settings.SQLALCHEMY_DATABASE_URI
    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
