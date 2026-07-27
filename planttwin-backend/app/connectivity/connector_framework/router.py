from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import List
from app.core.database.session import get_db
from app.connectivity.connector_framework.schemas import ConnectorCreate, ConnectorUpdate, ConnectorResponse, ConnectorStatusResponse
from app.connectivity.connector_framework.service import ConnectorService
from app.connectivity.connector_framework.models import ConnectionState

router = APIRouter(prefix="/connectors", tags=["Connectors"])
connector_service = ConnectorService()

@router.post("/", response_model=ConnectorResponse, status_code=status.HTTP_201_CREATED)
async def create_connector(connector_in: ConnectorCreate, db: AsyncSession = Depends(get_db)):
    return await connector_service.create(db=db, connector_in=connector_in)

@router.get("/", response_model=List[ConnectorResponse])
async def list_connectors(db: AsyncSession = Depends(get_db)):
    return await connector_service.list_connectors(db=db)

@router.get("/{connector_id}", response_model=ConnectorResponse)
async def get_connector(connector_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    connector = await connector_service.get_by_id(db=db, connector_id=connector_id)
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    return connector

@router.put("/{connector_id}", response_model=ConnectorResponse)
async def update_connector(connector_id: uuid.UUID, connector_in: ConnectorUpdate, db: AsyncSession = Depends(get_db)):
    connector = await connector_service.get_by_id(db=db, connector_id=connector_id)
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    return await connector_service.update(db=db, db_connector=connector, connector_in=connector_in)

@router.delete("/{connector_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_connector(connector_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    connector = await connector_service.get_by_id(db=db, connector_id=connector_id)
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    await connector_service.delete(db=db, db_connector=connector)

@router.post("/{connector_id}/test")
async def test_connector(connector_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    connector = await connector_service.get_by_id(db=db, connector_id=connector_id)
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    
    success = await connector_service.test_connection(connector)
    if success:
        return {"status": "success", "message": "Connection test passed"}
    return {"status": "failure", "message": "Connection test failed"}

@router.post("/{connector_id}/connect", response_model=ConnectorStatusResponse)
async def connect_connector(connector_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    connector = await connector_service.get_by_id(db=db, connector_id=connector_id)
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    return await connector_service.update_status(db=db, db_connector=connector, status=ConnectionState.CONNECTED)

@router.post("/{connector_id}/disconnect", response_model=ConnectorStatusResponse)
async def disconnect_connector(connector_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    connector = await connector_service.get_by_id(db=db, connector_id=connector_id)
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    return await connector_service.update_status(db=db, db_connector=connector, status=ConnectionState.DISCONNECTED)
