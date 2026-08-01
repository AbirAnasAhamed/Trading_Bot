import React, { useEffect, useState } from 'react';
import { systemService } from '../services/api/system';
import type { MLModelResult } from '../services/api/system';
import { Loader2, Zap, AlertCircle, CheckCircle2, Network } from 'lucide-react';

export const MLStudio: React.FC = () => {
  const [history, setHistory] = useState<MLModelResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<string>('');

  // Form State
  const [modelName, setModelName] = useState('Orderbook-LSTM (Sequence)');
  const [epochs, setEpochs] = useState(100);
  const [batchSize, setBatchSize] = useState(32);

  const fetchHistory = async () => {
    try {
      const data = await systemService.getMLModelsHistory();
      setHistory(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch ML models history');
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
            await fetchHistory();
          }
        } catch (e) {
          console.error("Error polling task status", e);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [activeTaskId]);

  const handleTrainModel = async () => {
    try {
      const res = await systemService.triggerMLTraining({
        model_name: modelName,
        epochs: epochs,
        batch_size: batchSize
      });
      setActiveTaskId(res.task_id);
      setTaskStatus('PENDING');
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to start ML training');
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
        <div className="flex items-center">
          <Network className="w-6 h-6 mr-3 text-brand" style={{ color: 'var(--color-brand)' }} />
          <h2 className="text-xl font-bold text-primary">ML Training Studio</h2>
        </div>
      </div>
      
      {error && (
        <div className="p-4 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Control Panel */}
      <div className="bg-panel border border-panel rounded-xl p-6 shadow-sm relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 relative z-10">
          <div>
            <label className="block text-sm text-secondary mb-1">Model Architecture</label>
            <select 
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="w-full bg-primary border border-panel rounded-lg px-3 py-2 text-primary focus:outline-none focus:border-purple-500"
            >
              <option value="Orderbook-LSTM (Sequence)">Orderbook-LSTM (Sequence)</option>
              <option value="Transformer (Attention)">Transformer (Attention)</option>
              <option value="XGBoost (Regression)">XGBoost (Regression)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-secondary mb-1">Epochs</label>
            <input 
              type="number" 
              value={epochs}
              onChange={(e) => setEpochs(Number(e.target.value))}
              className="w-full bg-primary border border-panel rounded-lg px-3 py-2 text-primary focus:outline-none focus:border-purple-500" 
            />
          </div>
          <div>
            <label className="block text-sm text-secondary mb-1">Batch Size</label>
            <select 
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
              className="w-full bg-primary border border-panel rounded-lg px-3 py-2 text-primary focus:outline-none focus:border-purple-500"
            >
              <option value={32}>32</option>
              <option value={64}>64</option>
              <option value={128}>128</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleTrainModel}
              disabled={!!activeTaskId}
              className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(147,51,234,0.3)]"
            >
              {activeTaskId ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2 fill-current" />}
              {activeTaskId ? 'Training...' : 'Train Model'}
            </button>
          </div>
        </div>
        
        {activeTaskId && (
          <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-between relative z-10">
            <div className="flex items-center text-purple-400">
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              <div className="flex flex-col">
                <span className="font-medium">Training model in GPU cluster (Celery Worker)...</span>
                <span className="text-xs text-purple-400/70 mt-1">This might take a while depending on epochs.</span>
              </div>
            </div>
            <span className="text-sm font-bold uppercase px-3 py-1 bg-purple-500/20 text-purple-300 rounded">{taskStatus}</span>
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="bg-panel border border-panel rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-panel">
          <h3 className="font-bold text-primary">Trained Models Registry</h3>
        </div>
        
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-secondary">
            No trained models found. Start a training job to populate the registry.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary/50 text-secondary text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Model Name</th>
                  <th className="px-6 py-4 font-medium">Version</th>
                  <th className="px-6 py-4 font-medium">Accuracy</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-primary/30 transition-colors text-primary">
                    <td className="px-6 py-4 text-sm text-secondary">{formatDate(item.created_at)}</td>
                    <td className="px-6 py-4 text-sm font-bold text-purple-400">{item.model_name}</td>
                    <td className="px-6 py-4 text-sm">{item.version}</td>
                    <td className="px-6 py-4 text-sm font-bold">
                      {item.accuracy ? (
                        <span className={item.accuracy > 85 ? 'text-green-500' : 'text-yellow-500'}>
                          {item.accuracy}%
                        </span>
                      ) : '-'}
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
