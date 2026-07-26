from fastapi import APIRouter
from pydantic import BaseModel
from app.core.engine import bot_engine
import asyncio

router = APIRouter()

class BotState(BaseModel):
    is_running: bool
    symbol: str
    mode: str # 'paper' or 'real'

@router.get("/state", response_model=BotState)
async def get_bot_state():
    symbol = "BTCUSDT"
    mode = "paper"
    if bot_engine.processor:
        symbol = bot_engine.processor.symbol
    if bot_engine.trader:
        mode = "real" if bot_engine.trader.__class__.__name__ == "RealTrader" else "paper"
        
    return BotState(is_running=bot_engine.is_running, symbol=symbol, mode=mode)

@router.post("/start")
async def start_bot():
    if bot_engine.is_running:
        return {"message": "Bot is already running"}
    
    # Start in background task to not block the API
    asyncio.create_task(bot_engine.start("BTCUSDT", "paper"))
    return {"message": "Bot started"}

@router.post("/stop")
async def stop_bot():
    if not bot_engine.is_running:
        return {"message": "Bot is not running"}
        
    await bot_engine.stop()
    return {"message": "Bot stopped"}
