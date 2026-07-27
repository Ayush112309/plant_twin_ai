"""
PlantTwin AI Backend v2.0 — Application Lifespan
==================================================
Startup and shutdown hooks for initializing and tearing down services.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.core.logging.logger import setup_logging, logger
from app.core.cache.redis_client import redis_manager


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager — runs on startup and shutdown."""

    # ── Startup ───────────────────────────────────────────
    setup_logging()
    logger.info("=" * 60)
    logger.info("  PlantTwin AI Backend v2.0 — Starting Up  ")
    logger.info("=" * 60)

    # Initialize Database Tables for SQLite
    from app.core.database.session import engine
    from app.shared.mixins.base_model import Base
    
    # Import all models to ensure they are registered with Base metadata
    import app.identity.users.models
    import app.identity.invitations.models
    import app.enterprise.organizations.models
    
    # Run database migrations automatically
    try:
        import asyncio
        from alembic.config import Config
        from alembic import command
        alembic_cfg = Config("alembic.ini")
        await asyncio.to_thread(command.upgrade, alembic_cfg, "head")
        logger.info("Database migrations applied successfully (Alembic upgrade head).")
    except Exception as e:
        logger.error(f"Failed to apply database migrations: {e}")
        
    logger.info("Database connection pool initialized.")

    # Initialize Redis cache
    await redis_manager.init()
    logger.info("Redis cache initialized.")

    logger.info("PlantTwin AI Backend is READY.")
    logger.info("=" * 60)

    yield

    # ── Shutdown ──────────────────────────────────────────
    logger.info("PlantTwin AI Backend — Shutting Down...")
    await redis_manager.close()
    logger.info("All connections closed. Goodbye.")
