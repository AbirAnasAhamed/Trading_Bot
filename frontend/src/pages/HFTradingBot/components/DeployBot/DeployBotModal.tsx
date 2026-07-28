import React, { useState, useCallback } from 'react';
import { X, Rocket, Loader2 } from 'lucide-react';
import { CoreSettings } from './CoreSettings';
import { RiskSettings } from './RiskSettings';
import { L2OrderbookConfig } from './strategies/L2OrderbookConfig';

interface DeployBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
}

type TabType = 'basic' | 'triggers' | 'risk';

export const DeployBotModal: React.FC<DeployBotModalProps> = ({ isOpen, onClose, symbol }) => {
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [botName, setBotName] = useState(`Wallhunter-${symbol.replace('/', '')}`);
  const [mode, setMode] = useState('paper');
  const [tradeAmount, setTradeAmount] = useState(0.01);
  const [takeProfit, setTakeProfit] = useState(2.0);
  const [stopLoss, setStopLoss] = useState(1.0);
  
  // Strategy specific
  const [wallMultiplier, setWallMultiplier] = useState(3.0);
  const [minWallVolume, setMinWallVolume] = useState(10000);
  
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDeploy = useCallback(async () => {
    setIsDeploying(true);
    setError(null);
    setSuccess(false);
    
    // Call the actual backend API using fetch
    try {
      const response = await fetch('http://localhost:8000/api/bot/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bot_name: botName,
          symbol: symbol.replace('/', ''), // e.g. BTCUSDT
          mode: mode,
          wall_multiplier: wallMultiplier,
          trade_amount: tradeAmount,
          min_wall_volume: minWallVolume,
          take_profit: takeProfit,
          stop_loss: stopLoss
        })
      });

      if (!response.ok) {
        throw new Error('Failed to deploy bot');
      }

      const data = await response.json();
      console.log("Deployment response:", data);
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during deployment.');
    } finally {
      setIsDeploying(false);
    }
  }, [symbol, mode, wallMultiplier, tradeAmount, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#12141c] border border-panel rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-panel bg-[#0d0f15]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Rocket className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Deploy Wallhunter Bot</h2>
              <p className="text-xs text-gray-400">Configure parameters and launch strategy</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-4 pt-2 gap-1 bg-[#0d0f15] border-b border-panel">
          <button 
            onClick={() => setActiveTab('basic')}
            className={`flex-1 py-3 px-2 text-xs font-bold uppercase transition-all rounded-t-lg ${
              activeTab === 'basic' 
                ? 'text-[#00ff88] bg-[#00ff88]/5 border border-b-0 border-[#00ff88]/20' 
                : 'text-gray-500 hover:text-gray-300 border border-transparent border-b-0'
            }`}
          >
            Basic & Execution
          </button>
          <button 
            onClick={() => setActiveTab('triggers')}
            className={`flex-1 py-3 px-2 text-xs font-bold uppercase transition-all rounded-t-lg ${
              activeTab === 'triggers' 
                ? 'text-[#00ff88] bg-[#00ff88]/5 border border-b-0 border-[#00ff88]/20' 
                : 'text-gray-500 hover:text-gray-300 border border-transparent border-b-0'
            }`}
          >
            Entry Triggers
          </button>
          <button 
            onClick={() => setActiveTab('risk')}
            className={`flex-1 py-3 px-2 text-xs font-bold uppercase transition-all rounded-t-lg ${
              activeTab === 'risk' 
                ? 'text-[#00ff88] bg-[#00ff88]/5 border border-b-0 border-[#00ff88]/20' 
                : 'text-gray-500 hover:text-gray-300 border border-transparent border-b-0'
            }`}
          >
            Risk Management
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 h-[400px]">
          
          <div className={activeTab === 'basic' ? 'block animate-in fade-in slide-in-from-bottom-2 duration-300' : 'hidden'}>
            <CoreSettings 
              botName={botName} setBotName={setBotName}
              mode={mode} setMode={setMode}
              tradeAmount={tradeAmount} setTradeAmount={setTradeAmount}
              symbol={symbol}
            />
          </div>
          
          <div className={activeTab === 'triggers' ? 'block animate-in fade-in slide-in-from-bottom-2 duration-300' : 'hidden'}>
            <L2OrderbookConfig 
              wallMultiplier={wallMultiplier} setWallMultiplier={setWallMultiplier}
              minWallVolume={minWallVolume} setMinWallVolume={setMinWallVolume}
            />
          </div>
          
          <div className={activeTab === 'risk' ? 'block animate-in fade-in slide-in-from-bottom-2 duration-300' : 'hidden'}>
            <RiskSettings 
              takeProfit={takeProfit} setTakeProfit={setTakeProfit}
              stopLoss={stopLoss} setStopLoss={setStopLoss}
            />
          </div>
          
          {error && (
            <div className="mt-6 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-6 p-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg text-sm font-medium">
              Bot deployed successfully!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-panel bg-[#0d0f15] flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={isDeploying}
            className="px-5 py-2.5 rounded-lg font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleDeploy}
            disabled={isDeploying || success}
            className="px-5 py-2.5 rounded-lg font-bold text-white bg-blue-500 hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isDeploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
            {isDeploying ? 'Deploying...' : 'Deploy Bot'}
          </button>
        </div>
        
      </div>
    </div>
  );
};
