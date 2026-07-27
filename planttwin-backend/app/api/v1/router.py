"""
PlantTwin AI Backend v2.0 — Unified API v1 Router
===================================================
Aggregates all domain module routers into a single versioned API gateway.

NOTE: Each domain aggregator router (e.g. app/ai/router.py) already defines
its own prefix (e.g. "/ai"). We do NOT re-add prefixes here to avoid
path duplication like /api/v1/ai/ai/...
"""
from fastapi import APIRouter

# --- Domain Routers ---
from app.identity.router import router as identity_router
from app.enterprise.router import router as enterprise_router
from app.assets.router import router as assets_router
from app.connectivity.router import router as connectivity_router
from app.telemetry.router import router as telemetry_router
from app.digital_twin.router import router as digital_twin_router
from app.ai.router import router as ai_router
from app.runtime.router import router as runtime_router
from app.reporting.router import router as reporting_router
from app.notifications.router import router as notifications_router
from app.enterprise_admin.router import router as enterprise_admin_router
from app.integrations.router import router as integrations_router
from app.files.router import router as files_router

# --- Core Routers ---
from app.core.health.router import router as health_router
from app.core.search.router import router as search_router

api_v1_router = APIRouter()

# ── Core Platform Services ────────────────────
api_v1_router.include_router(health_router)
api_v1_router.include_router(search_router)

# ── Identity & Access Management ──────────────
api_v1_router.include_router(identity_router, tags=["Identity"])

# ── Enterprise Hierarchy ──────────────────────
api_v1_router.include_router(enterprise_router, tags=["Enterprise"])

# ── Asset Management ─────────────────────────
api_v1_router.include_router(assets_router, tags=["Assets"])

# ── Industrial Connectivity ──────────────────
api_v1_router.include_router(connectivity_router, tags=["Connectivity"])

# ── Telemetry & Data Pipeline ────────────────
api_v1_router.include_router(telemetry_router, tags=["Telemetry"])

# ── Digital Twin Engine ──────────────────────
api_v1_router.include_router(digital_twin_router, tags=["Digital Twin"])

# ── AI Intelligence ──────────────────────────
api_v1_router.include_router(ai_router, tags=["AI"])

# ── Runtime & Operations ─────────────────────
api_v1_router.include_router(runtime_router, tags=["Runtime"])

# ── Reporting & Analytics ────────────────────
api_v1_router.include_router(reporting_router, tags=["Reporting"])

# ── Notifications ────────────────────────────
api_v1_router.include_router(notifications_router, tags=["Notifications"])

# ── Enterprise Administration ────────────────
api_v1_router.include_router(enterprise_admin_router, tags=["Enterprise Admin"])

# ── Third-Party Integrations ─────────────────
api_v1_router.include_router(integrations_router, tags=["Integrations"])

# ── File Management ──────────────────────────
api_v1_router.include_router(files_router, tags=["Files"])
