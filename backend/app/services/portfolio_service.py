import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.models.schema import User, ExchangeKey, TradeHistory
from app.core.security import decrypt_data
from app.services.ccxt_manager import CCXTManager
from app.core.bot_manager import bot_manager
from app.core.logger import get_logger

logger = get_logger(__name__)

class PortfolioService:
    
    @staticmethod
    async def get_overview(user: User, db: AsyncSession) -> Dict[str, Any]:
        # 1. Fetch active bots
        active_bots_count = PortfolioService._get_active_bots_count()
        
        # 2. Fetch total profit (Realized + Unrealized)
        total_profit = await PortfolioService._get_total_profit(db)
        
        # 3. Fetch total balance concurrently
        total_balance_usdt = await PortfolioService._get_total_balance(user, db)
        
        # 4. Generate portfolio growth chart and calculate 7-day change
        chart_data, balance_change_percent = await PortfolioService._get_portfolio_growth(db, total_balance_usdt, total_profit)
        
        return {
            "total_balance_usdt": round(total_balance_usdt, 2),
            "balance_change_percent": round(balance_change_percent, 2),
            "total_profit": round(total_profit, 2),
            "active_bots_count": active_bots_count,
            "portfolio_growth": chart_data
        }

    @staticmethod
    def _get_active_bots_count() -> int:
        active_bots_list = bot_manager.get_all_bots()
        return len([b for b in active_bots_list if b.is_running])

    @staticmethod
    async def _get_total_profit(db: AsyncSession) -> float:
        result = await db.execute(select(func.sum(TradeHistory.pnl)))
        realized_profit = result.scalar() or 0.0
        
        unrealized_profit = 0.0
        active_bots = bot_manager.get_all_bots()
        for bot in active_bots:
            if bot.get('is_running'):
                unrealized_profit += bot.get('current_pnl', 0.0)
                
        return realized_profit + unrealized_profit

    @staticmethod
    async def _fetch_single_balance(key: ExchangeKey) -> float:
        balance_usdt = 0.0
        ex = None
        try:
            api_key = decrypt_data(key.encrypted_api_key)
            api_secret = decrypt_data(key.encrypted_api_secret)
            passphrase = decrypt_data(key.encrypted_passphrase) if key.encrypted_passphrase else None
            
            ex = await CCXTManager.create_authenticated_instance(
                key.exchange_id, api_key, api_secret, passphrase
            )
            
            balance = await ex.fetch_balance()
            if 'USDT' in balance.get('total', {}):
                balance_usdt += balance['total']['USDT']
            if 'USDC' in balance.get('total', {}):
                balance_usdt += balance['total']['USDC']
                
        except Exception as e:
            logger.error(f"Error fetching balance for {key.exchange_id}: {e}")
        finally:
            if ex:
                await ex.close()
                
        return balance_usdt

    @staticmethod
    async def _get_total_balance(user: User, db: AsyncSession) -> float:
        keys_result = await db.execute(
            select(ExchangeKey).where(
                ExchangeKey.user_id == user.id,
                ExchangeKey.is_active == True
            )
        )
        keys = keys_result.scalars().all()
        
        # Fetch balances concurrently for faster response
        tasks = [PortfolioService._fetch_single_balance(key) for key in keys]
        balances = await asyncio.gather(*tasks)
        
        return sum(balances)

    @staticmethod
    async def _get_portfolio_growth(db: AsyncSession, total_balance: float, total_profit: float) -> tuple[List[Dict[str, Any]], float]:
        seven_days_ago = datetime.utcnow() - timedelta(days=6)
        trades_result = await db.execute(
            select(TradeHistory).where(TradeHistory.timestamp >= seven_days_ago).order_by(TradeHistory.timestamp.asc())
        )
        recent_trades = trades_result.scalars().all()
        
        chart_data = []
        current_date = seven_days_ago.date()
        end_date = datetime.utcnow().date()
        
        baseline = total_balance - total_profit if total_balance > 0 else 10000.0
        current_value = baseline
        
        daily_pnl = {}
        for t in recent_trades:
            d = t.timestamp.date()
            daily_pnl[d] = daily_pnl.get(d, 0.0) + t.pnl
            
        while current_date <= end_date:
            pnl = daily_pnl.get(current_date, 0.0)
            current_value += pnl
            chart_data.append({
                "name": current_date.strftime("%a"),
                "value": round(current_value, 2)
            })
            current_date += timedelta(days=1)
            
            
        if not recent_trades and total_balance == 0:
            chart_data = [{"name": (seven_days_ago + timedelta(days=i)).strftime("%a"), "value": 0} for i in range(7)]

        # Calculate percentage change from baseline (7 days ago) to current total balance
        balance_change_percent = 0.0
        if baseline > 0:
            balance_change_percent = ((total_balance - baseline) / baseline) * 100.0

        return chart_data, balance_change_percent
