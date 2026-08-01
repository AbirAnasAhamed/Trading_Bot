from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import random
from datetime import datetime, timedelta

from app.db.database import get_db
from app.models.schema import TradeHistory, User
from app.schemas.trade import TradeHistoryResponse, TradeHistoryCreate
from app.api.deps import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[TradeHistoryResponse])
async def get_trades(
    skip: int = Query(0, description="Skip N records"),
    limit: int = Query(50, description="Limit records to N"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get paginated trade history.
    """
    result = await db.execute(
        select(TradeHistory).order_by(TradeHistory.timestamp.desc()).offset(skip).limit(limit)
    )
    trades = result.scalars().all()
    return trades

@router.post("/dummy", response_model=List[TradeHistoryResponse])
async def create_dummy_trades(
    count: int = Query(5, description="Number of dummy trades to create"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Development only: Generate dummy trade history to test the UI.
    """
    symbols = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT"]
    trade_types = ["BUY", "SELL"]
    execution_types = ["Bot 1 (Grid)", "Bot 2 (DCA)", "Bot 3 (MACD)", "Manual"]
    
    new_trades = []
    base_time = datetime.utcnow()
    
    for i in range(count):
        symbol = random.choice(symbols)
        trade_type = random.choice(trade_types)
        execution_type = random.choice(execution_types)
        
        # random price based on symbol roughly
        if "BTC" in symbol:
            price = random.uniform(60000, 65000)
            amount = random.uniform(0.01, 0.1)
        elif "ETH" in symbol:
            price = random.uniform(3000, 3500)
            amount = random.uniform(0.5, 2.0)
        elif "SOL" in symbol:
            price = random.uniform(130, 160)
            amount = random.uniform(5.0, 20.0)
        else:
            price = random.uniform(200, 600)
            amount = random.uniform(1.0, 5.0)
            
        pnl = random.uniform(-50.0, 150.0) if trade_type == "SELL" else 0.0
        
        trade = TradeHistory(
            symbol=symbol,
            timestamp=base_time - timedelta(minutes=random.randint(1, 1000)),
            trade_type=trade_type,
            execution_type=execution_type,
            price=price,
            amount=amount,
            pnl=pnl
        )
        db.add(trade)
        new_trades.append(trade)
        
    await db.commit()
    
    for trade in new_trades:
        await db.refresh(trade)
        
    return new_trades
