import React, { useEffect, useState } from 'react';
import { tradeService } from '../../services/api/trades';
import type { Trade } from '../../services/api/trades';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

export const History: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchTrades = async (currentPage: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const skip = (currentPage - 1) * limit;
      const data = await tradeService.getTrades(skip, limit);
      setTrades(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load trades');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades(page);
  }, [page]);



  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (isLoading && trades.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand" style={{ color: 'var(--color-brand)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => window.history.back()}
            className="p-2 bg-panel border border-panel rounded-lg hover:bg-primary transition-colors text-secondary hover:text-primary"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-primary">All Trade History</h2>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20">
          {error}
        </div>
      )}
      
      <div className="bg-panel border border-panel rounded-xl shadow-sm overflow-hidden flex flex-col">
        {trades.length === 0 && !isLoading ? (
          <div className="p-8 text-center text-secondary">
            No trades found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-primary/50 text-secondary text-sm uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">Trade ID</th>
                    <th className="px-6 py-4 font-medium">Date & Time</th>
                    <th className="px-6 py-4 font-medium">Pair</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Price</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Total</th>
                    <th className="px-6 py-4 font-medium">PnL</th>
                    <th className="px-6 py-4 font-medium">Execution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {trades.map((trade) => (
                    <tr key={trade.id} className="hover:bg-primary/30 transition-colors text-primary">
                      <td className="px-6 py-4 text-sm font-medium">TRD-{trade.id}</td>
                      <td className="px-6 py-4 text-sm text-secondary">{formatDate(trade.timestamp)}</td>
                      <td className="px-6 py-4 text-sm font-bold">{trade.symbol}</td>
                      <td className="px-6 py-4 text-sm font-bold">
                        <span className={trade.trade_type === 'BUY' ? 'text-green-500' : 'text-red-500'}>
                          {trade.trade_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">${trade.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
                      <td className="px-6 py-4 text-sm">{trade.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-medium">${(trade.price * trade.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 text-sm font-bold">
                        <span className={trade.pnl > 0 ? 'text-green-500' : trade.pnl < 0 ? 'text-red-500' : 'text-secondary'}>
                          {trade.pnl > 0 ? '+' : ''}{trade.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary">{trade.execution_type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            <div className="p-4 border-t border-panel flex items-center justify-between bg-primary/20">
              <span className="text-sm text-secondary">
                Showing page {page}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                  className="p-2 rounded-lg bg-panel border border-panel text-secondary hover:text-primary hover:bg-primary transition-colors disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={trades.length < limit || isLoading}
                  className="p-2 rounded-lg bg-panel border border-panel text-secondary hover:text-primary hover:bg-primary transition-colors disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
