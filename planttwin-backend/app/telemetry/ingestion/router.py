from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database.session import get_db
from app.telemetry.ingestion.schemas import TelemetryDataPoint, TelemetryBatchIngest, TelemetryResponse
from app.telemetry.ingestion.service import TelemetryIngestionService
from app.shared.responses import APIResponse
import uuid
from app.identity.authentication.dependencies import get_current_org_id, require_role
from app.shared.enums import UserRole

router = APIRouter(prefix="/ingest", tags=["Telemetry Ingestion"])
service = TelemetryIngestionService()

require_system_ingest = require_role(UserRole.SYSTEM_ADMIN, UserRole.CONTROL_OPERATOR)

@router.post("", response_model=APIResponse[TelemetryResponse], dependencies=[Depends(require_system_ingest)])
async def ingest_single(data: TelemetryDataPoint, org_id: uuid.UUID = Depends(get_current_org_id), db: AsyncSession = Depends(get_db)):
    if org_id and not data.organization_id:
        data.organization_id = org_id
    result = await service.ingest_single(db, data)
    return APIResponse(data=TelemetryResponse.model_validate(result))

@router.post("/batch", response_model=APIResponse[list[TelemetryResponse]], dependencies=[Depends(require_system_ingest)])
async def ingest_batch(data: TelemetryBatchIngest, org_id: uuid.UUID = Depends(get_current_org_id), db: AsyncSession = Depends(get_db)):
    if org_id:
        for dp in data.data_points:
            if not dp.organization_id:
                dp.organization_id = org_id
    results = await service.ingest_batch(db, data)
    return APIResponse(data=[TelemetryResponse.model_validate(r) for r in results])
