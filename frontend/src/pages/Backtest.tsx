import React from 'react';
import { Settings, Clock } from 'lucide-react';

export const Backtest: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
      <div className="bg-panel border border-panel rounded-full p-6 mb-6">
        <Settings className="w-16 h-16 text-brand animate-pulse" style={{ color: 'var(--color-brand)' }} />
      </div>
      <h2 className="text-3xl font-bold text-primary mb-4">Backtest Engine</h2>
      <p className="text-lg text-secondary max-w-lg mb-8">
        We are building a world-class historical testing engine to validate your trading strategies before deploying real capital.
      </p>
      <div className="flex items-center px-6 py-3 bg-brand/10 border border-brand/20 text-brand rounded-full font-medium" style={{ color: 'var(--color-brand)' }}>
        <Clock className="w-5 h-5 mr-2" />
        Coming Soon
      </div>
    </div>
  );
};
