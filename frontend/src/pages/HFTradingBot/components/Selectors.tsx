import React, { useState } from 'react';

interface SelectorsProps {
  exchanges: string[];
  markets: string[];
  selectedExchange: string;
  selectedSymbol: string;
  selectedTimeframe: string;
  onExchangeChange: (ex: string) => void;
  onSymbolChange: (sym: string) => void;
  onTimeframeChange: (tf: string) => void;
}

const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d', '1w', '1M'];

export const Selectors: React.FC<SelectorsProps> = ({
  exchanges,
  markets,
  selectedExchange,
  selectedSymbol,
  selectedTimeframe,
  onExchangeChange,
  onSymbolChange,
  onTimeframeChange
}) => {
  const [exchangeSearch, setExchangeSearch] = useState('');
  const [marketSearch, setMarketSearch] = useState('');

  const filteredExchanges = exchanges.filter(ex => ex.toLowerCase().includes(exchangeSearch.toLowerCase()));
  const filteredMarkets = markets.filter(m => m.toLowerCase().includes(marketSearch.toLowerCase()));

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1">
        <label className="block text-sm font-medium text-secondary mb-1">Exchange</label>
        <input 
          type="text" 
          placeholder="Search Exchange..." 
          className="w-full bg-background border border-panel rounded-t-lg px-4 py-2 text-sm text-primary focus:outline-none focus:border-brand mb-[1px]"
          value={exchangeSearch}
          onChange={(e) => setExchangeSearch(e.target.value)}
        />
        <select 
          className="w-full bg-panel border border-panel rounded-b-lg px-4 py-2 text-primary focus:outline-none focus:border-brand"
          value={selectedExchange}
          onChange={(e) => onExchangeChange(e.target.value)}
        >
          <option className="bg-panel text-primary" value="">Select Exchange</option>
          {filteredExchanges.map((ex) => (
            <option className="bg-panel text-primary" key={ex} value={ex}>{ex.toUpperCase()}</option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <label className="block text-sm font-medium text-secondary mb-1">Asset Pair</label>
        <input 
          type="text" 
          placeholder="Search Pair (e.g. BTC/USDT)" 
          className="w-full bg-background border border-panel rounded-t-lg px-4 py-2 text-sm text-primary focus:outline-none focus:border-brand mb-[1px]"
          value={marketSearch}
          onChange={(e) => setMarketSearch(e.target.value)}
          disabled={!selectedExchange || markets.length === 0}
        />
        <select 
          className="w-full bg-panel border border-panel rounded-b-lg px-4 py-2 text-primary focus:outline-none focus:border-brand"
          value={selectedSymbol}
          onChange={(e) => onSymbolChange(e.target.value)}
          disabled={!selectedExchange || markets.length === 0}
        >
          <option className="bg-panel text-primary" value="">Select Pair</option>
          {filteredMarkets.map((m) => (
            <option className="bg-panel text-primary" key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <label className="block text-sm font-medium text-secondary mb-1">Timeframe</label>
        <select 
          className="w-full bg-panel border border-panel rounded-lg px-4 py-2 mt-[37px] text-primary focus:outline-none focus:border-brand"
          value={selectedTimeframe}
          onChange={(e) => onTimeframeChange(e.target.value)}
        >
          {timeframes.map((tf) => (
            <option className="bg-panel text-primary" key={tf} value={tf}>{tf}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
