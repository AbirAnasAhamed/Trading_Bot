import React, { useEffect, useState } from 'react';
import { Wallet, TrendingUp, Activity } from 'lucide-react';
import { portfolioService, type PortfolioOverview } from '../../services/api/portfolio';
import { StatCard } from './components/StatCard';
import { PortfolioChart } from './components/PortfolioChart';
import { RecentTrades } from './components/RecentTrades';

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
    <div className="relative min-h-full space-y-8 animate-in fade-in zoom-in-95 duration-700">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      
      {/* Dashboard Title / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-1.5 bg-brand rounded-full shadow-[0_0_15px_var(--color-brand)]" />
          <div>
            <h1 className="text-2xl font-bold tracking-widest text-primary uppercase drop-shadow-md">System Overview</h1>
            <p className="text-xs text-secondary font-mono tracking-wider opacity-60">HUD_INITIALIZED // V_1.0.0</p>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <StatCard 
          title="Total Balance"
          value={formatCurrency(overview.total_balance_usdt)}
          subtitle={`${overview.balance_change_percent > 0 ? '+' : ''}${overview.balance_change_percent}% from last week`}
          subtitleColor={overview.balance_change_percent >= 0 ? "text-green-400" : "text-red-400"}
          subtitleIcon={overview.balance_change_percent >= 0 ? <TrendingUp className="w-4 h-4" /> : undefined}
          icon={<Wallet className="w-5 h-5 text-white" />}
          iconBgColor="bg-blue-500"
        />
        
        <StatCard 
          title="Total Profit"
          value={formatCurrency(overview.total_profit)}
          valueColor={overview.total_profit >= 0 ? "text-green-400" : "text-red-400"}
          subtitle="All time profit"
          icon={<TrendingUp className="w-5 h-5 text-white" />}
          iconBgColor="bg-emerald-500"
        />
        
        <StatCard 
          title="Active Bots"
          value={overview.active_bots_count}
          subtitle="Running currently"
          icon={<Activity className="w-5 h-5 text-white" />}
          iconBgColor="bg-purple-500"
        />
      </div>

      {/* Chart Section */}
      <div className="relative z-10">
        <PortfolioChart data={overview.portfolio_growth} />
      </div>

      {/* Recent Trades Section */}
      <div className="relative z-10 pb-8">
        <RecentTrades />
      </div>
    </div>
  );
};
