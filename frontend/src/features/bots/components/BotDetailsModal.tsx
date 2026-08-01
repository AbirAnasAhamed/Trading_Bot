import React, { useEffect, useState } from 'react';
import { X, Loader2, Activity, TrendingUp, Settings } from 'lucide-react';

interface Trade {
  id: number;
  symbol: string;
  timestamp: string;
  trade_type: string;
  price: number;
  amount: number;
  pnl: number;
}

interface BotDetails {
  bot_id: string;
  is_running: boolean;
  is_paused: boolean;
  symbol: string;
  mode: string;
  config: any;
  recent_trades: Trade[];
  current_pnl: number;
}

interface BotDetailsModalProps {
  botId: string;
  token: string;
  onClose: () => void;
}

export const BotDetailsModal: React.FC<BotDetailsModalProps> = ({ botId, token, onClose }) => {
  const [details, setDetails] = useState<BotDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/bot/${botId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Failed to fetch bot details");
        const data = await response.json();
        setDetails(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [botId, token]);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-panel border border-panel rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-panel flex justify-between items-center bg-primary/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Bot Analytics: {botId}</h2>
              <p className="text-sm text-gray-400">Detailed overview and recent trade history</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : error || !details ? (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-center">
              {error || "Bot details not available."}
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-panel bg-primary/5">
                  <p className="text-sm text-gray-400 mb-1">Total PnL</p>
                  <p className={`text-2xl font-bold ${details.current_pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${details.current_pnl.toFixed(2)}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-panel bg-primary/5">
                  <p className="text-sm text-gray-400 mb-1">Status</p>
                  <p className="text-lg font-bold text-white flex items-center">
                    {details.is_running ? (details.is_paused ? 'Paused' : 'Running') : 'Stopped'}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-panel bg-primary/5">
                  <p className="text-sm text-gray-400 mb-1">Trading Pair</p>
                  <p className="text-lg font-bold text-white">{details.symbol}</p>
                </div>
              </div>

              {/* Config Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-blue-400" />
                  Strategy Configuration
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-primary/5 p-4 rounded-xl border border-panel">
                  {Object.entries(details.config).map(([key, val]) => (
                    <div key={key}>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">{key.replace('_', ' ')}</p>
                      <p className="font-medium text-white">{(val as any)?.toString() || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Trades Table */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                  Recent Trades
                </h3>
                <div className="border border-panel rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-primary/10">
                      <tr>
                        <th className="px-4 py-3 font-medium text-gray-400">Date</th>
                        <th className="px-4 py-3 font-medium text-gray-400">Type</th>
                        <th className="px-4 py-3 font-medium text-gray-400">Price</th>
                        <th className="px-4 py-3 font-medium text-gray-400">Amount</th>
                        <th className="px-4 py-3 font-medium text-gray-400">PnL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-panel">
                      {details.recent_trades.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                            No trades recorded yet.
                          </td>
                        </tr>
                      ) : (
                        details.recent_trades.map(trade => (
                          <tr key={trade.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3 text-gray-300">{formatDate(trade.timestamp)}</td>
                            <td className="px-4 py-3 font-bold">
                              <span className={trade.trade_type === 'buy' || trade.trade_type === 'BUY' ? 'text-green-500' : 'text-red-500'}>
                                {trade.trade_type.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-white">${trade.price.toLocaleString()}</td>
                            <td className="px-4 py-3 text-white">{trade.amount}</td>
                            <td className="px-4 py-3 font-medium">
                              <span className={trade.pnl > 0 ? 'text-green-500' : trade.pnl < 0 ? 'text-red-500' : 'text-gray-400'}>
                                {trade.pnl > 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
