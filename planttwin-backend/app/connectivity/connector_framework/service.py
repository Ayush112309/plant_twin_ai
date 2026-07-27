from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid
from typing import List, Optional
from datetime import datetime
from app.connectivity.connector_framework.models import Connector, ConnectionState
from app.connectivity.connector_framework.schemas import ConnectorCreate, ConnectorUpdate

class ConnectorService:
    async def get_by_id(self, db: AsyncSession, connector_id: uuid.UUID) -> Optional[Connector]:
        result = await db.execute(select(Connector).filter(Connector.id == connector_id))
        return result.scalars().first()

    async def list_connectors(self, db: AsyncSession) -> List[Connector]:
        result = await db.execute(select(Connector))
        return result.scalars().all()

    async def create(self, db: AsyncSession, connector_in: ConnectorCreate) -> Connector:
        db_connector = Connector(**connector_in.model_dump())
        db.add(db_connector)
        await db.commit()
        await db.refresh(db_connector)
        return db_connector

    async def update(self, db: AsyncSession, db_connector: Connector, connector_in: ConnectorUpdate) -> Connector:
        update_data = connector_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_connector, field, value)
        await db.commit()
        await db.refresh(db_connector)
        return db_connector

    async def delete(self, db: AsyncSession, db_connector: Connector) -> None:
        await db.delete(db_connector)
        await db.commit()

    async def update_status(self, db: AsyncSession, db_connector: Connector, status: ConnectionState, error_message: Optional[str] = None) -> Connector:
        db_connector.status = status
        db_connector.error_message = error_message
        if status == ConnectionState.CONNECTED:
            db_connector.last_connected_at = datetime.utcnow()
        await db.commit()
        await db.refresh(db_connector)
        return db_connector
        
    async def test_connection(self, db_connector: Connector) -> bool:
        # Mock connection test
        if db_connector.host and db_connector.port:
            return True
        return False
