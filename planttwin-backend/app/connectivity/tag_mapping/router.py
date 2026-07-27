from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import List
from app.core.database.session import get_db
from app.connectivity.tag_mapping.schemas import TagMappingCreate, TagMappingUpdate, TagMappingResponse, TagMappingBulkCreate
from app.connectivity.tag_mapping.service import TagMappingService

router = APIRouter(prefix="/tag-mappings", tags=["Tag Mappings"])
mapping_service = TagMappingService()

@router.post("/", response_model=TagMappingResponse, status_code=status.HTTP_201_CREATED)
async def create_mapping(mapping_in: TagMappingCreate, db: AsyncSession = Depends(get_db)):
    return await mapping_service.create(db=db, mapping_in=mapping_in)

@router.post("/bulk", response_model=List[TagMappingResponse], status_code=status.HTTP_201_CREATED)
async def bulk_create_mappings(bulk_in: TagMappingBulkCreate, db: AsyncSession = Depends(get_db)):
    return await mapping_service.bulk_create(db=db, mappings_in=bulk_in.mappings)

@router.get("/by-connector/{connector_id}", response_model=List[TagMappingResponse])
async def list_mappings_by_connector(connector_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return await mapping_service.list_by_connector(db=db, connector_id=connector_id)

@router.get("/{mapping_id}", response_model=TagMappingResponse)
async def get_mapping(mapping_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    mapping = await mapping_service.get_by_id(db=db, mapping_id=mapping_id)
    if not mapping:
        raise HTTPException(status_code=404, detail="Mapping not found")
    return mapping

@router.put("/{mapping_id}", response_model=TagMappingResponse)
async def update_mapping(mapping_id: uuid.UUID, mapping_in: TagMappingUpdate, db: AsyncSession = Depends(get_db)):
    mapping = await mapping_service.get_by_id(db=db, mapping_id=mapping_id)
    if not mapping:
        raise HTTPException(status_code=404, detail="Mapping not found")
    return await mapping_service.update(db=db, db_mapping=mapping, mapping_in=mapping_in)

@router.delete("/{mapping_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_mapping(mapping_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    mapping = await mapping_service.get_by_id(db=db, mapping_id=mapping_id)
    if not mapping:
        raise HTTPException(status_code=404, detail="Mapping not found")
    await mapping_service.delete(db=db, db_mapping=mapping)
