from langchain.tools import tool
from sqlalchemy import select, desc
from app.core.database.session import AsyncSessionLocal
from app.assets.equipment.models import Equipment
from app.runtime.alarms.models import Alarm
from app.telemetry.ingestion.models import TelemetryData
from uuid import UUID

@tool
async def get_equipment_status(asset_tag: str) -> str:
    """Gets the current status of a piece of equipment by its asset_tag."""
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Equipment).filter(Equipment.asset_tag == asset_tag))
        equipment = result.scalars().first()
        
        if not equipment:
            return f"Error: No equipment found with asset tag {asset_tag}."
            
        return (f"Equipment {equipment.name} ({asset_tag}) is currently in {equipment.status.value if hasattr(equipment.status, 'value') else equipment.status} state. "
                f"Is active: {equipment.is_active}.")

@tool
async def get_recent_alarms(limit: int = 5) -> str:
    """Gets a list of the most recent active system alarms across all equipment."""
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Alarm).filter(Alarm.is_active == True).order_by(desc(Alarm.created_at)).limit(limit))
        alarms = result.scalars().all()
        
        if not alarms:
            return "No active alarms right now."
            
        alarm_list = "\n".join([f"- {a.severity.value if hasattr(a.severity, 'value') else a.severity} Alarm: {a.name} ({a.created_at})" for a in alarms])
        return f"Recent active alarms:\n{alarm_list}"

@tool
async def get_latest_telemetry(tag: str) -> str:
    """Gets the most recent telemetry value for a specific sensor tag (e.g. 'Reactor-001.temp')."""
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(TelemetryData).filter(TelemetryData.tag == tag).order_by(desc(TelemetryData.timestamp)).limit(1))
        point = result.scalars().first()
        
        if not point:
            return f"No telemetry data found for tag {tag}."
            
        return f"The latest telemetry value for {tag} is {point.value} at {point.timestamp}."
