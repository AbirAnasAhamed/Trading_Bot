import React, { memo } from 'react';

interface L2OrderbookConfigProps {
  wallMultiplier: number;
  setWallMultiplier: (val: number) => void;
  minWallVolume: number;
  setMinWallVolume: (val: number) => void;
}

export const L2OrderbookConfig: React.FC<L2OrderbookConfigProps> = memo(({
  wallMultiplier, setWallMultiplier, minWallVolume, setMinWallVolume
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-primary border-b border-panel pb-2">L2 Wallhunter Strategy</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-secondary uppercase tracking-wider">Wall Multiplier</label>
          <div className="relative">
            <input 
              type="number" 
              step="0.1"
              min="1.0"
              value={wallMultiplier}
              onChange={(e) => setWallMultiplier(Number(e.target.value))}
              className="w-full bg-primary border border-panel rounded-lg pl-3 pr-8 py-2 text-primary text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
            <span className="absolute right-3 top-2 text-gray-500 text-sm">X</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Ratio to trigger buy/sell</p>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-secondary uppercase tracking-wider">Min Wall Vol (USD)</label>
          <div className="relative">
            <input 
              type="number" 
              step="1000"
              value={minWallVolume}
              onChange={(e) => setMinWallVolume(Number(e.target.value))}
              className="w-full bg-primary border border-panel rounded-lg pl-3 pr-8 py-2 text-primary text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
            <span className="absolute right-3 top-2 text-gray-500 text-sm">$</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Ignore fake low-liquidity walls</p>
        </div>
      </div>
    </div>
  );
});
