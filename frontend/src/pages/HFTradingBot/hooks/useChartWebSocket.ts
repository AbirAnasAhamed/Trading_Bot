import { useEffect, useRef, useState, useCallback } from 'react';
import type { CandlestickData, Time } from 'lightweight-charts';

export interface WebSocketMessage {
  action: string;
  data?: any;
  exchange?: string;
  symbol?: string;
  timeframe?: string;
  message?: string;
}

export const useChartWebSocket = () => {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Data States
  const [exchanges, setExchanges] = useState<string[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);
  const [historicalData, setHistoricalData] = useState<CandlestickData[]>([]);
  const [liveCandle, setLiveCandle] = useState<CandlestickData | null>(null);
  const [orderbookData, setOrderbookData] = useState<{bids: number[][], asks: number[][]}>({bids: [], asks: []});
  
  const lastObUpdate = useRef<number>(0);

  useEffect(() => {
    // Connect to WebSocket
    ws.current = new WebSocket('ws://localhost:8000/api/ws/chart-stream');

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
            setExchanges(msg.data || []);
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
            break;
          case 'live_orderbook':
            const now = Date.now();
            // Throttle updates to max 4 per second (250ms) to save RAM and CPU
            if (now - lastObUpdate.current > 250) {
              setOrderbookData(msg.data);
              lastObUpdate.current = now;
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
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(msg));
    } else {
        // If not connected, retry after a short delay
        setTimeout(() => {
           if (ws.current && ws.current.readyState === WebSocket.OPEN) {
             ws.current.send(JSON.stringify(msg));
           }
        }, 1000);
    }
  }, []);

  const fetchMarkets = useCallback((exchange: string) => {
    sendMessage({ action: 'get_markets', exchange });
  }, [sendMessage]);

  const watchOhlcv = useCallback((exchange: string, symbol: string, timeframe: string) => {
    sendMessage({ action: 'watch_ohlcv', exchange, symbol, timeframe });
  }, [sendMessage]);

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
    fetchMarkets,
    watchOhlcv,
    watchOrderbook,
  };
};
