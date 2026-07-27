from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
import uuid
from typing import List
from app.digital_twin.relationships.models import TwinRelationship
from app.digital_twin.relationships.schemas import RelationshipCreate, TwinGraph, GraphNode, GraphEdge
from app.digital_twin.twins.models import DigitalTwin

class RelationshipService:
    async def create(self, db: AsyncSession, data: RelationshipCreate) -> TwinRelationship:
        db_obj = TwinRelationship(
            source_twin_id=data.source_twin_id,
            target_twin_id=data.target_twin_id,
            relationship_type=data.relationship_type,
            metadata_=data.metadata_
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get_graph(self, db: AsyncSession, twin_id: uuid.UUID) -> TwinGraph:
        stmt = select(TwinRelationship).where(
            or_(
                TwinRelationship.source_twin_id == twin_id,
                TwinRelationship.target_twin_id == twin_id
            )
        )
        result = await db.execute(stmt)
        edges_db = result.scalars().all()
        
        edges = []
        node_ids = set([twin_id])
        for e in edges_db:
            edges.append(GraphEdge(source=e.source_twin_id, target=e.target_twin_id, type=e.relationship_type))
            node_ids.add(e.source_twin_id)
            node_ids.add(e.target_twin_id)
            
        nodes = []
        for nid in node_ids:
            twin_stmt = select(DigitalTwin).where(DigitalTwin.id == nid)
            t_res = await db.execute(twin_stmt)
            twin = t_res.scalars().first()
            if twin:
                nodes.append(GraphNode(id=twin.id, name=twin.name))
            else:
                nodes.append(GraphNode(id=nid, name="Unknown"))
                
        return TwinGraph(nodes=nodes, edges=edges)
