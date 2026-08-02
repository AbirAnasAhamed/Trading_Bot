import asyncio
from app.core.logger import get_logger
from app.strategy.orderbook_processor import OrderbookProcessor
from app.strategy.l2_wall_detector import L2WallDetector
from app.execution.paper_trader import PaperTrader
from app.execution.real_trader import RealTrader

logger = get_logger(__name__)

class BotEngine:
    def __init__(self, bot_id: str = "default_bot"):
        self.bot_id = bot_id
        self.processor = None
        self.strategy = None
        self.trader = None
        self.is_running = False
        self.is_paused = False
        self._task = None
        self._heartbeat_task = None
        self.config = {}
        self.current_pnl = 0.0

    async def _handle_data(self, data: dict):
        if not self.is_paused and self.strategy:
            await self.strategy.process_data(data)

    async def _heartbeat(self):
        while self.is_running:
            status = "Paused" if self.is_paused else "Running"
            logger.info(f"💓 Heartbeat: Bot {self.bot_id} is currently {status}.")
            
            if self.trader:
                self.current_pnl = await self.trader.get_pnl()
                
            from app.services.notification_manager import NotificationService
            await NotificationService.broadcast_bot_state_to_all()
            
            await asyncio.sleep(5)

    async def start(self, symbol: str = None, mode: str = None, exchange_id: str = None, api_key: str = None, api_secret: str = None, wall_multiplier: float = 3.0, trade_amount: float = 0.01, min_wall_volume: float = 10000.0, take_profit: float = 2.0, stop_loss: float = 1.0):
        if self.is_running:
            logger.warning("Bot is already running.")
            return

        if symbol:
            self.config = {
                'symbol': symbol,
                'mode': mode,
                'exchange_id': exchange_id,
                'api_key': api_key,
                'api_secret': api_secret,
                'wall_multiplier': wall_multiplier,
                'trade_amount': trade_amount,
                'min_wall_volume': min_wall_volume,
                'take_profit': take_profit,
                'stop_loss': stop_loss
            }
        else:
            if not self.config:
                logger.error("No config available to start bot.")
                return
            symbol = self.config['symbol']
            mode = self.config['mode']
            exchange_id = self.config.get('exchange_id')
            api_key = self.config.get('api_key')
            api_secret = self.config.get('api_secret')
            wall_multiplier = self.config['wall_multiplier']
            trade_amount = self.config['trade_amount']
            min_wall_volume = self.config['min_wall_volume']
            take_profit = self.config['take_profit']
            stop_loss = self.config['stop_loss']

        logger.info(f"Starting bot engine for {symbol} in {mode} mode.")
        
        # 1. Initialize Trader
        if mode == 'real':
            self.trader = RealTrader(bot_id=self.bot_id, exchange_id=exchange_id, api_key=api_key, api_secret=api_secret)
        else:
            self.trader = PaperTrader(bot_id=self.bot_id)
            
        # 2. Initialize Strategy with Trader
        self.strategy = L2WallDetector(
            trader=self.trader, 
            wall_multiplier=wall_multiplier, 
            trade_amount=trade_amount,
            min_wall_volume=min_wall_volume,
            take_profit=take_profit,
            stop_loss=stop_loss
        )
        
        # 3. Initialize Processor with engine callback
        active_exchange = exchange_id if exchange_id else 'binance'
        self.processor = OrderbookProcessor(symbol=symbol, exchange_id=active_exchange, strategy_callback=self._handle_data)
        
        self.is_running = True
        
        # 4. Start processing in background
        self._task = asyncio.create_task(self.processor.start())
        self._heartbeat_task = asyncio.create_task(self._heartbeat())

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
                await asyncio.wait_for(self._task, timeout=1.0)
            except (asyncio.CancelledError, asyncio.TimeoutError):
                pass

        if self._heartbeat_task:
            self._heartbeat_task.cancel()
            try:
                await asyncio.wait_for(self._heartbeat_task, timeout=1.0)
            except (asyncio.CancelledError, asyncio.TimeoutError):
                pass
                
        if isinstance(self.trader, RealTrader):
            await self.trader.close()

    def pause(self):
        if self.is_running and not self.is_paused:
            logger.info("Pausing bot engine...")
            self.is_paused = True
            
    def resume(self):
        if self.is_running and self.is_paused:
            logger.info("Resuming bot engine...")
            self.is_paused = False

