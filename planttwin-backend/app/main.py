"""
PlantTwin AI Backend v2.0 — Verified End-to-End
================================================
Enterprise-grade Industrial Digital Twin & IoT Platform

FastAPI Application Entrypoint
"""
from fastapi import FastAPI
from app.core.config.settings import settings
from app.core.startup.lifespan import lifespan
from app.core.middleware.middleware import setup_middleware
from app.api.v1.router import api_v1_router


def create_app() -> FastAPI:
    """Factory function to create and configure the FastAPI application."""

    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description=(
            "PlantTwin AI Backend v2.0 — An enterprise-grade Industrial IoT and "
            "Digital Twin platform with live Siemens PLC connectivity, real-time "
            "telemetry streaming, AI-powered anomaly detection & predictive maintenance, "
            "Digital Twin state synchronization, and comprehensive runtime operations."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        lifespan=lifespan,
    )

    # ── Middleware ─────────────────────────────────────────
    setup_middleware(app)

    # ── API v1 Routes ─────────────────────────────────────
    app.include_router(api_v1_router, prefix=settings.API_V1_STR)

    # ── Root Endpoint ─────────────────────────────────────
    @app.get("/", tags=["Root"])
    async def root():
        return {
            "service": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "status": "ONLINE",
            "docs": "/docs",
            "api": f"{settings.API_V1_STR}/health",
        }

    return app


app = create_app()
