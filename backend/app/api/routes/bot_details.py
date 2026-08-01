from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.db.database import get_db
from app.models.schema import TradeHistory, User
from app.api.deps import get_current_active_user
from app.core.bot_manager import bot_manager

router = APIRouter()

class BotTradeResponse(BaseModel):
    id: int
    symbol: str
    timestamp: datetime
    trade_type: str
    execution_type: str
    price: float
    amount: float
    pnl: Optional[float] = 0.0

class BotDetailsResponse(BaseModel):
    bot_id: str
    is_running: bool
    is_paused: bool
    symbol: str
    mode: str
    config: dict
    recent_trades: List[BotTradeResponse]
    current_pnl: float

@router.get("/{bot_id}", response_model=BotDetailsResponse)
async def get_bot_details(
    bot_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    status = bot_manager.get_bot_status(bot_id)
    if not status:
        raise HTTPException(status_code=404, detail="Bot not found or not active")
        
    engine = bot_manager.active_bots.get(bot_id)
    config = engine.config if engine else {}
    
    # Query recent trades for this bot
    result = await db.execute(
        select(TradeHistory)
        .where(TradeHistory.bot_id == bot_id)
        .order_by(TradeHistory.timestamp.desc())
        .limit(10)
    )
    trades = result.scalars().all()
    
    # Calculate PnL
    # If the user is paper trading, we could also fetch usdt_balance.
    total_pnl = sum([t.pnl for t in trades if t.pnl])
    
    return {
        "bot_id": bot_id,
        "is_running": status["is_running"],
        "is_paused": status["is_paused"],
        "symbol": status["symbol"],
        "mode": status["mode"],
        "config": config,
        "recent_trades": trades,
        "current_pnl": total_pnl
    }
