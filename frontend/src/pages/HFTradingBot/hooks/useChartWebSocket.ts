import { useEffect, useRef, useState, useCallback } from 'react';
import type { CandlestickData, Time } from 'lightweight-charts';

export interface WebSocketMessage {
  action: string;
  data?: any;
  indicators?: any;
  exchange?: string;
  symbol?: string;
  timeframe?: string;
  message?: string;
}

export const useChartWebSocket = (selectedIndicators: string[] = []) => {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Data States
  const [exchanges, setExchanges] = useState<string[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);
  const [historicalData, setHistoricalData] = useState<CandlestickData[]>([]);
  const [liveCandle, setLiveCandle] = useState<CandlestickData | null>(null);
  const [orderbookData, setOrderbookData] = useState<{bids: number[][], asks: number[][]}>({bids: [], asks: []});
  const [indicatorsData, setIndicatorsData] = useState<any>({});
  
  const lastObUpdate = useRef<number>(0);

  useEffect(() => {
    // Connect to WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws.current = new WebSocket(`${protocol}//${window.location.host}/api/ws/chart-stream`);

    ws.current.onopen = () => {
      setIsConnected(true);
      // Fetch initial exchanges
      sendMessage({ action: 'get_exchanges' });
    };

    ws.current.onmessage = (event) => {
      try {
        const msg: WebSocketMessage = JSON.parse(event.data);
        
        switch (msg.action) {
          case 'exchanges_list':
            const formattedExchanges = (msg.data || []).map((ex: any) => typeof ex === 'string' ? ex : ex.id);
            setExchanges(formattedExchanges);
            break;
          case 'markets_list':
            setMarkets(msg.data || []);
            break;
          case 'historical_ohlcv':
            // Format ccxt OHLCV to lightweight-charts CandlestickData
            if (Array.isArray(msg.data)) {
              const formatted: CandlestickData[] = msg.data.map((candle: number[]) => ({
                time: (candle[0] / 1000) as Time,
                open: candle[1],
                high: candle[2],
                low: candle[3],
                close: candle[4],
              }));
              setHistoricalData(formatted);
            }
            if (msg.indicators) {
              setIndicatorsData(msg.indicators);
            }
            break;
          case 'live_ohlcv':
            if (Array.isArray(msg.data) && msg.data.length > 0) {
                let latestCandle = msg.data;
                if (Array.isArray(msg.data[0])) {
                   latestCandle = msg.data[msg.data.length - 1]; 
                }
                if (latestCandle.length >= 5) {
                  const formatted: CandlestickData = {
                    time: (latestCandle[0] / 1000) as Time,
                    open: latestCandle[1],
                    high: latestCandle[2],
                    low: latestCandle[3],
                    close: latestCandle[4],
                  };
                  setLiveCandle(formatted);
                }
            }
            if (msg.indicators) {
              // Merge live indicator updates into the main indicatorsData state
              setIndicatorsData((prev: any) => {
                const next = { ...prev };
                for (const [key, value] of Object.entries(msg.indicators)) {
                  if (Array.isArray(value) && value.length > 0) {
                    if (!next[key]) next[key] = [];
                    // Replace if same time, otherwise append
                    const existingIdx = next[key].findIndex((v: any) => v.time === value[0].time);
                    if (existingIdx >= 0) {
                      next[key][existingIdx] = value[0];
                    } else {
                      next[key] = [...next[key], value[0]];
                    }
                  } else if (typeof value === 'object' && value !== null) {
                    if (!next[key]) next[key] = {};
                    for (const [subKey, subValue] of Object.entries(value as any)) {
                       if (Array.isArray(subValue) && subValue.length > 0) {
                          if (!next[key][subKey]) next[key][subKey] = [];
                          const existingIdx = next[key][subKey].findIndex((v: any) => v.time === subValue[0].time);
                          if (existingIdx >= 0) {
                            next[key][subKey][existingIdx] = subValue[0];
                          } else {
                            next[key][subKey] = [...next[key][subKey], subValue[0]];
                          }
                       }
                    }
                  }
                }
                return next;
              });
            }
            break;
          case 'live_orderbook':
            const now = Date.now();
            // Throttle updates to max 4 per second (250ms) to save RAM and CPU
            if (now - lastObUpdate.current > 250) {
              setOrderbookData(msg.data);
              lastObUpdate.current = now;
            }
            break;
          case 'extra_indicators':
            if (msg.data) {
              setIndicatorsData((prev: any) => {
                const next = { ...prev };
                for (const [key, value] of Object.entries(msg.data)) {
                  next[key] = value;
                }
                return next;
              });
            }
            break;
          case 'error':
            console.error("WS Error:", msg.message);
            break;
        }
      } catch (e) {
        console.error("Failed to parse WS message", e);
      }
    };

    ws.current.onclose = () => setIsConnected(false);

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const sendMessage = useCallback((msg: WebSocketMessage) => {
    const trySend = (retries = 0) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(msg));
      } else if (retries < 10) {
        // If not connected, retry every 500ms up to 10 times (5 seconds)
        setTimeout(() => trySend(retries + 1), 500);
      } else {
        console.error("WS message dropped, connection timeout", msg);
      }
    };
    trySend();
  }, []);

  const fetchMarkets = useCallback((exchange: string) => {
    sendMessage({ action: 'get_markets', exchange });
  }, [sendMessage]);

  const watchOhlcv = useCallback((exchange: string, symbol: string, timeframe: string) => {
    sendMessage({ action: 'watch_ohlcv', exchange, symbol, timeframe, indicators: selectedIndicators });
  }, [sendMessage, selectedIndicators]);

  const watchOrderbook = useCallback((exchange: string, symbol: string) => {
    sendMessage({ action: 'watch_orderbook', exchange, symbol });
  }, [sendMessage]);

  return {
    isConnected,
    exchanges,
    markets,
    historicalData,
    liveCandle,
    orderbookData,
    indicatorsData,
    fetchMarkets,
    watchOhlcv,
    watchOrderbook,
  };
};
