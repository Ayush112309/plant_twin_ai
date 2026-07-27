"""
PlantTwin AI Backend — Global Search Service
============================================
Global search engine across equipment, telemetry tags, alarms, and digital twins.
"""
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.assets.equipment.models import Equipment
from app.runtime.alarms.models import Alarm
from app.digital_twin.twins.models import DigitalTwin


class SearchService:
    """Global search service for Ctrl+K command palette."""

    @staticmethod
    async def global_search(db: AsyncSession, query: str) -> Dict[str, List[Any]]:
        search_pattern = f"%{query}%"

        # Search Equipment
        eq_stmt = select(Equipment).where(
            or_(
                Equipment.name.ilike(search_pattern),
                Equipment.asset_tag.ilike(search_pattern),
                Equipment.equipment_type.ilike(search_pattern)
            )
        ).limit(10)
        eq_res = await db.execute(eq_stmt)
        equipment_matches = [
            {"id": str(e.id), "title": e.name, "subtitle": e.asset_tag, "type": "equipment"}
            for e in eq_res.scalars().all()
        ]

        # Search Alarms
        alm_stmt = select(Alarm).where(
            or_(
                Alarm.name.ilike(search_pattern),
                Alarm.source_id.ilike(search_pattern)
            )
        ).limit(10)
        alm_res = await db.execute(alm_stmt)
        alarm_matches = [
            {"id": str(a.id), "title": a.name, "subtitle": a.source_id, "type": "alarm"}
            for a in alm_res.scalars().all()
        ]

        # Search Twins
        twin_stmt = select(DigitalTwin).where(
            or_(
                DigitalTwin.name.ilike(search_pattern),
                DigitalTwin.twin_type.ilike(search_pattern)
            )
        ).limit(10)
        twin_res = await db.execute(twin_stmt)
        twin_matches = [
            {"id": str(t.id), "title": t.name, "subtitle": t.twin_type, "type": "digital_twin"}
            for t in twin_res.scalars().all()
        ]

        return {
            "equipment": equipment_matches,
            "alarms": alarm_matches,
            "digital_twins": twin_matches,
            "total_results": len(equipment_matches) + len(alarm_matches) + len(twin_matches)
        }
