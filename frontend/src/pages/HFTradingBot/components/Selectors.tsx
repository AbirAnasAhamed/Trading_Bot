import React, { useState } from 'react';
import { Search, ChevronRight, ChevronLeft } from 'lucide-react';
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

const timeframes = ['1s', '1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'];



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
  const [isSliderExpanded, setIsSliderExpanded] = useState(false);

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* Market Selector Trigger */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex flex-col justify-center bg-panel border border-panel rounded-lg px-4 py-2 hover:border-blue-500 transition-colors group min-w-[200px]"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Search className="w-4 h-4 text-secondary group-hover:text-blue-500 transition-colors" />
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-secondary font-bold uppercase tracking-wider leading-none mb-1">{selectedExchange || 'Exchange'}</span>
                <span className="text-base font-bold text-primary leading-none">{selectedSymbol || 'Select Pair'}</span>
              </div>
            </div>
          </div>
        </button>

        {/* Timeframe Selector (Dropdown + Manual Input) */}
        <div className="flex bg-panel border border-panel rounded-lg focus-within:border-blue-500 transition-colors">
          <select 
            className="bg-transparent text-primary font-bold pl-3 pr-1 py-2 focus:outline-none cursor-pointer border-r border-panel"
            value={timeframes.includes(selectedTimeframe) ? selectedTimeframe : ''}
            onChange={(e) => {
              if (e.target.value) onTimeframeChange(e.target.value);
            }}
          >
            <option value="" disabled className="bg-panel text-primary">Presets</option>
            {timeframes.map((tf) => (
              <option key={tf} value={tf} className="bg-panel text-primary">{tf}</option>
            ))}
          </select>
          <input 
            type="text"
            className="w-16 bg-transparent px-2 py-2 text-primary font-bold focus:outline-none text-center"
            value={selectedTimeframe}
            onChange={(e) => onTimeframeChange(e.target.value)}
            placeholder="Custom"
          />
        </div>

        {/* Wall Threshold Pill */}
        {setWallThreshold && setVolumeType && (
          <div className={`flex items-center bg-panel border border-panel rounded-xl px-4 py-2 gap-4 transition-all duration-300 ${isSliderExpanded ? 'flex-1' : 'w-auto'}`}>
            <span className="text-secondary font-bold text-sm whitespace-nowrap">Min Vol:</span>
            
            {/* Toggle Switch */}
            <div className="flex bg-primary rounded-lg p-1 border border-panel">
              <button
                onClick={() => setVolumeType('base')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  volumeType === 'base' ? 'bg-[#3b82f6]/20 text-blue-500' : 'text-secondary hover:text-primary'
                }`}
              >
                BASE
              </button>
              <button
                onClick={() => setVolumeType('quote')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  volumeType === 'quote' ? 'bg-[#3b82f6]/20 text-blue-500' : 'text-secondary hover:text-primary'
                }`}
              >
                QUOTE
              </button>
            </div>

            <button
              onClick={() => setIsSliderExpanded(!isSliderExpanded)}
              className="p-1 rounded-full hover:bg-primary text-secondary hover:text-blue-500 transition-colors flex items-center justify-center"
              title={isSliderExpanded ? "Collapse Slider" : "Expand Slider"}
            >
              {isSliderExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {isSliderExpanded && (
              <div className="flex-1 flex items-center gap-4 animate-in fade-in duration-300 min-w-[200px] md:min-w-[600px]">
                {/* Slider */}
                <input 
                  type="range" 
                  min="0" 
                  max="10000000" 
                  step="1000" 
                  value={wallThreshold} 
                  onChange={(e) => setWallThreshold(Number(e.target.value))}
                  className="flex-1 accent-blue-500 h-2 bg-[var(--border-color)] rounded-lg appearance-none cursor-pointer"
                />
                
                {/* Manual Input */}
                <input
                  type="number"
                  min="0"
                  value={wallThreshold}
                  onChange={(e) => setWallThreshold(Number(e.target.value))}
                  className="w-24 bg-primary border border-panel rounded px-2 py-1 text-blue-500 text-right focus:outline-none focus:border-blue-500 font-bold"
                />
              </div>
            )}
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
