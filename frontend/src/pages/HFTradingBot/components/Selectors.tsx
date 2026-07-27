import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { MarketSelectorModal } from './MarketSelectorModal';

interface SelectorsProps {
  exchanges: string[];
  markets: string[];
  selectedExchange: string;
  selectedSymbol: string;
  selectedTimeframe: string;
  onExchangeChange: (ex: string) => void;
  onSymbolChange: (sym: string) => void;
  onTimeframeChange: (tf: string) => void;
  wallThreshold?: number;
  setWallThreshold?: (val: number) => void;
  volumeType?: 'base' | 'quote';
  setVolumeType?: (type: 'base' | 'quote') => void;
}

const timeframes = ['1m', '3m', '5m', '15m', '1h', '4h', '1d', '1w', '1M'];

const formatVolume = (vol: number) => {
  if (vol >= 1000000) return (vol / 1000000).toFixed(0) + 'M';
  if (vol >= 1000) return (vol / 1000).toFixed(0) + 'k';
  return vol.toFixed(0);
};

export const Selectors: React.FC<SelectorsProps> = ({
  exchanges,
  markets,
  selectedExchange,
  selectedSymbol,
  selectedTimeframe,
  onExchangeChange,
  onSymbolChange,
  onTimeframeChange,
  wallThreshold = 500,
  setWallThreshold,
  volumeType = 'base',
  setVolumeType
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* Market Selector Trigger */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex flex-col justify-center bg-background border border-panel rounded-lg px-4 py-2 hover:border-blue-500 transition-colors group min-w-[200px]"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Search className="w-4 h-4 text-gray-500 group-hover:text-blue-500 transition-colors" />
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none mb-1">{selectedExchange || 'Exchange'}</span>
                <span className="text-base font-bold text-white leading-none">{selectedSymbol || 'Select Pair'}</span>
              </div>
            </div>
          </div>
        </button>

        {/* Timeframe Selector (Custom Input) */}
        <div className="w-24">
          <input 
            type="text"
            list="timeframes-list"
            className="w-full h-full bg-background border border-panel rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-blue-500 text-center"
            value={selectedTimeframe}
            onChange={(e) => onTimeframeChange(e.target.value)}
            placeholder="e.g. 1m"
          />
          <datalist id="timeframes-list">
            {timeframes.map((tf) => (
              <option key={tf} value={tf} />
            ))}
          </datalist>
        </div>

        {/* Wall Threshold Pill */}
        {setWallThreshold && setVolumeType && (
          <div className="flex-1 flex items-center bg-[#0d0f15] border border-gray-800 rounded-xl px-4 py-2 gap-4">
            <span className="text-gray-400 font-bold text-sm whitespace-nowrap">Min Vol:</span>
            
            {/* Toggle Switch */}
            <div className="flex bg-[#161822] rounded-lg p-1">
              <button
                onClick={() => setVolumeType('base')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  volumeType === 'base' ? 'bg-[#3b82f6]/20 text-blue-500' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                BASE
              </button>
              <button
                onClick={() => setVolumeType('quote')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  volumeType === 'quote' ? 'bg-[#3b82f6]/20 text-blue-500' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                QUOTE
              </button>
            </div>

            {/* Slider */}
            <input 
              type="range" 
              min="0" 
              max="10000000" 
              step="1000" 
              value={wallThreshold} 
              onChange={(e) => setWallThreshold(Number(e.target.value))}
              className="flex-1 accent-blue-500 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
            />
            
            {/* Value Display */}
            <span className="text-blue-500 font-bold w-12 text-right">
              {formatVolume(wallThreshold)}
            </span>
          </div>
        )}
      </div>

      <MarketSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        exchanges={exchanges}
        markets={markets}
        selectedExchange={selectedExchange}
        onExchangeChange={onExchangeChange}
        onSymbolChange={onSymbolChange}
      />
    </>
  );
};
