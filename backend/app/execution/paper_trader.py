from app.execution.base_trader import BaseTrader
from app.core.logger import get_logger
from app.db.database import AsyncSessionLocal
from app.models.schema import TradeHistory

logger = get_logger(__name__)

class PaperTrader(BaseTrader):
    def __init__(self, bot_id: str, user_id: int, initial_balance: float = 10000.0):
        self.bot_id = bot_id
        self.user_id = user_id
        self.initial_balance = initial_balance
        self.usdt_balance = initial_balance
        self.crypto_balance = 0.0
        
    async def execute_buy(self, symbol: str, price: float, amount: float):
        cost = price * amount
        if self.usdt_balance >= cost:
            self.usdt_balance -= cost
            self.crypto_balance += amount
            logger.info(f"[PAPER] BUY {amount} {symbol} @ {price}. USDT Left: {self.usdt_balance}")
            await self._record_trade(symbol, 'buy', price, amount)
            from app.services.notification_manager import NotificationService
            await NotificationService.create_notification(self.user_id, f"🟩 PAPER BUY: {amount} {symbol} @ ${price:.4f}", "info")
        else:
            logger.warning(f"[PAPER] Insufficient USDT for BUY. Need: {cost}, Have: {self.usdt_balance}")
            
    async def execute_sell(self, symbol: str, price: float, amount: float):
        if self.crypto_balance >= amount:
            revenue = price * amount
            self.crypto_balance -= amount
            self.usdt_balance += revenue
            logger.info(f"[PAPER] SELL {amount} {symbol} @ {price}. USDT Total: {self.usdt_balance}")
            await self._record_trade(symbol, 'sell', price, amount)
            from app.services.notification_manager import NotificationService
            await NotificationService.create_notification(self.user_id, f"🟥 PAPER SELL: {amount} {symbol} @ ${price:.4f}", "info")
        else:
            logger.warning(f"[PAPER] Insufficient crypto for SELL. Need: {amount}, Have: {self.crypto_balance}")

    async def _record_trade(self, symbol: str, trade_type: str, price: float, amount: float):
        async with AsyncSessionLocal() as session:
            trade = TradeHistory(
                symbol=symbol,
                trade_type=trade_type,
                execution_type='paper',
                bot_id=self.bot_id,
                price=price,
                amount=amount
            )
            session.add(trade)
            await session.commit()

    async def get_pnl(self) -> float:
        return self.usdt_balance - self.initial_balance
