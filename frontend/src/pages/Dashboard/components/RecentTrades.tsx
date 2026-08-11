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
    <div className="relative bg-panel/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col group transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
      {/* Techy accents */}
      <div className="absolute top-0 right-0 w-32 h-1 bg-gradient-to-l from-brand to-transparent opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-1 bg-gradient-to-r from-brand to-transparent opacity-50 pointer-events-none" />

      <div className="p-5 border-b border-white/5 flex justify-between items-center relative z-10 bg-black/20">
        <h3 className="text-sm font-semibold tracking-widest text-secondary uppercase flex items-center">
          <span className="w-2 h-2 rounded-full bg-brand mr-2 animate-pulse shadow-[0_0_8px_var(--color-brand)]" />
          Live Trade Feed
        </h3>
        <button 
          onClick={() => navigate('/history')}
          className="text-xs uppercase tracking-wider font-bold text-brand flex items-center hover:text-white transition-colors group-hover:drop-shadow-[0_0_5px_var(--color-brand)]"
        >
          View All <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand" style={{ color: 'var(--color-brand)' }} />
        </div>
      ) : trades.length === 0 ? (
        <div className="p-12 text-center text-secondary text-sm font-mono opacity-60">
          &gt; NO_RECENT_TRADES_FOUND
        </div>
      ) : (
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 text-secondary text-[10px] uppercase tracking-[0.2em]">
                <th className="px-5 py-3 font-medium">Timestamp</th>
                <th className="px-5 py-3 font-medium">Pair</th>
                <th className="px-5 py-3 font-medium">Action</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">PnL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {trades.map((trade) => (
                <tr key={trade.id} className="hover:bg-white/5 transition-colors group/row">
                  <td className="px-5 py-4 text-xs font-mono text-secondary group-hover/row:text-white transition-colors">{formatDate(trade.timestamp)}</td>
                  <td className="px-5 py-4 text-sm font-bold text-primary tracking-wide">{trade.symbol}</td>
                  <td className="px-5 py-4 text-xs font-bold">
                    <span className={`px-2 py-1 rounded border ${trade.trade_type === 'BUY' ? 'border-green-500/50 bg-green-500/10 text-green-400 drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'border-red-500/50 bg-red-500/10 text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]'}`}>
                      {trade.trade_type}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-mono text-primary drop-shadow-sm">${trade.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
                  <td className="px-5 py-4 text-sm font-bold font-mono">
                    <span className={trade.pnl > 0 ? 'text-green-400 drop-shadow-[0_0_5px_rgba(34,197,94,0.4)]' : trade.pnl < 0 ? 'text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.4)]' : 'text-secondary'}>
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
