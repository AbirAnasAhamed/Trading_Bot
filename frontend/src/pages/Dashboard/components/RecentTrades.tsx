import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { tradeService } from '../../../services/api/trades';
import type { Trade } from '../../../services/api/trades';
import { Loader2, ArrowRight } from 'lucide-react';

export const RecentTrades: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const data = await tradeService.getTrades(0, 5); // Fetch top 5 recent trades
        setTrades(data);
      } catch (err) {
        console.error("Failed to load recent trades", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrades();
  }, []);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-panel border border-panel rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-panel flex justify-between items-center">
        <h3 className="font-bold text-primary">Recent Trades</h3>
        <button 
          onClick={() => navigate('/history')}
          className="text-sm text-brand flex items-center hover:opacity-80 transition-opacity"
          style={{ color: 'var(--color-brand)' }}
        >
          View All History <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-brand" style={{ color: 'var(--color-brand)' }} />
        </div>
      ) : trades.length === 0 ? (
        <div className="p-8 text-center text-secondary text-sm">
          No recent trades found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary/50 text-secondary text-xs uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Pair</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">PnL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {trades.map((trade) => (
                <tr key={trade.id} className="hover:bg-primary/30 transition-colors text-primary">
                  <td className="px-4 py-3 text-xs text-secondary">{formatDate(trade.timestamp)}</td>
                  <td className="px-4 py-3 text-sm font-bold">{trade.symbol}</td>
                  <td className="px-4 py-3 text-sm font-bold">
                    <span className={trade.trade_type === 'BUY' ? 'text-green-500' : 'text-red-500'}>
                      {trade.trade_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">${trade.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
                  <td className="px-4 py-3 text-sm font-bold">
                    <span className={trade.pnl > 0 ? 'text-green-500' : trade.pnl < 0 ? 'text-red-500' : 'text-secondary'}>
                      {trade.pnl > 0 ? '+' : ''}{trade.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
