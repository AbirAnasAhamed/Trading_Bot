import React, { useState, useEffect, useCallback } from 'react';
import { Key, Save, Trash2, Loader2, Plus, AlertCircle } from 'lucide-react';
import { exchangeKeysService } from './../../services/api/exchangeKeys';
import type { ExchangeKey, SupportedExchange } from './../../services/api/exchangeKeys';

export const ExchangeKeysManager: React.FC = () => {
  const [keys, setKeys] = useState<ExchangeKey[]>([]);
  const [supportedExchanges, setSupportedExchanges] = useState<SupportedExchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [formExchange, setFormExchange] = useState('binance');
  const [formApiKey, setFormApiKey] = useState('');
  const [formApiSecret, setFormApiSecret] = useState('');
  const [formPassphrase, setFormPassphrase] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchSupportedExchanges = useCallback(async () => {
    try {
      const data = await exchangeKeysService.getSupported();
      setSupportedExchanges(data);
    } catch (err) {
      console.error('Failed to fetch supported exchanges:', err);
    }
  }, []);

  const fetchKeys = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await exchangeKeysService.getKeys();
      setKeys(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
    fetchSupportedExchanges();
  }, [fetchKeys, fetchSupportedExchanges]);

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formApiKey || !formApiSecret) {
      setError("API Key and Secret are required.");
      return;
    }

    try {
      setFormLoading(true);
      setError(null);
      await exchangeKeysService.addKey({
        exchange_id: formExchange,
        api_key: formApiKey,
        api_secret: formApiSecret,
        passphrase: formPassphrase || undefined
      });
      
      setIsAdding(false);
      setFormApiKey('');
      setFormApiSecret('');
      setFormPassphrase('');
      await fetchKeys();
    } catch (err: any) {
      setError(err.message || 'Failed to save key');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (exchangeId: string) => {
    if (!confirm(`Are you sure you want to disconnect ${exchangeId}?`)) return;
    
    try {
      setLoading(true);
      await exchangeKeysService.deleteKey(exchangeId);
      await fetchKeys();
    } catch (err: any) {
      setError(err.message || 'Failed to delete key');
      setLoading(false);
    }
  };

  return (
    <div className="bg-panel border border-panel rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Key className="w-6 h-6 mr-3 text-brand" style={{ color: 'var(--color-brand)' }} />
          <h2 className="text-lg font-bold text-primary">Exchange API Keys</h2>
        </div>
        
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center px-4 py-2 bg-[var(--color-brand)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Exchange
          </button>
        )}
      </div>
      
      <p className="text-secondary text-sm mb-6">
        Connect your exchange accounts to allow the bots to trade on your behalf.
        Your keys are symmetrically encrypted in the database for maximum security.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center text-sm">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}

      {/* List Connected Exchanges */}
      {!isAdding && (
        <div className="space-y-3 mb-6">
          {loading ? (
            <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-brand" /></div>
          ) : keys.length === 0 ? (
            <div className="text-center p-6 border border-dashed border-panel rounded-lg text-secondary">
              No exchanges connected yet.
            </div>
          ) : (
            keys.map(key => (
              <div key={key.id} className="flex items-center justify-between p-4 bg-background border border-panel rounded-lg transition-colors hover:border-brand/30">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-panel flex items-center justify-center font-bold text-primary uppercase text-sm">
                    {key.exchange_id.substring(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-primary capitalize">{key.exchange_id}</p>
                    <p className="text-xs text-secondary">API Key: <span className="font-mono text-muted">{key.masked_api_key}</span></p>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDelete(key.exchange_id)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Disconnect"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="bg-background border border-panel rounded-lg p-5 animate-in fade-in slide-in-from-top-2 duration-300">
          <h3 className="text-sm font-semibold text-primary mb-4">Connect New Exchange</h3>
          <form onSubmit={handleSaveKey} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Exchange</label>
              <select 
                value={formExchange}
                onChange={(e) => setFormExchange(e.target.value)}
                className="w-full bg-primary border border-panel rounded-lg px-4 py-2 text-primary focus:outline-none focus:border-brand transition-colors"
              >
                {supportedExchanges.map(ex => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary mb-1">API Key</label>
              <input 
                type="text" 
                value={formApiKey}
                onChange={(e) => setFormApiKey(e.target.value)}
                placeholder="Enter your API Key"
                className="w-full bg-primary border border-panel rounded-lg px-4 py-2 text-primary focus:outline-none focus:border-brand transition-colors placeholder:text-muted"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Secret Key</label>
              <input 
                type="password" 
                value={formApiSecret}
                onChange={(e) => setFormApiSecret(e.target.value)}
                placeholder="Enter your Secret Key"
                className="w-full bg-primary border border-panel rounded-lg px-4 py-2 text-primary focus:outline-none focus:border-brand transition-colors placeholder:text-muted"
              />
            </div>

            {supportedExchanges.find(ex => ex.id === formExchange)?.requires_passphrase && (
              <div>
                <label className="block text-sm font-medium text-primary mb-1">Passphrase / Password</label>
                <input 
                  type="password" 
                  value={formPassphrase}
                  onChange={(e) => setFormPassphrase(e.target.value)}
                  placeholder="Enter your Passphrase"
                  className="w-full bg-primary border border-panel rounded-lg px-4 py-2 text-primary focus:outline-none focus:border-brand transition-colors placeholder:text-muted"
                />
              </div>
            )}
            
            <div className="pt-2 flex items-center space-x-3">
              <button 
                type="submit" 
                disabled={formLoading}
                className="flex items-center px-6 py-2 bg-[var(--color-brand)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
              >
                {formLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Keys
              </button>
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="px-6 py-2 bg-transparent border border-panel text-primary rounded-lg hover:bg-panel transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
