import redis.asyncio as redis
from app.core.config import settings
from app.core.logger import get_logger

logger = get_logger(__name__)

class RedisClient:
    def __init__(self):
        self.redis = None

    async def connect(self):
        try:
            self.redis = redis.from_url(settings.REDIS_URL, encoding="utf8", decode_responses=True)
            await self.redis.ping()
            logger.info("Successfully connected to Redis.")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")

    async def close(self):
        if self.redis:
            await self.redis.close()
            logger.info("Redis connection closed.")

redis_client = RedisClient()
