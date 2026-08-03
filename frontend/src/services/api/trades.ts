import { apiClient } from './client';

export interface Trade {
  id: number;
  symbol: string;
  trade_type: string;
  execution_type: string;
  price: number;
  amount: number;
  pnl: number;
  timestamp: string;
}

export const tradeService = {
  getTrades: (skip: number = 0, limit: number = 50): Promise<Trade[]> => {
    return apiClient<Trade[]>(`/trades/?skip=${skip}&limit=${limit}`, { method: 'GET' });
  }
};
