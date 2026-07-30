import json
from typing import Any, Optional
import redis.asyncio as aioredis
from app.core.config.settings import settings
from app.core.logging.logger import logger

class RedisManager:
    def __init__(self):
        self.redis: Optional[aioredis.Redis] = None

    async def init(self):
        try:
            self.redis = aioredis.from_url(
                settings.REDIS_URI,
                encoding="utf-8",
                decode_responses=True,
                protocol=2,
                socket_connect_timeout=0.5,
                socket_timeout=0.5,
            )
            await self.redis.ping()
            logger.info("Connected to Redis server successfully.")
        except Exception as e:
            logger.warning(f"Redis cache not connected ({e}). Running seamlessly without Redis cache.")
            self.redis = None

    async def close(self):
        if self.redis:
            await self.redis.close()

    async def get(self, key: str) -> Optional[Any]:
        if not self.redis:
            return None
        try:
            val = await self.redis.get(key)
            return json.loads(val) if val else None
        except Exception as e:
            logger.error(f"Redis get error for key {key}: {e}")
            return None

    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        if not self.redis:
            return False
        try:
            serialized = json.dumps(value)
            if ttl:
                await self.redis.setex(key, ttl, serialized)
            else:
                await self.redis.set(key, serialized)
            return True
        except Exception as e:
            logger.error(f"Redis set error for key {key}: {e}")
            return False

    async def delete(self, key: str) -> bool:
        if not self.redis:
            return False
        try:
            await self.redis.delete(key)
            return True
        except Exception as e:
            logger.error(f"Redis delete error for key {key}: {e}")
            return False


redis_manager = RedisManager()
