from app.core.logger import get_logger
from app.execution.base_trader import BaseTrader

logger = get_logger(__name__)

class L2WallDetector:
    def __init__(self, trader: BaseTrader, wall_multiplier: float = 3.0, trade_amount: float = 0.01, min_wall_volume: float = 10000.0, take_profit: float = 2.0, stop_loss: float = 1.0):
        self.trader = trader
        self.wall_multiplier = wall_multiplier
        self.trade_amount = trade_amount # Amount of crypto to buy/sell
        self.min_wall_volume = min_wall_volume
        self.take_profit = take_profit
        self.stop_loss = stop_loss
        self.position = None # Can be 'LONG' or None
        self.entry_price = 0.0
        
    async def process_data(self, data: dict):
        buy_wall = data['buy_wall_volume']
        sell_wall = data['sell_wall_volume']
        symbol = data['symbol']
        mid_price = data['mid_price']
        
        # Guard against zero division
        if sell_wall == 0 or buy_wall == 0:
            return

        # Check for Take Profit / Stop Loss if we are in a position
        if self.position == 'LONG':
            price_change_pct = ((mid_price - self.entry_price) / self.entry_price) * 100
            
            if price_change_pct >= self.take_profit:
                logger.info(f"TAKE PROFIT HIT! PnL: +{price_change_pct:.2f}%. Executing SELL.")
                await self.trader.execute_sell(symbol, mid_price, self.trade_amount)
                self.position = None
                self.entry_price = 0.0
                return
            elif price_change_pct <= -self.stop_loss:
                logger.info(f"STOP LOSS HIT! PnL: {price_change_pct:.2f}%. Executing SELL.")
                await self.trader.execute_sell(symbol, mid_price, self.trade_amount)
                self.position = None
                self.entry_price = 0.0
                return

        # If buy wall is significantly larger than sell wall AND meets min volume -> Upward pressure (BUY)
        if buy_wall > (sell_wall * self.wall_multiplier) and buy_wall >= self.min_wall_volume:
            if self.position != 'LONG':
                logger.info(f"BUY WALL DETECTED! Ratio: {buy_wall/sell_wall:.2f}. Executing BUY.")
                await self.trader.execute_buy(symbol, mid_price, self.trade_amount)
                self.position = 'LONG'
                self.entry_price = mid_price
                
        # If sell wall is significantly larger than buy wall AND meets min volume -> Downward pressure (SELL)
        elif sell_wall > (buy_wall * self.wall_multiplier) and sell_wall >= self.min_wall_volume:
            if self.position == 'LONG':
                logger.info(f"SELL WALL DETECTED! Ratio: {sell_wall/buy_wall:.2f}. Executing SELL.")
                await self.trader.execute_sell(symbol, mid_price, self.trade_amount)
                self.position = None
                self.entry_price = 0.0
