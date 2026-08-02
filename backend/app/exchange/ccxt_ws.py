import asyncio
from typing import Callable, Coroutine
from app.core.logger import get_logger
from app.services.ccxt_manager import CCXTManager
import ccxt.pro as ccxtpro

logger = get_logger(__name__)

class CCXTWebSocketClient:
    def __init__(self, exchange_id: str, symbol: str, callback: Callable[[dict], Coroutine]):
        self.exchange_id = exchange_id.lower()
        self.symbol = symbol.upper()
        self.callback = callback
        self._running = False

    async def connect(self):
        self._running = True
        try:
            exchange = await CCXTManager.get_exchange(self.exchange_id)
        except Exception as e:
            logger.error(f"Failed to initialize exchange {self.exchange_id}: {e}")
            self._running = False
            return

        connected = False
        while self._running:
            try:
                # CCXT Pro watch_order_book method
                orderbook = await exchange.watch_order_book(self.symbol)
                
                if not connected:
                    logger.info(f"✅ Successfully connected to {self.exchange_id.upper()} WebSocket for {self.symbol} orderbook data!")
                    connected = True
                
                await self.callback(orderbook)
                
            except ccxtpro.NetworkError as e:
                if not self._running:
                    break
                logger.warning(f"Network error on {self.exchange_id}: {e}. Retrying in 5s...")
                connected = False
                await asyncio.sleep(5)
            except asyncio.CancelledError:
                break
            except Exception as e:
                if not self._running:
                    break
                logger.error(f"WebSocket Error on {self.exchange_id}: {e}. Retrying in 5s...")
                connected = False
                await asyncio.sleep(5)

    def stop(self):
        self._running = False
