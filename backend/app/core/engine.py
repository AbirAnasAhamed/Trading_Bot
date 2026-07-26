import asyncio
from app.core.logger import get_logger
from app.strategy.orderbook_processor import OrderbookProcessor
from app.strategy.l2_wall_detector import L2WallDetector
from app.execution.paper_trader import PaperTrader
from app.execution.real_trader import RealTrader

logger = get_logger(__name__)

class BotEngine:
    def __init__(self):
        self.processor = None
        self.strategy = None
        self.trader = None
        self.is_running = False
        self._task = None

    async def start(self, symbol: str, mode: str):
        if self.is_running:
            logger.warning("Bot is already running.")
            return

        logger.info(f"Starting bot engine for {symbol} in {mode} mode.")
        
        # 1. Initialize Trader
        if mode == 'real':
            self.trader = RealTrader()
        else:
            self.trader = PaperTrader()
            
        # 2. Initialize Strategy with Trader
        self.strategy = L2WallDetector(trader=self.trader, wall_multiplier=3.0, trade_amount=0.01)
        
        # 3. Initialize Processor with Strategy callback
        self.processor = OrderbookProcessor(symbol=symbol, strategy_callback=self.strategy.process_data)
        
        self.is_running = True
        
        # 4. Start processing in background
        self._task = asyncio.create_task(self.processor.start())

    async def stop(self):
        if not self.is_running:
            return
            
        logger.info("Stopping bot engine...")
        self.is_running = False
        
        if self.processor:
            self.processor.stop()
            
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
                
        if isinstance(self.trader, RealTrader):
            await self.trader.close()

bot_engine = BotEngine()
