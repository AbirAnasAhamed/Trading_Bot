import React, { memo } from 'react';

interface CoreSettingsProps {
  botName: string;
  setBotName: (val: string) => void;
  mode: string;
  setMode: (val: string) => void;
  tradeAmount: number;
  setTradeAmount: (val: number) => void;
  symbol: string;
}

export const CoreSettings: React.FC<CoreSettingsProps> = memo(({
  botName, setBotName, mode, setMode, tradeAmount, setTradeAmount, symbol
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white border-b border-panel pb-2">Core Settings</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bot Name</label>
          <input 
            type="text" 
            value={botName}
            onChange={(e) => setBotName(e.target.value)}
            className="w-full bg-[#0d0f15] border border-panel rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="e.g. BTC-Wallhunter-1"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pair</label>
          <input 
            type="text" 
            value={symbol}
            disabled
            className="w-full bg-[#1a1c23] border border-panel rounded-lg px-3 py-2 text-gray-400 font-bold text-sm cursor-not-allowed"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Execution Mode</label>
          <select 
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full bg-[#0d0f15] border border-panel rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="paper">Paper Trading (Simulated)</option>
            <option value="real">Real Trading (Live Funds)</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Base Order Size</label>
          <div className="relative">
            <input 
              type="number" 
              step="0.01"
              value={tradeAmount}
              onChange={(e) => setTradeAmount(Number(e.target.value))}
              className="w-full bg-[#0d0f15] border border-panel rounded-lg pl-3 pr-10 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
            <span className="absolute right-3 top-2 text-gray-500 text-sm">COIN</span>
          </div>
        </div>
      </div>
    </div>
  );
});
