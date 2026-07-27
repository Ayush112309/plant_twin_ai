from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List, Optional, Dict, Any
import datetime
from .models import Rule
from .schemas import RuleCreate, RuleUpdate, RuleEvaluationResult

class RuleEngineService:
    async def create_rule(self, db: AsyncSession, data: RuleCreate) -> Rule:
        rule = Rule(**data.model_dump())
        db.add(rule)
        await db.commit()
        await db.refresh(rule)
        return rule

    async def get_rule(self, db: AsyncSession, rule_id: UUID) -> Optional[Rule]:
        result = await db.execute(select(Rule).where(Rule.id == rule_id))
        return result.scalars().first()

    async def list_rules(self, db: AsyncSession) -> List[Rule]:
        result = await db.execute(select(Rule).order_by(Rule.priority.desc()))
        return list(result.scalars().all())

    async def update_rule(self, db: AsyncSession, rule_id: UUID, data: RuleUpdate) -> Optional[Rule]:
        rule = await self.get_rule(db, rule_id)
        if rule:
            for key, value in data.model_dump(exclude_unset=True).items():
                setattr(rule, key, value)
            await db.commit()
            await db.refresh(rule)
        return rule

    async def evaluate_rule(self, db: AsyncSession, rule_id: UUID, context_data: Dict[str, Any]) -> Optional[RuleEvaluationResult]:
        rule = await self.get_rule(db, rule_id)
        if not rule or not rule.is_enabled:
            return None
        
        # Mock evaluation logic
        triggered = True # assume condition met for demo
        actions_executed = []
        if triggered:
            actions_executed = rule.actions
            
        rule.last_evaluated_at = datetime.datetime.utcnow()
        rule.evaluation_count += 1
        await db.commit()
        
        return RuleEvaluationResult(
            rule_id=rule.id,
            is_triggered=triggered,
            actions_executed=actions_executed
        )
