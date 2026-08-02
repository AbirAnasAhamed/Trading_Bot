import React, { useEffect, useState } from 'react';
import { Wallet, TrendingUp, Activity } from 'lucide-react';
import { portfolioService, type PortfolioOverview } from '../../services/api/portfolio';
import { StatCard } from './components/StatCard';
import { PortfolioChart } from './components/PortfolioChart';

export const Dashboard: React.FC = () => {
  const [overview, setOverview] = useState<PortfolioOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const data = await portfolioService.getOverview();
        setOverview(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch portfolio overview:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchOverview, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] text-red-500">
        {error || "No data available"}
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Balance"
          value={formatCurrency(overview.total_balance_usdt)}
          subtitle={`${overview.balance_change_percent > 0 ? '+' : ''}${overview.balance_change_percent}% from last week`}
          subtitleColor={overview.balance_change_percent >= 0 ? "text-green-500" : "text-red-500"}
          subtitleIcon={overview.balance_change_percent >= 0 ? <TrendingUp className="w-4 h-4" /> : undefined}
          icon={<Wallet className="w-5 h-5" style={{ color: 'var(--color-brand)' }} />}
          iconBgColor="bg-[var(--color-brand)]"
        />
        
        <StatCard 
          title="Total Profit"
          value={formatCurrency(overview.total_profit)}
          valueColor={overview.total_profit >= 0 ? "text-green-500" : "text-red-500"}
          subtitle="All time profit"
          icon={<TrendingUp className="w-5 h-5 text-green-500" />}
          iconBgColor="bg-green-500"
        />
        
        <StatCard 
          title="Active Bots"
          value={overview.active_bots_count}
          subtitle="Running currently"
          icon={<Activity className="w-5 h-5 text-purple-500" />}
          iconBgColor="bg-purple-500"
        />
      </div>

      {/* Chart Section */}
      <PortfolioChart data={overview.portfolio_growth} />
    </div>
  );
};
