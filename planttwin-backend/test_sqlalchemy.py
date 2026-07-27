import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from uuid import UUID

from app.identity.users.models import User
from app.identity.users.schemas import UserResponse

async def test():
    engine = create_async_engine("sqlite+aiosqlite:///./planttwin.db")
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    org_id = UUID('66c9e978f2834a2ca5909d6c280de626')
    
    async with async_session() as session:
        result = await session.execute(
            select(User).where(User.organization_id == org_id).where(User.is_deleted == False)
        )
        users = result.scalars().all()
        for user in users:
            print("USER FROM DB:", user.__dict__)
            try:
                resp = UserResponse.model_validate(user)
                print("VALIDATED:", resp)
            except Exception as e:
                print("VALIDATION ERROR:", e)

asyncio.run(test())
