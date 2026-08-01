import React, { useEffect, useState } from 'react';
import { systemService } from '../services/api/system';
import type { BacktestResult } from '../services/api/system';
import { Loader2, Play, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Backtest: React.FC = () => {
  const [history, setHistory] = useState<BacktestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<string>('');

  // Form State
  const [strategy, setStrategy] = useState('MACD Crossover');
  const [pair, setPair] = useState('BTC/USDT');
  const [timeframe, setTimeframe] = useState('15m');

  const fetchHistory = async () => {
    try {
      const data = await systemService.getBacktestHistory();
      setHistory(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch backtest history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (activeTaskId) {
      interval = setInterval(async () => {
        try {
          const res = await systemService.getTaskStatus(activeTaskId);
          setTaskStatus(res.status);
          
          if (res.status === 'SUCCESS' || res.status === 'FAILURE') {
            setActiveTaskId(null);
            clearInterval(interval);
            // Re-fetch history to get the newly saved result
            await fetchHistory();
          }
        } catch (e) {
          console.error("Error polling task status", e);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [activeTaskId]);

  const handleRunBacktest = async () => {
    try {
      const res = await systemService.triggerBacktest({ strategy, pair, timeframe });
      setActiveTaskId(res.task_id);
      setTaskStatus('PENDING');
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to start backtest');
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-primary">Backtest Engine</h2>
      </div>
      
      {error && (
        <div className="p-4 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Control Panel */}
      <div className="bg-panel border border-panel rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm text-secondary mb-1">Strategy</label>
            <select 
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full bg-primary border border-panel rounded-lg px-3 py-2 text-primary focus:outline-none focus:border-brand"
            >
              <option value="MACD Crossover">MACD Crossover</option>
              <option value="RSI Reversal">RSI Reversal</option>
              <option value="Bollinger Bands">Bollinger Bands</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-secondary mb-1">Asset Pair</label>
            <select 
              value={pair}
              onChange={(e) => setPair(e.target.value)}
              className="w-full bg-primary border border-panel rounded-lg px-3 py-2 text-primary focus:outline-none focus:border-brand"
            >
              <option value="BTC/USDT">BTC/USDT</option>
              <option value="ETH/USDT">ETH/USDT</option>
              <option value="SOL/USDT">SOL/USDT</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-secondary mb-1">Timeframe</label>
            <select 
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full bg-primary border border-panel rounded-lg px-3 py-2 text-primary focus:outline-none focus:border-brand"
            >
              <option value="15m">15m</option>
              <option value="1h">1h</option>
              <option value="4h">4h</option>
              <option value="1d">1d</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleRunBacktest}
              disabled={!!activeTaskId}
              className="w-full flex items-center justify-center px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-brand)' }}
            >
              {activeTaskId ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2 fill-current" />}
              {activeTaskId ? 'Running...' : 'Run Backtest'}
            </button>
          </div>
        </div>
        
        {activeTaskId && (
          <div className="mt-4 p-4 bg-brand/10 border border-brand/20 rounded-lg flex items-center justify-between">
            <div className="flex items-center text-brand">
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              <span className="font-medium">Backtest is running in background...</span>
            </div>
            <span className="text-sm font-bold uppercase px-3 py-1 bg-brand/20 rounded">{taskStatus}</span>
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="bg-panel border border-panel rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-panel">
          <h3 className="font-bold text-primary">Backtest History</h3>
        </div>
        
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-secondary">
            No backtest history found. Run a backtest to see results here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary/50 text-secondary text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Strategy</th>
                  <th className="px-6 py-4 font-medium">Pair (TF)</th>
                  <th className="px-6 py-4 font-medium">Trades</th>
                  <th className="px-6 py-4 font-medium">Win Rate</th>
                  <th className="px-6 py-4 font-medium">Total PnL</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-primary/30 transition-colors text-primary">
                    <td className="px-6 py-4 text-sm text-secondary">{formatDate(item.created_at)}</td>
                    <td className="px-6 py-4 text-sm font-medium">{item.strategy_name}</td>
                    <td className="px-6 py-4 text-sm font-bold">{item.symbol} <span className="text-secondary font-normal">({item.timeframe})</span></td>
                    <td className="px-6 py-4 text-sm">{item.total_trades}</td>
                    <td className="px-6 py-4 text-sm font-bold text-blue-400">{item.win_rate}%</td>
                    <td className="px-6 py-4 text-sm font-bold">
                      <span className={item.total_pnl > 0 ? 'text-green-500' : 'text-red-500'}>
                        {item.total_pnl > 0 ? '+' : ''}${item.total_pnl.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center text-green-500">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        <span className="capitalize">{item.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
