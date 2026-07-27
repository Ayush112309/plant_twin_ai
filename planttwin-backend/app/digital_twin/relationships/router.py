from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from app.core.database.session import get_db
from app.digital_twin.relationships.schemas import RelationshipCreate, RelationshipResponse, TwinGraph
from app.digital_twin.relationships.service import RelationshipService
from app.shared.responses import APIResponse

router = APIRouter(prefix="/twins/relationships", tags=["Twin Relationships"])
service = RelationshipService()

@router.post("", response_model=APIResponse[RelationshipResponse])
async def create_relationship(data: RelationshipCreate, db: AsyncSession = Depends(get_db)):
    result = await service.create(db, data)
    return APIResponse(data=RelationshipResponse.model_validate(result))

@router.get("/graph/{twin_id}", response_model=APIResponse[TwinGraph])
async def get_graph(twin_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await service.get_graph(db, twin_id)
    return APIResponse(data=result)
