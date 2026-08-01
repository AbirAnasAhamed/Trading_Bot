import React from 'react';
import { Database, Activity, HardDrive, Cpu, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import type { SystemHealthResponse } from '../../services/api/status';

interface SystemHealthDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  health: SystemHealthResponse | null;
}

export const SystemHealthDropdown: React.FC<SystemHealthDropdownProps> = ({ isOpen, onClose, health }) => {
  if (!isOpen) return null;

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m ${Math.floor(seconds % 60)}s`;
  };

  const StatusIcon = ({ status }: { status?: 'online' | 'offline' | 'degraded' }) => {
    if (status === 'online') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (status === 'degraded') return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getProgressColor = (percent: number) => {
    if (percent < 50) return 'bg-green-500';
    if (percent < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      <div className="absolute top-14 right-40 w-80 bg-panel border border-panel rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
        <div className="p-4 border-b border-panel bg-primary/5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-primary">System Health</h3>
            <span className={`text-xs font-bold px-2 py-1 rounded uppercase flex items-center ${
              !health ? 'bg-gray-500/10 text-gray-500' :
              health.status === 'online' ? 'bg-green-500/10 text-green-500' :
              health.status === 'degraded' ? 'bg-yellow-500/10 text-yellow-500' :
              'bg-red-500/10 text-red-500'
            }`}>
              {health?.status || 'Unknown'}
            </span>
          </div>
          {health && (
            <p className="text-xs text-secondary mt-2">
              Uptime: <span className="text-primary font-medium">{formatUptime(health.uptime_seconds)}</span>
            </p>
          )}
        </div>
        
        {health && (
          <div className="p-4 border-b border-panel grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-secondary font-medium">CPU</span>
                <span className="text-xs text-primary font-bold">{health.cpu_usage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-[#1e2330] rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-1.5 rounded-full ${getProgressColor(health.cpu_usage)}`}
                  style={{ width: `${Math.min(100, Math.max(0, health.cpu_usage))}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-secondary font-medium">RAM</span>
                <span className="text-xs text-primary font-bold">{health.ram_usage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-[#1e2330] rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-1.5 rounded-full ${getProgressColor(health.ram_usage)}`}
                  style={{ width: `${Math.min(100, Math.max(0, health.ram_usage))}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div className="p-2">
          <div className="flex items-center justify-between p-3 hover:bg-primary/5 rounded-lg transition-colors">
            <div className="flex items-center space-x-3 text-secondary">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">REST API</span>
            </div>
            <StatusIcon status={health?.components?.api} />
          </div>
          
          <div className="flex items-center justify-between p-3 hover:bg-primary/5 rounded-lg transition-colors">
            <div className="flex items-center space-x-3 text-secondary">
              <Database className="w-4 h-4" />
              <span className="text-sm font-medium">TimescaleDB</span>
            </div>
            <StatusIcon status={health?.components?.database} />
          </div>
          
          <div className="flex items-center justify-between p-3 hover:bg-primary/5 rounded-lg transition-colors">
            <div className="flex items-center space-x-3 text-secondary">
              <HardDrive className="w-4 h-4" />
              <span className="text-sm font-medium">Redis Cache</span>
            </div>
            <StatusIcon status={health?.components?.redis} />
          </div>
          
          <div className="flex items-center justify-between p-3 hover:bg-primary/5 rounded-lg transition-colors">
            <div className="flex items-center space-x-3 text-secondary">
              <Cpu className="w-4 h-4" />
              <span className="text-sm font-medium">Celery Workers</span>
            </div>
            <StatusIcon status={health?.components?.celery} />
          </div>
        </div>
      </div>
    </>
  );
};
