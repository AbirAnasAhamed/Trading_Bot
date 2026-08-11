import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react';
import { MarketSelectorModal } from './MarketSelectorModal';
import { IndicatorsSelector } from './IndicatorsSelector';

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
  selectedIndicators: string[];
  onIndicatorsChange: (indicators: string[]) => void;
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
  setVolumeType,
  selectedIndicators,
  onIndicatorsChange
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSliderExpanded, setIsSliderExpanded] = useState(false);
  const [isTimeframeDropdownOpen, setIsTimeframeDropdownOpen] = useState(false);
  const timeframeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timeframeDropdownRef.current && !timeframeDropdownRef.current.contains(event.target as Node)) {
        setIsTimeframeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <>
      <div className="flex flex-col gap-1 mb-1">
        {/* Top Part: Current Selectors */}
        <div className="flex flex-col md:flex-row gap-2">
          {/* Market Selector Pill */}
        <div className={`flex items-center bg-panel border border-panel rounded-xl p-1 transition-all duration-300 w-auto`}>
          <div className="flex items-center flex-1">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex flex-col justify-center bg-primary border border-panel rounded-lg px-4 py-1 hover:border-blue-500 transition-colors group shrink-0 min-w-[150px]"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Search className="w-4 h-4 text-secondary group-hover:text-blue-500 transition-colors" />
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] text-secondary font-bold uppercase tracking-wider leading-none mb-1">{selectedExchange || 'Exchange'}</span>
                    <span className="text-sm font-bold text-primary leading-none">{selectedSymbol || 'Select Pair'}</span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Timeframe Selector Pill */}
        <div className={`flex items-center bg-panel border border-panel rounded-xl p-1 transition-all duration-300 w-auto`}>
          <div className="flex items-center flex-1">
            <div className="flex bg-primary border border-panel rounded-lg focus-within:border-blue-500 transition-colors shrink-0">
              <div className="relative" ref={timeframeDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsTimeframeDropdownOpen(!isTimeframeDropdownOpen)}
                  className="flex items-center justify-between gap-2 bg-transparent text-primary font-bold pl-3 pr-2 py-1 focus:outline-none cursor-pointer border-r border-panel w-20"
                >
                  <span>{timeframes.includes(selectedTimeframe) ? selectedTimeframe : 'Sel'}</span>
                  <ChevronDown className="w-3 h-3 text-secondary" />
                </button>
                
                {/* Dropdown Menu */}
                {isTimeframeDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-panel border border-panel rounded-xl p-2 shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200">
                    <div className="grid grid-cols-4 gap-1 w-48">
                      {timeframes.map((tf) => (
                        <button
                          key={tf}
                          onClick={() => {
                            onTimeframeChange(tf);
                            setIsTimeframeDropdownOpen(false);
                          }}
                          className={`aspect-square flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                            selectedTimeframe === tf 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-primary text-secondary hover:bg-blue-500/20 hover:text-blue-500'
                          }`}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <input 
                type="text"
                className="w-16 bg-transparent px-2 py-1 text-primary font-bold focus:outline-none text-center"
                value={selectedTimeframe}
                onChange={(e) => onTimeframeChange(e.target.value)}
                placeholder="Custom"
              />
            </div>
          </div>
        </div>

        {/* Wall Threshold Pill */}
        {setWallThreshold && setVolumeType && (
          <div className={`flex items-center bg-panel border border-panel rounded-xl px-3 py-1 gap-3 transition-all duration-300 ${isSliderExpanded ? 'flex-1' : 'w-auto'}`}>
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

            <div 
              className={`flex items-center gap-4 transition-all duration-500 ease-in-out overflow-hidden ${
                isSliderExpanded ? 'max-w-[800px] opacity-100 ml-2 flex-1' : 'max-w-0 opacity-0 ml-0 flex-none'
              }`}
            >
              {/* Slider */}
              <input 
                type="range" 
                min="0" 
                max="10000000" 
                step="1000" 
                value={wallThreshold} 
                onChange={(e) => setWallThreshold(Number(e.target.value))}
                className="w-[150px] md:w-[400px] flex-1 accent-blue-500 h-2 bg-[var(--border-color)] rounded-lg appearance-none cursor-pointer"
              />
              
              {/* Manual Input */}
              <input
                type="number"
                min="0"
                value={wallThreshold}
                onChange={(e) => setWallThreshold(Number(e.target.value))}
                className="w-24 bg-primary border border-panel rounded px-2 py-1 text-blue-500 text-right focus:outline-none focus:border-blue-500 font-bold shrink-0"
              />
            </div>
          </div>
        )}

        {/* Indicators Selector */}
        <IndicatorsSelector 
          selectedIndicators={selectedIndicators}
          onIndicatorsChange={onIndicatorsChange}
        />
        </div>

        {/* Divider */}
        <div className="w-full border-t border-panel my-0.5 opacity-50"></div>

        {/* Bottom Part: Empty for future options */}
        <div className="flex flex-col md:flex-row gap-2 empty-future-options">
          {/* Add future options and buttons here */}
        </div>
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
