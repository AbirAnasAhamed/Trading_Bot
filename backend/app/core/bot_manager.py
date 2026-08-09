from typing import Dict, Any
import asyncio
from app.core.engine import BotEngine
from app.core.logger import get_logger

logger = get_logger(__name__)

class BotManager:
    def __init__(self):
        self.active_bots: Dict[str, BotEngine] = {}

    def get_all_bots(self) -> list:
        bots_info = []
        for bot_id, engine in self.active_bots.items():
            info = {
                "bot_id": bot_id,
                "is_running": engine.is_running,
                "is_paused": engine.is_paused,
                "symbol": engine.config.get('symbol', 'Unknown'),
                "mode": engine.config.get('mode', 'paper'),
                "current_pnl": getattr(engine, 'current_pnl', 0.0)
            }
            bots_info.append(info)
        return bots_info

    def get_bot_status(self, bot_id: str) -> dict:
        if bot_id not in self.active_bots:
            return None
        engine = self.active_bots[bot_id]
        return {
            "bot_id": bot_id,
            "is_running": engine.is_running,
            "is_paused": engine.is_paused,
            "symbol": engine.config.get('symbol', 'Unknown'),
            "mode": engine.config.get('mode', 'paper'),
            "current_pnl": getattr(engine, 'current_pnl', 0.0)
        }

    async def start_bot(self, bot_id: str, user_id: int, symbol: str=None, mode: str=None, exchange_id: str=None, api_key: str=None, api_secret: str=None, wall_multiplier: float=3.0, trade_amount: float=0.01, min_wall_volume: float=10000.0, take_profit: float=2.0, stop_loss: float=1.0):
        if bot_id in self.active_bots:
            engine = self.active_bots[bot_id]
            if engine.is_running:
                logger.warning(f"Bot {bot_id} is already running.")
                return False
            logger.info(f"BotManager: Restarting BotEngine for {bot_id}")
            asyncio.create_task(engine.start())
            return True

        logger.info(f"BotManager: Initializing new BotEngine for {bot_id} (User: {user_id})")
        engine = BotEngine(bot_id=bot_id, user_id=user_id)
        self.active_bots[bot_id] = engine
        
        # We launch it asynchronously 
        asyncio.create_task(engine.start(
            symbol=symbol,
            mode=mode,
            exchange_id=exchange_id,
            api_key=api_key,
            api_secret=api_secret,
            wall_multiplier=wall_multiplier,
            trade_amount=trade_amount,
            min_wall_volume=min_wall_volume,
            take_profit=take_profit,
            stop_loss=stop_loss
        ))
        return True

    async def stop_bot(self, bot_id: str):
        if bot_id not in self.active_bots:
            logger.warning(f"BotManager: Bot {bot_id} not found.")
            return False
            
        engine = self.active_bots[bot_id]
        if engine.is_running:
            await engine.stop()
        
        logger.info(f"BotManager: Stopped bot {bot_id}")
        return True

    async def delete_bot(self, bot_id: str):
        if bot_id not in self.active_bots:
            logger.warning(f"BotManager: Bot {bot_id} not found.")
            return False
            
        engine = self.active_bots[bot_id]
        if engine.is_running:
            await engine.stop()
        
        del self.active_bots[bot_id]
        logger.info(f"BotManager: Deleted bot {bot_id}")
        return True

    def pause_bot(self, bot_id: str):
        if bot_id in self.active_bots:
            self.active_bots[bot_id].pause()
            return True
        return False

    def resume_bot(self, bot_id: str):
        if bot_id in self.active_bots:
            self.active_bots[bot_id].resume()
            return True
        return False

# Singleton manager
bot_manager = BotManager()
