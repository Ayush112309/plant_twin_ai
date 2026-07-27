import asyncio
import os
from sqlalchemy import text
from app.core.database.session import AsyncSessionLocal

from datetime import datetime, timezone
import uuid

async def check():
    async with AsyncSessionLocal() as db:
        res = await db.execute(text("SELECT COUNT(*) FROM organizations"))
        print("Orgs:", res.scalar())
        res = await db.execute(text("SELECT COUNT(*) FROM telemetry_data"))
        print("Telemetry:", res.scalar())

asyncio.run(check())
