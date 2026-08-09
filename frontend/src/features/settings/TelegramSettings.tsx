import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader2, ExternalLink, ShieldCheck, Settings as SettingsIcon } from 'lucide-react';

interface TelegramStatus {
  is_connected: boolean;
  chat_id: string | null;
  notifications_enabled: boolean;
  bot_username: string;
}

export const TelegramSettings: React.FC = () => {
  const { token } = useAuth();
  const [status, setStatus] = useState<TelegramStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/telegram/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error("Failed to fetch telegram status", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll for status every 3 seconds if not connected
    const interval = setInterval(() => {
      if (status && !status.is_connected) {
        fetchStatus();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [token, status?.is_connected]);

  const handleConnect = async () => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/telegram/connect-token', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to generate connection token');
      
      const data = await res.json();
      if (data.link) {
        window.open(data.link, '_blank');
      } else {
        setError('Bot username not configured on server.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm("Are you sure you want to disconnect Telegram?")) return;
    
    setActionLoading(true);
    try {
      const res = await fetch('/api/telegram/disconnect', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchStatus();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleNotifications = async () => {
    if (!status) return;
    
    const newEnabled = !status.notifications_enabled;
    // Optimistic update
    setStatus({ ...status, notifications_enabled: newEnabled });
    
    try {
      await fetch('/api/telegram/toggle', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enabled: newEnabled })
      });
    } catch (err) {
      // Revert on failure
      setStatus({ ...status, notifications_enabled: !newEnabled });
      console.error(err);
    }
  };

  if (loading && !status) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="bg-panel border border-panel rounded-xl p-6 shadow-sm">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-blue-500/10 rounded-xl mr-4">
          <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-18 8a2.25 2.25 0 0 0 .12 4.17l5.225 1.742 2.15 6.45a2.25 2.25 0 0 0 4.144.184l2.87-4.305 4.545 3.409a2.25 2.25 0 0 0 3.593-1.63L23.448 3.32a2.25 2.25 0 0 0-2.25-2.887zM8.5 15.5l5.5-5.5"></path>
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Telegram Integration</h2>
          <p className="text-sm text-gray-400">Receive real-time alerts and trading updates directly on Telegram.</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
          {error}
        </div>
      )}

      {status?.is_connected ? (
        <div className="space-y-6">
          <div className="p-4 border border-green-500/30 bg-green-500/5 rounded-xl flex items-center justify-between">
            <div className="flex items-center">
              <ShieldCheck className="w-5 h-5 text-green-500 mr-3" />
              <div>
                <p className="font-bold text-green-500">Connected</p>
                <p className="text-xs text-gray-400">Chat ID: {status.chat_id}</p>
              </div>
            </div>
            <button 
              onClick={handleDisconnect}
              disabled={actionLoading}
              className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20"
            >
              Disconnect
            </button>
          </div>

          <div className="border border-panel rounded-xl p-4 bg-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white">Enable Notifications</h3>
                <p className="text-sm text-gray-400">Receive alerts for trades and bot status changes.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={status.notifications_enabled}
                  onChange={handleToggleNotifications}
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-brand)]"></div>
              </label>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 px-4 border border-dashed border-panel rounded-xl bg-primary/10">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <SettingsIcon className="w-8 h-8 text-blue-500 opacity-80" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Not Connected</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
            Click the button below to open Telegram and connect your account automatically. You'll receive real-time alerts for all your bot's activities.
          </p>
          <button
            onClick={handleConnect}
            disabled={actionLoading}
            className="px-6 py-3 bg-[var(--color-brand)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center mx-auto min-w-[200px]"
          >
            {actionLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Connect Telegram <ExternalLink className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
