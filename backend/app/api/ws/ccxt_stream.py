from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
import logging
from app.services.ccxt_manager import CCXTManager

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

router = APIRouter()

@router.websocket("/chart-stream")
async def chart_stream(websocket: WebSocket):
    await websocket.accept()
    tasks = {} # Store tasks by stream type to allow concurrent streams

    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
            except json.JSONDecodeError:
                continue

            action = message.get("action")

            if action == "get_exchanges":
                exchanges = CCXTManager.get_supported_exchanges()
                await websocket.send_json({
                    "action": "exchanges_list",
                    "data": exchanges
                })

            elif action == "get_markets":
                exchange_id = message.get("exchange")
                if exchange_id:
                    try:
                        logger.info(f"[WebSocket] Fetching markets for exchange: {exchange_id}")
                        ex = await CCXTManager.get_exchange(exchange_id)
                        await ex.load_markets()
                        symbols = list(ex.symbols)
                        await websocket.send_json({
                            "action": "markets_list",
                            "exchange": exchange_id,
                            "data": symbols
                        })
                    except (WebSocketDisconnect, RuntimeError):
                        raise
                    except Exception as e:
                        logger.error(f"[WebSocket] Error fetching markets: {e}")
                        try:
                            await websocket.send_json({
                                "action": "error",
                                "message": str(e)
                            })
                        except (WebSocketDisconnect, RuntimeError):
                            pass

            elif action == "watch_ohlcv":
                exchange_id = message.get("exchange")
                symbol = message.get("symbol")
                timeframe = message.get("timeframe")

                logger.info(f"[WebSocket] Asset Pair Changed (OHLCV) -> Exchange: {exchange_id}, Symbol: {symbol}, Timeframe: {timeframe}")

                if "ohlcv" in tasks and tasks["ohlcv"]:
                    tasks["ohlcv"].cancel()

                async def stream_ohlcv():
                    try:
                        ex = await CCXTManager.get_exchange(exchange_id)
                        
                        historical = await ex.fetch_ohlcv(symbol, timeframe, limit=500)
                        await websocket.send_json({
                            "action": "historical_ohlcv",
                            "exchange": exchange_id,
                            "symbol": symbol,
                            "timeframe": timeframe,
                            "data": historical
                        })
                        logger.info(f"[WebSocket] Sent {len(historical)} historical candles for {symbol}")

                        while True:
                            live_candle = await ex.watch_ohlcv(symbol, timeframe)
                            await websocket.send_json({
                                "action": "live_ohlcv",
                                "exchange": exchange_id,
                                "symbol": symbol,
                                "timeframe": timeframe,
                                "data": live_candle
                            })
                    except asyncio.CancelledError:
                        logger.info(f"[WebSocket] Stopped watching OHLCV for {symbol}")
                    except (WebSocketDisconnect, RuntimeError):
                        pass
                    except Exception as e:
                        logger.error(f"[WebSocket] Error watching OHLCV for {symbol}: {e}")
                        try:
                            await websocket.send_json({
                                "action": "error",
                                "message": f"OHLCV Error: {str(e)}"
                            })
                        except (WebSocketDisconnect, RuntimeError):
                            pass

                tasks["ohlcv"] = asyncio.create_task(stream_ohlcv())

            elif action == "watch_orderbook":
                exchange_id = message.get("exchange")
                symbol = message.get("symbol")
                
                logger.info(f"[WebSocket] Asset Pair Changed (Orderbook) -> Exchange: {exchange_id}, Symbol: {symbol}")

                if "orderbook" in tasks and tasks["orderbook"]:
                    tasks["orderbook"].cancel()

                async def stream_orderbook():
                    try:
                        ex = await CCXTManager.get_exchange(exchange_id)
                        while True:
                            # Use watch_order_book for real-time L2 stream. Limit to 50 for RAM optimization
                            orderbook = await ex.watch_order_book(symbol, limit=50)
                            
                            # Trim data to strictly top 50 to ensure low memory footprint on client
                            trimmed_ob = {
                                "bids": orderbook.get("bids", [])[:50],
                                "asks": orderbook.get("asks", [])[:50],
                            }
                            
                            await websocket.send_json({
                                "action": "live_orderbook",
                                "exchange": exchange_id,
                                "symbol": symbol,
                                "data": trimmed_ob
                            })
                    except asyncio.CancelledError:
                        logger.info(f"[WebSocket] Stopped watching Orderbook for {symbol}")
                    except (WebSocketDisconnect, RuntimeError):
                        pass
                    except Exception as e:
                        logger.error(f"[WebSocket] Error watching Orderbook for {symbol}: {e}")
                        try:
                            await websocket.send_json({
                                "action": "error",
                                "message": f"Orderbook Error: {str(e)}"
                            })
                        except (WebSocketDisconnect, RuntimeError):
                            pass

                tasks["orderbook"] = asyncio.create_task(stream_orderbook())

    except (WebSocketDisconnect, RuntimeError):
        for t in tasks.values():
            if t:
                t.cancel()
