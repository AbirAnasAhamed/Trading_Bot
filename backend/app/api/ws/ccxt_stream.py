from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
from app.services.ccxt_manager import CCXTManager
from app.core.logger import get_logger
import pandas as pd
from app.indicators.core import calculate_indicators

logger = get_logger(__name__)

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
                        logger.debug(f"[WebSocket] Fetching markets for exchange: {exchange_id}")
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
                indicators = message.get("indicators", [])

                logger.debug(f"[WebSocket] Asset Pair Changed (OHLCV) -> Exchange: {exchange_id}, Symbol: {symbol}, Timeframe: {timeframe}")

                if "ohlcv" in tasks and tasks["ohlcv"]:
                    tasks["ohlcv"].cancel()
                if "extra_indicators" in tasks and tasks["extra_indicators"]:
                    tasks["extra_indicators"].cancel()

                async def stream_ohlcv():
                    try:
                        ex = await CCXTManager.get_exchange(exchange_id)
                        
                        historical = await ex.fetch_ohlcv(symbol, timeframe, limit=500)
                        
                        indicators_data = {}
                        if indicators:
                            df = pd.DataFrame(historical, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
                            indicators_data = calculate_indicators(df, indicators)

                        await websocket.send_json({
                            "action": "historical_ohlcv",
                            "exchange": exchange_id,
                            "symbol": symbol,
                            "timeframe": timeframe,
                            "data": historical,
                            "indicators": indicators_data
                        })
                        logger.debug(f"[WebSocket] Sent {len(historical)} historical candles for {symbol}")

                        # Keep last 100 candles in memory for live updates
                        candle_history = historical[-100:] if len(historical) >= 100 else historical.copy()

                        while True:
                            live_candle = await ex.watch_ohlcv(symbol, timeframe)
                            
                            live_indicators = {}
                            if indicators and live_candle:
                                # Update memory history
                                current_live = live_candle[0] if isinstance(live_candle[0], list) else live_candle
                                if len(candle_history) > 0 and candle_history[-1][0] == current_live[0]:
                                    candle_history[-1] = current_live
                                else:
                                    candle_history.append(current_live)
                                    if len(candle_history) > 100:
                                        candle_history.pop(0)
                                        
                                df = pd.DataFrame(candle_history, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
                                full_indicators = calculate_indicators(df, indicators)
                                
                                # We only need to send the last calculated value
                                for ind_name, ind_data in full_indicators.items():
                                    if isinstance(ind_data, list) and len(ind_data) > 0:
                                        live_indicators[ind_name] = [ind_data[-1]]
                                    elif isinstance(ind_data, dict):
                                        live_indicators[ind_name] = {}
                                        for sub_k, sub_v in ind_data.items():
                                            if isinstance(sub_v, list) and len(sub_v) > 0:
                                                live_indicators[ind_name][sub_k] = [sub_v[-1]]
                                                
                            await websocket.send_json({
                                "action": "live_ohlcv",
                                "exchange": exchange_id,
                                "symbol": symbol,
                                "timeframe": timeframe,
                                "data": live_candle,
                                "indicators": live_indicators
                            })
                    except asyncio.CancelledError:
                        logger.debug(f"[WebSocket] Stopped watching OHLCV for {symbol}")
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
                
                if "Open Interest" in indicators or "Liquidation Levels" in indicators:
                    async def poll_extra_indicators():
                        while True:
                            try:
                                ex = await CCXTManager.get_exchange(exchange_id)
                                extra_data = {}
                                
                                if "Open Interest" in indicators:
                                    try:
                                        if ex.has.get('fetchOpenInterestHistory'):
                                            oi_hist = await ex.fetch_open_interest_history(symbol, timeframe)
                                            formatted_oi = [{"time": int(x['timestamp'])/1000, "value": x.get('openInterestValue') or x.get('baseVolume') or 0} for x in oi_hist]
                                            extra_data["Open Interest"] = formatted_oi
                                            extra_data["Open Interest_error"] = None
                                        else:
                                            extra_data["Open Interest_error"] = f"Open Interest not available for {exchange_id.upper()} on {symbol}"
                                    except Exception as e:
                                        extra_data["Open Interest_error"] = f"OI Error: {str(e)}"
                                        
                                if "Liquidation Levels" in indicators:
                                    try:
                                        if ex.has.get('fetchLiquidations') or hasattr(ex, 'fetch_liquidations'):
                                            try:
                                                liqs = await ex.fetch_liquidations(symbol)
                                                levels = []
                                                for liq in liqs:
                                                    if liq.get('price'):
                                                        levels.append({
                                                            'price': float(liq['price']),
                                                            'type': 'long' if liq.get('side', '').lower() == 'sell' else 'short'
                                                        })
                                                extra_data["Liquidation Levels"] = levels
                                                extra_data["Liquidation Levels_error"] = None
                                            except Exception as e:
                                                extra_data["Liquidation Levels_error"] = f"Liq API Error: {str(e)}"
                                        else:
                                            extra_data["Liquidation Levels_error"] = f"Liquidations not available for {exchange_id.upper()}"
                                    except Exception as e:
                                        extra_data["Liquidation Levels_error"] = f"Liq Error: {str(e)}"
                                        
                                if extra_data:
                                    try:
                                        await websocket.send_json({
                                            "action": "extra_indicators",
                                            "exchange": exchange_id,
                                            "symbol": symbol,
                                            "data": extra_data
                                        })
                                    except (WebSocketDisconnect, RuntimeError):
                                        break
                            except asyncio.CancelledError:
                                break
                            except Exception as e:
                                logger.error(f"Error polling extra indicators: {e}")
                                
                            await asyncio.sleep(300)
                    
                    tasks["extra_indicators"] = asyncio.create_task(poll_extra_indicators())

            elif action == "watch_orderbook":
                exchange_id = message.get("exchange")
                symbol = message.get("symbol")
                
                logger.debug(f"[WebSocket] Asset Pair Changed (Orderbook) -> Exchange: {exchange_id}, Symbol: {symbol}")

                if "orderbook" in tasks and tasks["orderbook"]:
                    tasks["orderbook"].cancel()

                async def stream_orderbook():
                    try:
                        ex = await CCXTManager.get_exchange(exchange_id)
                        connected = False
                        while True:
                            # Use watch_order_book for real-time L2 stream. Limit to 50 for RAM optimization
                            orderbook = await ex.watch_order_book(symbol, limit=50)
                            
                            if not connected:
                                logger.info(f"✅ Successfully connected to {exchange_id.upper()} WebSocket for {symbol} orderbook data! (UI Stream)")
                                connected = True
                                
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
                        logger.debug(f"[WebSocket] Stopped watching Orderbook for {symbol}")
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
