from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database.session import get_db
from app.connectivity.connector_framework.service import ConnectorService

router = APIRouter(prefix="/health", tags=["Connectivity Health"])
connector_service = ConnectorService()

@router.get("/")
async def get_connectivity_health(db: AsyncSession = Depends(get_db)):
    connectors = await connector_service.list_connectors(db=db)
    status_summary = {
        "total": len(connectors),
        "connected": sum(1 for c in connectors if c.status.value == "CONNECTED"),
        "disconnected": sum(1 for c in connectors if c.status.value == "DISCONNECTED"),
        "error": sum(1 for c in connectors if c.status.value == "ERROR"),
    }
    return {"status": "ok", "connectors": status_summary}
