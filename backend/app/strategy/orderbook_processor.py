from app.exchange.binance_ws import BinanceWebSocketClient
from app.db.database import AsyncSessionLocal
from app.models.schema import L2Snapshot
from app.core.logger import get_logger

logger = get_logger(__name__)

class OrderbookProcessor:
    def __init__(self, symbol: str, depth_limit: int = 10, strategy_callback = None):
        self.symbol = symbol.upper()
        self.depth_limit = depth_limit 
        self.ws_client = BinanceWebSocketClient(symbol, self.process_snapshot)
        self.strategy_callback = strategy_callback
        
    async def start(self):
        await self.ws_client.connect()
        
    def stop(self):
        self.ws_client.stop()
        
    async def process_snapshot(self, data: dict):
        if 'bids' not in data or 'asks' not in data:
            return
            
        bids = data['bids'][:self.depth_limit]
        asks = data['asks'][:self.depth_limit]
        
        if not bids or not asks:
            return
            
        # Calculate wall volume (sum of quantity at top N levels)
        buy_wall_volume = sum([float(b[1]) for b in bids])
        sell_wall_volume = sum([float(a[1]) for a in asks])
        
        best_bid = float(bids[0][0])
        best_ask = float(asks[0][0])
        mid_price = (best_bid + best_ask) / 2
        spread = best_ask - best_bid
        
        # Save snapshot
        async with AsyncSessionLocal() as session:
            snapshot = L2Snapshot(
                symbol=self.symbol,
                buy_wall_volume=buy_wall_volume,
                sell_wall_volume=sell_wall_volume,
                mid_price=mid_price,
                spread=spread
            )
            session.add(snapshot)
            await session.commit()
            
        # Pass data to strategy engine if callback exists
        if self.strategy_callback:
            await self.strategy_callback({
                'symbol': self.symbol,
                'buy_wall_volume': buy_wall_volume,
                'sell_wall_volume': sell_wall_volume,
                'mid_price': mid_price,
                'spread': spread
            })
