import React, { useState, useEffect } from 'react';
import { Selectors } from './components/Selectors';
import { ChartContainer } from './components/ChartContainer';
import { OrderbookPopup } from './components/OrderbookPopup';
import { useChartWebSocket } from './hooks/useChartWebSocket';

export const HFTradingBot: React.FC = () => {
  const [selectedExchange, setSelectedExchange] = useState<string>('binance');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC/USDT');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('1m');
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  
  const { 
    isConnected, 
    exchanges, 
    markets, 
    historicalData, 
    liveCandle,
    orderbookData,
    fetchMarkets, 
    watchOhlcv,
    watchOrderbook
  } = useChartWebSocket();

  const [wallThreshold, setWallThreshold] = useState<number>(500);

  // Fetch markets when exchange changes
  useEffect(() => {
    if (selectedExchange) {
      fetchMarkets(selectedExchange);
      if (!isInitialLoad) {
        setSelectedSymbol(''); // Reset symbol only if it's not the initial load
      }
      setIsInitialLoad(false);
    }
  }, [selectedExchange, fetchMarkets]);

  // Watch OHLCV and Orderbook when all three are selected
  useEffect(() => {
    if (selectedExchange && selectedSymbol && selectedTimeframe) {
      watchOhlcv(selectedExchange, selectedSymbol, selectedTimeframe);
      watchOrderbook(selectedExchange, selectedSymbol);
    }
  }, [selectedExchange, selectedSymbol, selectedTimeframe, watchOhlcv, watchOrderbook]);

  return (
    <div className="space-y-6 flex flex-col h-full relative">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Order flow chart</h1>
        <div className="flex items-center">
          <span className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-sm font-medium text-secondary">{isConnected ? 'WS Connected' : 'WS Disconnected'}</span>
        </div>
      </div>

      <div className="bg-panel border border-panel rounded-xl p-6 shadow-sm flex flex-col flex-1">
        <div className="flex justify-between items-end mb-4">
          <Selectors 
            exchanges={exchanges}
            markets={markets}
            selectedExchange={selectedExchange}
            selectedSymbol={selectedSymbol}
            selectedTimeframe={selectedTimeframe}
            onExchangeChange={setSelectedExchange}
            onSymbolChange={setSelectedSymbol}
            onTimeframeChange={setSelectedTimeframe}
          />
          
          {/* Wall Threshold Slider */}
          <div className="flex flex-col ml-6 bg-background p-2 rounded-lg border border-panel">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-gray-400">Wall Threshold:</label>
              <span className="text-xs font-bold text-white ml-2">
                 {wallThreshold > 1000 ? (wallThreshold / 1000).toFixed(1) + 'k' : wallThreshold}
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="10000" 
              step="100" 
              value={wallThreshold} 
              onChange={(e) => setWallThreshold(Number(e.target.value))}
              className="w-48 accent-primary cursor-pointer"
            />
          </div>
        </div>

        <div className="flex-1 bg-background border border-panel rounded-lg overflow-hidden relative">
           {historicalData.length === 0 && selectedSymbol ? (
             <div className="absolute inset-0 flex items-center justify-center text-secondary z-10 bg-background/80">
               Loading chart data for {selectedSymbol}...
             </div>
           ) : null}
           <ChartContainer 
             historicalData={historicalData} 
             liveCandle={liveCandle}
             orderbookData={orderbookData}
             wallThreshold={wallThreshold}
           />
        </div>
      </div>
      
      {/* Floating Orderbook Component */}
      <OrderbookPopup orderbookData={orderbookData} symbol={selectedSymbol} />
    </div>
  );
};
