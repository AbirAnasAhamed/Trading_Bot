import json
import asyncio
import websockets
from typing import Callable, Coroutine
from app.core.logger import get_logger

logger = get_logger(__name__)

class BinanceWebSocketClient:
    def __init__(self, symbol: str, callback: Callable[[dict], Coroutine]):
        self.symbol = symbol.lower()
        self.url = f"wss://stream.binance.com:9443/ws/{self.symbol}@depth20@100ms"
        self.callback = callback
        self._running = False
        self._ws = None

    async def connect(self):
        self._running = True
        while self._running:
            try:
                async with websockets.connect(self.url) as ws:
                    self._ws = ws
                    logger.info(f"Connected to Binance WS for {self.symbol}")
                    while self._running:
                        message = await ws.recv()
                        data = json.loads(message)
                        await self.callback(data)
            except websockets.ConnectionClosed:
                if not self._running:
                    break
                logger.warning(f"Connection closed for {self.symbol}. Reconnecting in 5 seconds...")
                await asyncio.sleep(5)
            except asyncio.CancelledError:
                break
            except Exception as e:
                if not self._running:
                    break
                logger.error(f"WebSocket Error: {e}. Reconnecting in 5 seconds...")
                await asyncio.sleep(5)

    def stop(self):
        self._running = False
        if self._ws:
            asyncio.create_task(self._ws.close())
