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
                "symbol": getattr(engine.processor, 'symbol', 'Unknown') if engine.processor else 'Unknown',
                "mode": "real" if engine.trader and engine.trader.__class__.__name__ == "RealTrader" else "paper"
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
            "symbol": getattr(engine.processor, 'symbol', 'Unknown') if engine.processor else 'Unknown',
            "mode": "real" if engine.trader and engine.trader.__class__.__name__ == "RealTrader" else "paper"
        }

    async def start_bot(self, bot_id: str, symbol: str, mode: str, wall_multiplier: float, trade_amount: float, min_wall_volume: float, take_profit: float, stop_loss: float):
        if bot_id in self.active_bots and self.active_bots[bot_id].is_running:
            logger.warning(f"Bot {bot_id} is already running.")
            return False

        logger.info(f"BotManager: Initializing new BotEngine for {bot_id}")
        engine = BotEngine(bot_id=bot_id)
        self.active_bots[bot_id] = engine
        
        # We launch it asynchronously 
        asyncio.create_task(engine.start(
            symbol=symbol,
            mode=mode,
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
        
        del self.active_bots[bot_id]
        logger.info(f"BotManager: Stopped and removed bot {bot_id}")
        return True

# Singleton manager
bot_manager = BotManager()
