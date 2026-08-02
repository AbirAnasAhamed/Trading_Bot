from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any

from app.db.database import get_db
from app.models.schema import User
from app.api.deps import get_current_active_user
from app.services.portfolio_service import PortfolioService

router = APIRouter()

@router.get("/overview")
async def get_portfolio_overview(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get aggregated portfolio overview data for the user dashboard.
    This includes total balance across all connected exchanges, 
    total realized profit, active bots count, and historical growth chart data.
    """
    return await PortfolioService.get_overview(current_user, db)
