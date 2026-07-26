import React from 'react';
import { Key, Save } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-primary">Settings</h1>
      
      <div className="bg-panel border border-panel rounded-xl shadow-sm p-6">
        <div className="flex items-center mb-6">
          <Key className="w-6 h-6 mr-3 text-brand" style={{ color: 'var(--color-brand)' }} />
          <h2 className="text-lg font-bold text-primary">Exchange API Keys</h2>
        </div>
        
        <p className="text-secondary text-sm mb-6">
          Connect your exchange accounts to allow the bots to trade on your behalf.
          Your keys are encrypted and stored securely.
        </p>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Exchange</label>
            <select className="w-full bg-primary border border-panel rounded-lg px-4 py-2 text-primary focus:outline-none focus:border-brand transition-colors">
              <option value="binance">Binance</option>
              <option value="kucoin">KuCoin</option>
              <option value="kraken">Kraken</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-primary mb-1">API Key</label>
            <input 
              type="text" 
              placeholder="Enter your API Key"
              className="w-full bg-primary border border-panel rounded-lg px-4 py-2 text-primary focus:outline-none focus:border-brand transition-colors placeholder:text-muted"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Secret Key</label>
            <input 
              type="password" 
              placeholder="Enter your Secret Key"
              className="w-full bg-primary border border-panel rounded-lg px-4 py-2 text-primary focus:outline-none focus:border-brand transition-colors placeholder:text-muted"
            />
          </div>
          
          <div className="pt-4">
            <button type="button" className="flex items-center px-6 py-2 bg-[var(--color-brand)] text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
              <Save className="w-4 h-4 mr-2" />
              Save Keys
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
