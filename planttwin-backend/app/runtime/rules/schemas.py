from pydantic import BaseModel, ConfigDict
from typing import Dict, Any, Optional, List
from uuid import UUID
from datetime import datetime

class RuleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    rule_type: str
    conditions: Dict[str, Any]
    actions: List[Dict[str, Any]]
    priority: int = 0
    is_enabled: bool = True

class RuleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    conditions: Optional[Dict[str, Any]] = None
    actions: Optional[List[Dict[str, Any]]] = None
    priority: Optional[int] = None
    is_enabled: Optional[bool] = None

class RuleResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    rule_type: str
    conditions: Dict[str, Any]
    actions: List[Dict[str, Any]]
    priority: int
    is_enabled: bool
    last_evaluated_at: Optional[datetime] = None
    evaluation_count: int
    
    model_config = ConfigDict(from_attributes=True)

class RuleEvaluationResult(BaseModel):
    rule_id: UUID
    is_triggered: bool
    actions_executed: List[Dict[str, Any]]
