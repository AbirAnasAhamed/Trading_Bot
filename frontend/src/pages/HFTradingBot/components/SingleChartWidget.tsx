import React, { useState, useEffect } from 'react';
import { Selectors } from './Selectors';
import { ChartContainer } from './ChartContainer';
import { OrderbookPopup } from './OrderbookPopup';
import { useChartWebSocket } from '../hooks/useChartWebSocket';
import { ChevronUp, ChevronDown, X } from 'lucide-react';

interface SingleChartWidgetProps {
  id: string;
  onClose?: (id: string) => void;
  showClose?: boolean;
}

export const SingleChartWidget: React.FC<SingleChartWidgetProps> = ({ id, onClose, showClose }) => {
  const [selectedExchange, setSelectedExchange] = useState<string>('binance');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC/USDT');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('3m');
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [isSelectorsVisible, setIsSelectorsVisible] = useState<boolean>(true);
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
  
  const { 
    isConnected, 
    exchanges, 
    markets, 
    historicalData, 
    liveCandle,
    orderbookData,
    indicatorsData,
    fetchMarkets, 
    watchOhlcv,
    watchOrderbook
  } = useChartWebSocket(selectedIndicators);

  const [wallThreshold, setWallThreshold] = useState<number>(500);
  const [volumeType, setVolumeType] = useState<'base' | 'quote'>('base');

  useEffect(() => {
    if (selectedExchange) {
      fetchMarkets(selectedExchange);
      if (!isInitialLoad) {
        setSelectedSymbol(''); 
      }
      setIsInitialLoad(false);
    }
  }, [selectedExchange, fetchMarkets]);

  useEffect(() => {
    if (selectedExchange && selectedSymbol && selectedTimeframe) {
      watchOhlcv(selectedExchange, selectedSymbol, selectedTimeframe);
      watchOrderbook(selectedExchange, selectedSymbol);
    }
  }, [selectedExchange, selectedSymbol, selectedTimeframe, watchOhlcv, watchOrderbook]);

  return (
    <div className="bg-panel border border-panel rounded-xl p-4 shadow-sm flex flex-col h-full relative min-h-0">
      <div className="absolute top-2 right-2 flex items-center space-x-2 z-20">
        <div className="flex items-center bg-background border border-panel rounded-lg px-2 py-1">
          <span className={`w-2 h-2 rounded-full mr-1.5 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-xs font-medium text-secondary">{isConnected ? 'Connected' : 'Offline'}</span>
        </div>
        
        <button 
          onClick={() => setIsSelectorsVisible(!isSelectorsVisible)}
          className="p-1.5 bg-background border border-panel rounded-lg text-gray-500 hover:text-white transition-colors hover:border-blue-500"
          title={isSelectorsVisible ? "Hide Controls" : "Show Controls"}
        >
          {isSelectorsVisible ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showClose && onClose && (
          <button 
            onClick={() => onClose(id)}
            className="p-1.5 bg-background border border-panel rounded-lg text-gray-500 hover:text-red-500 transition-colors hover:border-red-500"
            title="Close Chart"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div 
        className={`relative z-10 flex justify-start items-start pr-48 transition-all duration-500 ease-in-out ${
          isSelectorsVisible ? 'max-h-[500px] opacity-100 mb-2 overflow-visible' : 'max-h-0 opacity-0 mb-0 pointer-events-none overflow-hidden'
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
          selectedIndicators={selectedIndicators}
          onIndicatorsChange={setSelectedIndicators}
        />
      </div>

      <div className="flex-1 bg-background border border-panel rounded-lg overflow-hidden relative min-h-0">
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
           indicatorsData={indicatorsData}
         />
      </div>
      
      {/* Floating Orderbook Component */}
      <OrderbookPopup orderbookData={orderbookData} symbol={selectedSymbol} />
    </div>
  );
};
