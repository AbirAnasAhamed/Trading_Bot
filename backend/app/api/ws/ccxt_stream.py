from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
from app.services.ccxt_manager import CCXTManager

router = APIRouter()

@router.websocket("/chart-stream")
async def chart_stream(websocket: WebSocket):
    await websocket.accept()
    current_task = None

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
                        print(f"[WebSocket] Fetching markets for exchange: {exchange_id}")
                        ex = await CCXTManager.get_exchange(exchange_id)
                        await ex.load_markets()
                        symbols = list(ex.symbols)
                        await websocket.send_json({
                            "action": "markets_list",
                            "exchange": exchange_id,
                            "data": symbols
                        })
                    except Exception as e:
                        print(f"[WebSocket] Error fetching markets: {e}")
                        await websocket.send_json({
                            "action": "error",
                            "message": str(e)
                        })

            elif action == "watch_ohlcv":
                exchange_id = message.get("exchange")
                symbol = message.get("symbol")
                timeframe = message.get("timeframe")

                print(f"[WebSocket] Asset Pair Changed -> Exchange: {exchange_id}, Symbol: {symbol}, Timeframe: {timeframe}")

                if current_task:
                    current_task.cancel()

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
                        print(f"[WebSocket] Sent {len(historical)} historical candles for {symbol}")

                        while True:
                            live_candle = await ex.watch_ohlcv(symbol, timeframe)
                            await websocket.send_json({
                                "action": "live_ohlcv",
                                "exchange": exchange_id,
                                "symbol": symbol,
                                "timeframe": timeframe,
                                "data": live_candle
                            })
                            # print(f"[WebSocket] Live candle update for {symbol}")
                    except asyncio.CancelledError:
                        print(f"[WebSocket] Stopped watching {symbol}")
                    except Exception as e:
                        print(f"[WebSocket] Error watching {symbol}: {e}")
                        await websocket.send_json({
                            "action": "error",
                            "message": str(e)
                        })

                current_task = asyncio.create_task(stream_ohlcv())

    except WebSocketDisconnect:
        if current_task:
            current_task.cancel()
