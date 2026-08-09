import secrets
import string
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.models.schema import User
from app.api.deps import get_current_active_user
from pydantic import BaseModel
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class TelegramStatusResponse(BaseModel):
    is_connected: bool
    chat_id: str | None
    notifications_enabled: bool
    bot_username: str

class TelegramToggleRequest(BaseModel):
    enabled: bool

@router.get("/status", response_model=TelegramStatusResponse)
async def get_telegram_status(
    current_user: User = Depends(get_current_active_user),
):
    from app.core.config import settings
    return {
        "is_connected": bool(current_user.telegram_chat_id),
        "chat_id": current_user.telegram_chat_id,
        "notifications_enabled": getattr(current_user, 'telegram_notifications_enabled', False),
        "bot_username": settings.TELEGRAM_BOT_USERNAME
    }

@router.post("/toggle")
async def toggle_telegram_notifications(
    req: TelegramToggleRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if not current_user.telegram_chat_id:
        raise HTTPException(status_code=400, detail="Telegram is not connected")
        
    current_user.telegram_notifications_enabled = req.enabled
    await db.commit()
    return {"status": "success", "enabled": req.enabled}

@router.get("/connect-token")
async def get_telegram_connect_token(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Generates a unique 6-character token for the user to connect their Telegram account.
    """
    if getattr(current_user, 'telegram_auth_token', None):
        token = current_user.telegram_auth_token
    else:
        alphabet = string.ascii_uppercase + string.digits
        token = ''.join(secrets.choice(alphabet) for _ in range(8))
        current_user.telegram_auth_token = token
        await db.commit()
        
    from app.core.config import settings
    return {
        "token": token,
        "bot_username": settings.TELEGRAM_BOT_USERNAME,
        "link": f"https://t.me/{settings.TELEGRAM_BOT_USERNAME}?start={token}" if settings.TELEGRAM_BOT_USERNAME else ""
    }

@router.post("/disconnect")
async def disconnect_telegram(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    current_user.telegram_chat_id = None
    current_user.telegram_notifications_enabled = False
    current_user.telegram_auth_token = None
    await db.commit()
    return {"status": "success"}

@router.post("/webhook")
async def telegram_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Webhook endpoint to receive updates from Telegram.
    This should be configured with BotFather: 
    https://api.telegram.org/bot<TOKEN>/setWebhook?url=<HTTPS_URL>/api/telegram/webhook
    """
    try:
        data = await request.json()
        logger.info(f"Received Telegram webhook: {data}")
    except Exception:
        return {"status": "ok"} # Always return OK to telegram
        
    if "message" in data and "text" in data["message"]:
        text = data["message"]["text"].strip()
        chat_id = str(data["message"]["chat"]["id"])
        
        if text.startswith("/start "):
            token = text.split(" ")[1].strip()
            
            # Find user with this token
            result = await db.execute(select(User).where(User.telegram_auth_token == token))
            user = result.scalars().first()
            
            if user:
                user.telegram_chat_id = chat_id
                user.telegram_notifications_enabled = True
                user.telegram_auth_token = None # invalidate token
                await db.commit()
                
                # Send welcome message
                from app.services.telegram import telegram_client
                import asyncio
                asyncio.create_task(telegram_client.send_message(
                    chat_id=chat_id,
                    text="✅ <b>Account Connected!</b>\n\nYou will now receive trading notifications here."
                ))
            else:
                from app.services.telegram import telegram_client
                import asyncio
                asyncio.create_task(telegram_client.send_message(
                    chat_id=chat_id,
                    text="❌ <b>Invalid or expired connection token.</b>\n\nPlease generate a new link from the dashboard."
                ))

    return {"status": "ok"}
