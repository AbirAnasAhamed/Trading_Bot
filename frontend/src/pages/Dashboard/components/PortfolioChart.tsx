import React from 'react';
import {
  LineChart,
  Line,
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
    <div className="bg-panel border border-panel rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-medium text-primary mb-6">Portfolio Growth</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} axisLine={false} />
            <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} axisLine={false} tickFormatter={(val) => `$${val}`} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              itemStyle={{ color: 'var(--color-brand)' }}
              formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Balance']}
            />
            <Line type="monotone" dataKey="value" stroke="var(--color-brand)" strokeWidth={3} dot={{ r: 4, fill: 'var(--color-brand)' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
