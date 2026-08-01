import React, { memo } from 'react';

interface RiskSettingsProps {
  takeProfit: number;
  setTakeProfit: (val: number) => void;
  stopLoss: number;
  setStopLoss: (val: number) => void;
}

export const RiskSettings: React.FC<RiskSettingsProps> = memo(({
  takeProfit, setTakeProfit, stopLoss, setStopLoss
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-primary border-b border-panel pb-2">Risk Management</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-secondary uppercase tracking-wider">Take Profit (%)</label>
          <div className="relative">
            <input 
              type="number" 
              step="0.1"
              value={takeProfit}
              onChange={(e) => setTakeProfit(Number(e.target.value))}
              className="w-full bg-primary border border-panel rounded-lg pl-3 pr-8 py-2 text-primary text-sm focus:outline-none focus:border-green-500 transition-colors"
            />
            <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-secondary uppercase tracking-wider">Stop Loss (%)</label>
          <div className="relative">
            <input 
              type="number" 
              step="0.1"
              value={stopLoss}
              onChange={(e) => setStopLoss(Number(e.target.value))}
              className="w-full bg-primary border border-panel rounded-lg pl-3 pr-8 py-2 text-primary text-sm focus:outline-none focus:border-red-500 transition-colors"
            />
            <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
          </div>
        </div>
      </div>
      
      <div className="bg-panel border border-panel rounded-lg p-3">
         <p className="text-xs text-secondary italic">Advanced risk settings (Trailing SL, Max Drawdown) can be added here in the future.</p>
      </div>
    </div>
  );
});
