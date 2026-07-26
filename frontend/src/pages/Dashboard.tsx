import React from 'react';
import { Wallet, TrendingUp, Activity } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const data = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 5000 },
  { name: 'Thu', value: 2780 },
  { name: 'Fri', value: 6890 },
  { name: 'Sat', value: 6390 },
  { name: 'Sun', value: 7490 },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-panel border border-panel rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-secondary font-medium">Total Balance</h3>
            <div className="p-2 bg-[var(--color-brand)] bg-opacity-20 rounded-lg">
              <Wallet className="w-5 h-5" style={{ color: 'var(--color-brand)' }} />
            </div>
          </div>
          <p className="text-3xl font-bold text-primary">$24,562.00</p>
          <p className="text-sm text-green-500 mt-2 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            +5.2% from last week
          </p>
        </div>
        
        <div className="bg-panel border border-panel rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-secondary font-medium">Total Profit</h3>
            <div className="p-2 bg-green-500 bg-opacity-20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-500">+$1,240.50</p>
          <p className="text-sm text-secondary mt-2">All time profit</p>
        </div>
        
        <div className="bg-panel border border-panel rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-secondary font-medium">Active Bots</h3>
            <div className="p-2 bg-purple-500 bg-opacity-20 rounded-lg">
              <Activity className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-primary">3 / 5</p>
          <p className="text-sm text-secondary mt-2">Running currently</p>
        </div>
      </div>

      {/* Chart Section */}
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
              />
              <Line type="monotone" dataKey="value" stroke="var(--color-brand)" strokeWidth={3} dot={{ r: 4, fill: 'var(--color-brand)' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
