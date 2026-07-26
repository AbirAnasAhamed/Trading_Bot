from app.core.logger import get_logger
from app.execution.base_trader import BaseTrader

logger = get_logger(__name__)

class L2WallDetector:
    def __init__(self, trader: BaseTrader, wall_multiplier: float = 3.0, trade_amount: float = 0.01):
        self.trader = trader
        self.wall_multiplier = wall_multiplier
        self.trade_amount = trade_amount # Amount of crypto to buy/sell
        self.position = None # Can be 'LONG' or None
        
    async def process_data(self, data: dict):
        buy_wall = data['buy_wall_volume']
        sell_wall = data['sell_wall_volume']
        symbol = data['symbol']
        mid_price = data['mid_price']
        
        # Guard against zero division
        if sell_wall == 0 or buy_wall == 0:
            return

        # If buy wall is significantly larger than sell wall -> Upward pressure (BUY)
        if buy_wall > (sell_wall * self.wall_multiplier):
            if self.position != 'LONG':
                logger.info(f"BUY WALL DETECTED! Ratio: {buy_wall/sell_wall:.2f}. Executing BUY.")
                await self.trader.execute_buy(symbol, mid_price, self.trade_amount)
                self.position = 'LONG'
                
        # If sell wall is significantly larger than buy wall -> Downward pressure (SELL)
        elif sell_wall > (buy_wall * self.wall_multiplier):
            if self.position == 'LONG':
                logger.info(f"SELL WALL DETECTED! Ratio: {sell_wall/buy_wall:.2f}. Executing SELL.")
                await self.trader.execute_sell(symbol, mid_price, self.trade_amount)
                self.position = None
