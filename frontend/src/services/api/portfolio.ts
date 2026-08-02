import { apiClient } from './client';

export interface PortfolioGrowthData {
  name: string;
  value: number;
}

export interface PortfolioOverview {
  total_balance_usdt: number;
  balance_change_percent: number;
  total_profit: number;
  active_bots_count: number;
  portfolio_growth: PortfolioGrowthData[];
}

export const portfolioService = {
  getOverview: async (): Promise<PortfolioOverview> => {
    return await apiClient<PortfolioOverview>('/portfolio/overview');
  }
};
