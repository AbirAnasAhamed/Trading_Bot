import { apiClient } from './client';

export interface CeleryTaskResponse {
  message: string;
  task_id: string;
}

export interface TaskStatusResponse {
  task_id: string;
  status: 'PENDING' | 'STARTED' | 'PROGRESS' | 'SUCCESS' | 'FAILURE';
  result?: any;
}

export interface BacktestResult {
  id: number;
  strategy_name: string;
  symbol: string;
  timeframe: string;
  total_trades: number;
  win_rate: number;
  total_pnl: number;
  max_drawdown: number;
  status: string;
  created_at: string;
}

export interface MLModelResult {
  id: number;
  model_name: string;
  version: string;
  accuracy: number | null;
  status: string;
  file_path: string | null;
  created_at: string;
}

export const systemService = {
  triggerBacktest: (data: { strategy: string; pair: string; timeframe: string }): Promise<CeleryTaskResponse> => {
    return apiClient<CeleryTaskResponse>('/system/test-backtest', { 
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  triggerMLTraining: (data: { model_name: string; epochs: number; batch_size: number }): Promise<CeleryTaskResponse> => {
    return apiClient<CeleryTaskResponse>('/system/test-ml', { 
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  getTaskStatus: (taskId: string): Promise<TaskStatusResponse> => {
    return apiClient<TaskStatusResponse>(`/system/task/${taskId}`, { method: 'GET' });
  },
  
  getBacktestHistory: (skip: number = 0, limit: number = 20): Promise<BacktestResult[]> => {
    return apiClient<BacktestResult[]>(`/system/backtests?skip=${skip}&limit=${limit}`, { method: 'GET' });
  },
  
  getMLModelsHistory: (skip: number = 0, limit: number = 20): Promise<MLModelResult[]> => {
    return apiClient<MLModelResult[]>(`/system/ml-models?skip=${skip}&limit=${limit}`, { method: 'GET' });
  }
};
