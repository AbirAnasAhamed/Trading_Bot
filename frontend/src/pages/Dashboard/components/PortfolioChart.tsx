import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import type { PortfolioGrowthData } from '../../../services/api/portfolio';

interface PortfolioChartProps {
  data: PortfolioGrowthData[];
}

export const PortfolioChart: React.FC<PortfolioChartProps> = ({ data }) => {
  return (
    <div className="relative bg-panel/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-[0_4px_30px_rgba(0,0,0,0.1)] overflow-hidden">
      {/* Techy accents */}
      <div className="absolute top-0 right-0 w-32 h-1 bg-gradient-to-l from-brand to-transparent opacity-50" />
      <div className="absolute bottom-0 left-0 w-32 h-1 bg-gradient-to-r from-blue-500 to-transparent opacity-50" />
      <div className="absolute top-6 right-6 flex gap-1">
        <div className="w-1 h-1 bg-brand rounded-full animate-pulse"></div>
        <div className="w-1 h-1 bg-brand rounded-full animate-pulse delay-75"></div>
        <div className="w-1 h-1 bg-brand rounded-full animate-pulse delay-150"></div>
      </div>
      
      <h3 className="text-sm font-semibold tracking-widest text-secondary uppercase mb-6 flex items-center">
        <span className="w-2 h-2 rounded-full bg-brand mr-2 animate-pulse shadow-[0_0_8px_var(--color-brand)]" />
        Portfolio Growth
      </h3>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-brand)" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="var(--color-brand)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.8)', 
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '8px',
                color: 'var(--text-primary)',
                boxShadow: '0 0 15px rgba(59,130,246,0.2)'
              }}
              itemStyle={{ color: 'var(--color-brand)', fontWeight: 'bold' }}
              formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Balance']}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="var(--color-brand)" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorValue)" 
              activeDot={{ r: 6, fill: 'var(--color-brand)', stroke: '#fff', strokeWidth: 2 }} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
