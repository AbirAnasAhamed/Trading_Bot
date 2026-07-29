import React, { useEffect, useState, useCallback } from 'react';
import { Settings as SettingsIcon, Trash2, Loader2, Play, Pause } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface BotState {
  bot_id: string;
  is_running: boolean;
  is_paused: boolean;
  symbol: string;
  mode: string;
}

export const Bots: React.FC = () => {
  const { token } = useAuth();
  const [bots, setBots] = useState<BotState[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchBots = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/api/bot/state', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBots(data);
      }
    } catch (err) {
      console.error("Failed to fetch bots", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBots();
    // Poll every 5 seconds to keep it live
    const interval = setInterval(fetchBots, 5000);
    return () => clearInterval(interval);
  }, [fetchBots]);

  const handleDelete = async (bot_name: string) => {
    setDeletingId(bot_name);
    try {
      const response = await fetch('http://localhost:8000/api/bot/stop', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bot_name })
      });
      if (response.ok) {
        // Refresh bots after deletion
        await fetchBots();
      }
    } catch (err) {
      console.error("Failed to delete bot", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePause = async (bot: BotState) => {
    setTogglingId(bot.bot_id);
    const endpoint = bot.is_paused ? '/api/bot/resume' : '/api/bot/pause';
    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bot_name: bot.bot_id })
      });
      if (response.ok) {
        await fetchBots();
      }
    } catch (err) {
      console.error("Failed to toggle bot state", err);
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bots.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 bg-panel border border-panel rounded-xl text-center">
            <h3 className="text-lg font-bold text-white mb-2">No active bots found</h3>
            <p className="text-gray-400">Deploy a Wallhunter bot from the HFTrading tab to see it here.</p>
          </div>
        ) : (
          bots.map(bot => (
            <div key={bot.bot_id} className="bg-panel border border-panel rounded-xl p-6 shadow-sm flex flex-col hover:border-blue-500/30 transition-colors duration-300 relative group overflow-hidden">
              {/* Background gradient hint */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <h3 className="text-lg font-bold text-white">{bot.bot_id}</h3>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs font-bold px-2 py-1 bg-[#1e2330] text-blue-400 rounded border border-blue-500/20">
                      {bot.symbol}
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded border uppercase ${
                      bot.mode === 'real' 
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }`}>
                      {bot.mode}
                    </span>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1.5 ${
                  !bot.is_running
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                    : bot.is_paused
                      ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                      : 'bg-green-500/10 text-green-500 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                }`}>
                  {bot.is_running && !bot.is_paused && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                  {bot.is_running && bot.is_paused && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />}
                  {!bot.is_running && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                  {!bot.is_running ? 'Stopped' : bot.is_paused ? 'Paused' : 'Running'}
                </div>
              </div>
              
              <div className="flex-1 mt-2 relative z-10">
                <p className="text-sm text-gray-400 mb-1">Strategy</p>
                <p className="font-medium text-white mb-4">L2 Wallhunter</p>
                
                <p className="text-sm text-gray-400 mb-1">Current PnL</p>
                <p className="font-bold text-lg text-gray-300">
                  ---
                </p>
              </div>
              
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-panel relative z-10">
                <button className="flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors">
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Details
                </button>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleTogglePause(bot)}
                    disabled={togglingId === bot.bot_id || !bot.is_running}
                    className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50 ${
                      bot.is_paused 
                        ? 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white' 
                        : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-white'
                    }`}
                    title={bot.is_paused ? "Resume Bot" : "Pause Bot"}
                  >
                    {togglingId === bot.bot_id ? (
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    ) : bot.is_paused ? (
                      <Play className="w-4 h-4 mr-1.5" />
                    ) : (
                      <Pause className="w-4 h-4 mr-1.5" />
                    )}
                    {bot.is_paused ? 'Resume' : 'Pause'}
                  </button>
                  
                  <button 
                    onClick={() => handleDelete(bot.bot_id)}
                    disabled={deletingId === bot.bot_id}
                    className="flex items-center px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all duration-300 disabled:opacity-50"
                    title="Stop and Delete Bot"
                  >
                    {deletingId === bot.bot_id ? (
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-1.5" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
