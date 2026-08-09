import httpx
import logging
from typing import Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

class TelegramClient:
    """
    A lightweight, asynchronous Telegram client using httpx.
    Reuses a single connection pool for resource optimization.
    """
    _client: Optional[httpx.AsyncClient] = None

    @classmethod
    def get_client(cls) -> httpx.AsyncClient:
        if cls._client is None or cls._client.is_closed:
            # Optimize resource usage by using a persistent connection pool
            limits = httpx.Limits(max_keepalive_connections=10, max_connections=20)
            cls._client = httpx.AsyncClient(limits=limits, timeout=5.0)
        return cls._client

    @classmethod
    async def close_client(cls):
        if cls._client and not cls._client.is_closed:
            await cls._client.aclose()

    @classmethod
    async def send_message(cls, chat_id: str, text: str, parse_mode: str = "HTML") -> bool:
        """
        Sends a text message to a specific Telegram chat_id.
        """
        if not settings.TELEGRAM_BOT_TOKEN:
            logger.warning("Telegram Bot Token is not configured.")
            return False

        if not chat_id:
            logger.warning("Attempted to send telegram message without chat_id.")
            return False

        url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": parse_mode
        }

        try:
            client = cls.get_client()
            response = await client.post(url, json=payload)
            if response.status_code == 200:
                return True
            else:
                logger.error(f"Telegram API Error: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            logger.error(f"Failed to send Telegram message: {str(e)}")
            return False

telegram_client = TelegramClient()

import asyncio
from app.db.database import AsyncSessionLocal
from sqlalchemy.future import select

async def poll_telegram_updates():
    """
    Long polling fallback for Telegram when HTTPS/Webhooks are not available.
    Runs in the background and processes /start commands.
    """
    from app.models.schema import User
    
    offset = 0
    while True:
        if not settings.TELEGRAM_BOT_TOKEN:
            await asyncio.sleep(10)
            continue
            
        url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/getUpdates"
        payload = {"offset": offset, "timeout": 30}
        
        try:
            client = TelegramClient.get_client()
            response = await client.post(url, json=payload, timeout=35.0)
            
            if response.status_code == 200:
                data = response.json()
                for item in data.get("result", []):
                    offset = item["update_id"] + 1
                    message = item.get("message", {})
                    text = message.get("text", "").strip()
                    chat_id = str(message.get("chat", {}).get("id", ""))
                    
                    if text.startswith("/start "):
                        token = text.split(" ")[1].strip()
                        
                        async with AsyncSessionLocal() as session:
                            result = await session.execute(select(User).where(User.telegram_auth_token == token))
                            user = result.scalars().first()
                            
                            if user:
                                user.telegram_chat_id = chat_id
                                user.telegram_notifications_enabled = True
                                user.telegram_auth_token = None
                                await session.commit()
                                
                                await TelegramClient.send_message(
                                    chat_id=chat_id,
                                    text="✅ <b>Account Connected!</b>\n\nYou will now receive trading notifications here."
                                )
                            else:
                                # Check if this chat_id is already connected to avoid sending error messages on double clicks
                                check_existing = await session.execute(select(User).where(User.telegram_chat_id == chat_id))
                                existing_user = check_existing.scalars().first()
                                if existing_user:
                                    # Silently ignore or send a friendly reminder if they click start again
                                    pass
                                else:
                                    # We just ignore invalid tokens entirely to prevent spamming errors on multiple clicks
                                    pass
        except Exception as e:
            logger.error(f"Telegram Polling Error: {e}")
            
        await asyncio.sleep(1)
