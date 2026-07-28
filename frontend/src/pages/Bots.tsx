import React from 'react';
import { Play, Square, Settings as SettingsIcon, Plus } from 'lucide-react';

const mockBots = [
  { id: 1, name: 'BTC Grid Bot', pair: 'BTC/USDT', strategy: 'Grid Trading', status: 'running', profit: '+ $145.20' },
  { id: 2, name: 'ETH DCA', pair: 'ETH/USDT', strategy: 'DCA', status: 'stopped', profit: '- $12.50' },
  { id: 3, name: 'SOL MACD', pair: 'SOL/USDT', strategy: 'MACD Crossover', status: 'running', profit: '+ $89.00' },
];

export const Bots: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button className="flex items-center px-4 py-2 bg-[var(--color-brand)] text-white rounded-lg hover:bg-blue-600 transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          Create New Bot
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockBots.map(bot => (
          <div key={bot.id} className="bg-panel border border-panel rounded-xl p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-primary">{bot.name}</h3>
                <span className="text-sm font-medium px-2 py-1 bg-primary text-secondary rounded mt-2 inline-block">
                  {bot.pair}
                </span>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${bot.status === 'running' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                {bot.status}
              </div>
            </div>
            
            <div className="flex-1">
              <p className="text-sm text-secondary mb-1">Strategy</p>
              <p className="font-medium text-primary mb-4">{bot.strategy}</p>
              
              <p className="text-sm text-secondary mb-1">Current PnL</p>
              <p className={`font-bold text-lg ${bot.profit.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {bot.profit}
              </p>
            </div>
            
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-panel">
              <button className="flex items-center text-sm font-medium text-secondary hover:text-primary transition-colors">
                <SettingsIcon className="w-4 h-4 mr-2" />
                Configure
              </button>
              
              {bot.status === 'running' ? (
                <button className="flex items-center px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors">
                  <Square className="w-4 h-4 mr-1" /> Stop
                </button>
              ) : (
                <button className="flex items-center px-3 py-1.5 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded transition-colors">
                  <Play className="w-4 h-4 mr-1" /> Start
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
