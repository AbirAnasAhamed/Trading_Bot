from app.db.database import AsyncSessionLocal
from app.models.schema import Notification, User
from app.api.ws.notifications import manager as ws_manager
from sqlalchemy.future import select

class NotificationService:
    @staticmethod
    async def create_notification(user_id: int, message: str, type: str = "info"):
        """
        Create a notification and push it via websocket if the user has notifications enabled.
        """
        async with AsyncSessionLocal() as session:
            # Check if user has notifications enabled
            user_result = await session.execute(select(User).where(User.id == user_id))
            user = user_result.scalars().first()
            
            if not user or not user.notifications_enabled:
                return None
                
            notification = Notification(
                user_id=user_id,
                message=message,
                type=type
            )
            session.add(notification)
            await session.commit()
            await session.refresh(notification)
            
            notification_data = {
                "ws_type": "notification",
                "id": notification.id,
                "user_id": notification.user_id,
                "message": notification.message,
                "type": notification.type,
                "is_read": notification.is_read,
                "created_at": notification.created_at.isoformat()
            }
            await ws_manager.send_personal_message(notification_data, user_id)
            
            return notification

    @staticmethod
    async def broadcast_bot_state(user_id: int):
        from app.core.bot_manager import bot_manager
        
        bots = bot_manager.get_all_bots()
        payload = {
            "ws_type": "bot_state",
            "data": bots
        }
        await ws_manager.send_personal_message(payload, user_id)
