import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Selectors } from './components/Selectors';
import { ChartContainer } from './components/ChartContainer';
import { OrderbookPopup } from './components/OrderbookPopup';
import { useChartWebSocket } from './hooks/useChartWebSocket';

import { ChevronUp, ChevronDown } from 'lucide-react';

export const HFTradingBot: React.FC = () => {
  const [selectedExchange, setSelectedExchange] = useState<string>('binance');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC/USDT');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('1m');
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [isSelectorsVisible, setIsSelectorsVisible] = useState<boolean>(true);
  
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
  const [volumeType, setVolumeType] = useState<'base' | 'quote'>('base');

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

  const topbarElement = document.getElementById('topbar-ws-indicator');

  const wsIndicator = (
    <div className="flex items-center mr-2">
      <span className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
      <span className="text-sm font-medium text-secondary whitespace-nowrap">{isConnected ? 'WS Connected' : 'WS Disconnected'}</span>
    </div>
  );

  return (
    <div className="flex flex-col h-full relative">
      {topbarElement && createPortal(wsIndicator, topbarElement)}

      <div className="bg-panel border border-panel rounded-xl p-6 pt-3 shadow-sm flex flex-col flex-1 relative">
        <button 
          onClick={() => setIsSelectorsVisible(!isSelectorsVisible)}
          className="absolute top-2 right-2 p-1.5 bg-background border border-panel rounded-lg text-gray-500 hover:text-white transition-colors z-20 hover:border-blue-500"
          title={isSelectorsVisible ? "Hide Controls" : "Show Controls"}
        >
          {isSelectorsVisible ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <div 
          className={`relative z-50 flex justify-start items-end pr-10 transition-all duration-500 ease-in-out ${
            isSelectorsVisible ? 'max-h-[500px] opacity-100 mb-1 overflow-visible' : 'max-h-0 opacity-0 mb-0 pointer-events-none overflow-hidden'
          }`}
        >
          <Selectors 
            exchanges={exchanges}
            markets={markets}
            selectedExchange={selectedExchange}
            selectedSymbol={selectedSymbol}
            selectedTimeframe={selectedTimeframe}
            onExchangeChange={setSelectedExchange}
            onSymbolChange={setSelectedSymbol}
            onTimeframeChange={setSelectedTimeframe}
            wallThreshold={wallThreshold}
            setWallThreshold={setWallThreshold}
            volumeType={volumeType}
            setVolumeType={setVolumeType}
          />
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
             volumeType={volumeType}
           />
        </div>
      </div>
      
      {/* Floating Orderbook Component */}
      <OrderbookPopup orderbookData={orderbookData} symbol={selectedSymbol} />
    </div>
  );
};
