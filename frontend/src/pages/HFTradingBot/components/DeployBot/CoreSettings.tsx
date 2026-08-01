import React, { memo } from 'react';

interface CoreSettingsProps {
  botName: string;
  setBotName: (val: string) => void;
  mode: string;
  setMode: (val: string) => void;
  exchangeId: string;
  setExchangeId: (val: string) => void;
  configuredExchanges: any[];
  tradeAmount: number;
  setTradeAmount: (val: number) => void;
  symbol: string;
}

export const CoreSettings: React.FC<CoreSettingsProps> = memo(({
  botName, setBotName, mode, setMode, exchangeId, setExchangeId, configuredExchanges, tradeAmount, setTradeAmount, symbol
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-primary border-b border-panel pb-2">Core Settings</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-secondary uppercase tracking-wider">Bot Name</label>
          <input 
            type="text" 
            value={botName}
            onChange={(e) => setBotName(e.target.value)}
            className="w-full bg-primary border border-panel rounded-lg px-3 py-2 text-primary text-sm focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="e.g. BTC-Wallhunter-1"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-secondary uppercase tracking-wider">Pair</label>
          <input 
            type="text" 
            value={symbol}
            disabled
            className="w-full bg-panel border border-panel rounded-lg px-3 py-2 text-secondary font-bold text-sm cursor-not-allowed"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-secondary uppercase tracking-wider">Execution Mode</label>
          <select 
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full bg-primary border border-panel rounded-lg px-3 py-2 text-primary text-sm focus:outline-none focus:border-[var(--color-brand)] transition-colors"
          >
            <option value="paper">Paper Trading (Simulated)</option>
            <option value="real">Real Trading (Live Funds)</option>
          </select>
        </div>
        
        {mode === 'real' ? (
          <div className="space-y-1">
            <label className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center justify-between">
              Exchange
            </label>
            <select 
              value={exchangeId}
              onChange={(e) => setExchangeId(e.target.value)}
              className="w-full bg-primary border border-panel rounded-lg px-3 py-2 text-primary text-sm focus:outline-none focus:border-[var(--color-brand)] transition-colors capitalize"
            >
              {configuredExchanges.length === 0 ? (
                <option value="" disabled>No API Keys found</option>
              ) : (
                configuredExchanges.map(ex => (
                  <option key={ex.id} value={ex.exchange_id}>{ex.exchange_id}</option>
                ))
              )}
            </select>
          </div>
        ) : (
          <div className="space-y-1">
            <label className="text-xs font-bold text-secondary uppercase tracking-wider">Base Order Size</label>
            <div className="relative">
              <input 
                type="number" 
                step="0.01"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(Number(e.target.value))}
                className="w-full bg-primary border border-panel rounded-lg pl-3 pr-10 py-2 text-primary text-sm focus:outline-none focus:border-[var(--color-brand)] transition-colors"
              />
              <span className="absolute right-3 top-2 text-gray-500 text-sm">COIN</span>
            </div>
          </div>
        )}
      </div>

      {mode === 'real' && (
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-secondary uppercase tracking-wider">Base Order Size</label>
            <div className="relative">
              <input 
                type="number" 
                step="0.01"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(Number(e.target.value))}
                className="w-full bg-primary border border-panel rounded-lg pl-3 pr-10 py-2 text-primary text-sm focus:outline-none focus:border-[var(--color-brand)] transition-colors"
              />
              <span className="absolute right-3 top-2 text-gray-500 text-sm">COIN</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
