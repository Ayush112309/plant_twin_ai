from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.database.session import get_db
from app.core.cache.redis_client import redis_manager

router = APIRouter(prefix="/health", tags=["Health & Diagnostics"])


@router.get("")
async def health_check(db: AsyncSession = Depends(get_db)):
    db_status = "HEALTHY"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"UNHEALTHY: {str(e)}"

    redis_status = "HEALTHY" if redis_manager.redis else "OFFLINE"

    return {
        "status": "ONLINE" if db_status == "HEALTHY" else "DEGRADED",
        "service": "PlantTwin AI Backend",
        "version": "2.0.0",
        "components": {
            "database": db_status,
            "redis_cache": redis_status,
        }
    }
