from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import uuid

class RelationshipCreate(BaseModel):
    source_twin_id: uuid.UUID
    target_twin_id: uuid.UUID
    relationship_type: str
    metadata_: Optional[Dict[str, Any]] = None

class RelationshipResponse(RelationshipCreate):
    id: uuid.UUID
    
    class Config:
        from_attributes = True

class GraphNode(BaseModel):
    id: uuid.UUID
    name: str

class GraphEdge(BaseModel):
    source: uuid.UUID
    target: uuid.UUID
    type: str

class TwinGraph(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
