import ccxt.async_support as ccxt
from app.execution.base_trader import BaseTrader
from app.core.config import settings
from app.core.logger import get_logger
from app.db.database import AsyncSessionLocal
from app.models.schema import TradeHistory

logger = get_logger(__name__)

class RealTrader(BaseTrader):
    def __init__(self):
        exchange_class = ccxt.binance
        self.exchange = exchange_class({
            'apiKey': settings.BINANCE_API_KEY,
            'secret': settings.BINANCE_API_SECRET,
            'enableRateLimit': True,
            'options': {
                'defaultType': 'spot',
            }
        })
        if settings.USE_TESTNET:
            self.exchange.set_sandbox_mode(True)
            logger.info("RealTrader initialized in TESTNET (Sandbox) mode.")
        else:
            logger.warning("RealTrader initialized in LIVE mode. Real funds will be used.")

    async def execute_buy(self, symbol: str, price: float, amount: float):
        try:
            order = await self.exchange.create_market_buy_order(symbol, amount)
            executed_price = order['average'] if order.get('average') else price
            logger.info(f"[REAL] BUY Executed: {amount} {symbol} @ {executed_price}")
            await self._record_trade(symbol, 'buy', executed_price, amount)
        except Exception as e:
            logger.error(f"[REAL] BUY failed: {e}")
            
    async def execute_sell(self, symbol: str, price: float, amount: float):
        try:
            order = await self.exchange.create_market_sell_order(symbol, amount)
            executed_price = order['average'] if order.get('average') else price
            logger.info(f"[REAL] SELL Executed: {amount} {symbol} @ {executed_price}")
            await self._record_trade(symbol, 'sell', executed_price, amount)
        except Exception as e:
            logger.error(f"[REAL] SELL failed: {e}")

    async def _record_trade(self, symbol: str, trade_type: str, price: float, amount: float):
        async with AsyncSessionLocal() as session:
            trade = TradeHistory(
                symbol=symbol,
                trade_type=trade_type,
                execution_type='real',
                price=price,
                amount=amount
            )
            session.add(trade)
            await session.commit()
            
    async def close(self):
        await self.exchange.close()
