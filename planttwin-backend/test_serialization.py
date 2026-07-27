import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from uuid import UUID

from app.identity.users.models import User
from app.identity.users.schemas import UserResponse
from app.shared.responses import APIResponse
from fastapi.encoders import jsonable_encoder

async def test():
    engine = create_async_engine("sqlite+aiosqlite:///./planttwin.db")
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    org_id = UUID('66c9e978f2834a2ca5909d6c280de626')
    
    async with async_session() as session:
        result = await session.execute(
            select(User).where(User.organization_id == org_id).where(User.is_deleted == False)
        )
        users = result.scalars().all()
        
        try:
            data = [UserResponse.model_validate(user).model_dump() for user in users]
            print("Data:", data)
            api_res = APIResponse(data=data, message="Users retrieved successfully")
            print("APIResponse:", api_res)
            json_res = jsonable_encoder(api_res)
            print("JSON encoded:", json_res)
        except Exception as e:
            import traceback
            traceback.print_exc()

asyncio.run(test())
