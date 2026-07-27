import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

interface MarketSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  exchanges: string[];
  markets: string[];
  selectedExchange: string;
  onExchangeChange: (ex: string) => void;
  onSymbolChange: (sym: string) => void;
}

export const MarketSelectorModal: React.FC<MarketSelectorModalProps> = ({
  isOpen,
  onClose,
  exchanges,
  markets,
  selectedExchange,
  onExchangeChange,
  onSymbolChange
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter markets based on search
  const filteredMarkets = markets.filter(m => m.toLowerCase().includes(search.toLowerCase()));

  // Reset selected index when search changes or markets load
  useEffect(() => {
    setSelectedIndex(0);
  }, [search, markets]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearch('');
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredMarkets.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredMarkets.length > 0) {
        onSymbolChange(filteredMarkets[selectedIndex]);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current && listRef.current.children.length > 0) {
      const activeElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div 
        className="bg-[#0f111a] border border-gray-800 rounded-xl w-full max-w-3xl h-[600px] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-[#161822] border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder={`Search markets (e.g. BTC/USDT)...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel: Exchanges */}
          <div className="w-1/3 border-r border-gray-800 flex flex-col">
            <div className="px-4 py-3 text-xs font-bold text-gray-500 tracking-wider">
              EXCHANGES
            </div>
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
              {exchanges.map((ex) => {
                const isSelected = ex === selectedExchange;
                return (
                  <button
                    key={ex}
                    onClick={() => {
                      onExchangeChange(ex);
                      inputRef.current?.focus();
                    }}
                    className={`w-full text-left px-4 py-3 flex items-center transition-colors
                      ${isSelected ? 'bg-blue-600/10' : 'hover:bg-white/5'}
                    `}
                  >
                    {/* Blue pill indicator for selected */}
                    <div className={`w-1 h-5 rounded-full mr-3 ${isSelected ? 'bg-blue-500' : 'bg-transparent'}`} />
                    <span className={`font-semibold ${isSelected ? 'text-blue-500' : 'text-gray-300'}`}>
                      {ex.charAt(0).toUpperCase() + ex.slice(1)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Trading Pairs */}
          <div className="w-2/3 flex flex-col bg-[#13151e]">
            <div className="px-6 py-3 text-xs font-bold text-gray-500 tracking-wider uppercase border-b border-gray-800/50">
              TRADING PAIRS ({filteredMarkets.length})
            </div>
            
            <div className="flex-1 overflow-y-auto py-2" ref={listRef} style={{ scrollbarWidth: 'thin', scrollbarColor: '#2d3748 transparent' }}>
              {filteredMarkets.length === 0 ? (
                <div className="text-gray-500 text-center mt-10">No markets found.</div>
              ) : (
                filteredMarkets.map((market, idx) => {
                  const [base, quote] = market.split('/');
                  const isActive = idx === selectedIndex;
                  return (
                    <div
                      key={market}
                      onClick={() => {
                        onSymbolChange(market);
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`px-6 py-3 cursor-pointer flex items-center transition-colors
                        ${isActive ? 'bg-[#1e2230]' : 'hover:bg-[#1a1d27]'}
                      `}
                    >
                      <span className="font-bold text-white text-base">{base}</span>
                      <span className="text-gray-500 font-medium ml-1">/{quote}</span>
                      
                      {/* Optional FUT Badge if market ends with perpetual/futures indicator */}
                      {(market.includes(':') || market.endsWith('PERP')) && (
                        <span className="ml-3 bg-blue-900/40 text-blue-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          FUT
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0a0b10] border-t border-gray-800 flex justify-between items-center text-xs text-gray-500">
          <span>Use ↑ ↓ arrows to navigate</span>
          <span>Enter to select</span>
        </div>
      </div>

      {/* Close modal when clicking outside */}
      <div className="absolute inset-0 z-[-1]" onClick={onClose} />
    </div>
  );
};
