from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.db.database import get_db
from app.models.schema import TradeHistory, User
from app.schemas.trade import TradeHistoryResponse
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
