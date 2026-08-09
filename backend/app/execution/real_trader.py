import ccxt.async_support as ccxt
from app.execution.base_trader import BaseTrader
from app.core.config import settings
from app.core.logger import get_logger
from app.db.database import AsyncSessionLocal
from app.models.schema import TradeHistory

logger = get_logger(__name__)

class RealTrader(BaseTrader):
    def __init__(self, bot_id: str, user_id: int, exchange_id: str, api_key: str, api_secret: str):
        self.bot_id = bot_id
        self.user_id = user_id
        try:
            exchange_class = getattr(ccxt, exchange_id)
        except AttributeError:
            logger.error(f"Exchange {exchange_id} is not supported by CCXT")
            raise ValueError(f"Exchange {exchange_id} is not supported")
            
        self.exchange = exchange_class({
            'apiKey': api_key,
            'secret': api_secret,
            'enableRateLimit': True,
            'options': {
                'defaultType': 'spot',
            }
        })
        if settings.USE_TESTNET:
            self.exchange.set_sandbox_mode(True)
            logger.info(f"RealTrader initialized for {exchange_id} in TESTNET (Sandbox) mode.")
        else:
            logger.warning(f"RealTrader initialized for {exchange_id} in LIVE mode. Real funds will be used.")

    async def execute_buy(self, symbol: str, price: float, amount: float):
        try:
            order = await self.exchange.create_market_buy_order(symbol, amount)
            executed_price = order['average'] if order.get('average') else price
            logger.info(f"[REAL] BUY Executed: {amount} {symbol} @ {executed_price}")
            await self._record_trade(symbol, 'buy', executed_price, amount)
            from app.services.notification_manager import NotificationService
            await NotificationService.create_notification(self.user_id, f"🟢 REAL BUY: {amount} {symbol} @ ${executed_price:.4f}", "info")
        except Exception as e:
            logger.error(f"[REAL] BUY failed: {e}")
            from app.services.notification_manager import NotificationService
            await NotificationService.create_notification(self.user_id, f"❌ REAL BUY FAILED: {symbol} - {e}", "error")
            
    async def execute_sell(self, symbol: str, price: float, amount: float):
        try:
            order = await self.exchange.create_market_sell_order(symbol, amount)
            executed_price = order['average'] if order.get('average') else price
            logger.info(f"[REAL] SELL Executed: {amount} {symbol} @ {executed_price}")
            await self._record_trade(symbol, 'sell', executed_price, amount)
            from app.services.notification_manager import NotificationService
            await NotificationService.create_notification(self.user_id, f"🔴 REAL SELL: {amount} {symbol} @ ${executed_price:.4f}", "info")
        except Exception as e:
            logger.error(f"[REAL] SELL failed: {e}")
            from app.services.notification_manager import NotificationService
            await NotificationService.create_notification(self.user_id, f"❌ REAL SELL FAILED: {symbol} - {e}", "error")

    async def _record_trade(self, symbol: str, trade_type: str, price: float, amount: float):
        async with AsyncSessionLocal() as session:
            trade = TradeHistory(
                symbol=symbol,
                trade_type=trade_type,
                execution_type='real',
                bot_id=self.bot_id,
                price=price,
                amount=amount
            )
            session.add(trade)
            await session.commit()
            
    async def get_pnl(self) -> float:
        # In a real trading bot, you would track initial balance or query exchange balance.
        return 0.0

    async def close(self):
        await self.exchange.close()
