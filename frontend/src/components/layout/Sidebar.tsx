import React from 'react';
import { NavLink } from 'react-router';
import { LayoutDashboard, Bot, Settings, TrendingUp, Network, ActivitySquare } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: (string | undefined | null | false)[]) => {
  return twMerge(clsx(inputs));
};

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Bot Laboratory', path: '/bots', icon: Bot },
  { name: 'HFTrading Bot', path: '/hf-trading', icon: TrendingUp },
  { name: 'Backtest Engine', path: '/backtest', icon: ActivitySquare },
  { name: 'ML Studio', path: '/ml-studio', icon: Network },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 h-screen bg-panel border-r border-panel flex flex-col transition-colors duration-200">
      <div className="h-16 flex items-center px-6 border-b border-panel">
        <TrendingUp className="w-6 h-6 text-brand mr-2" style={{ color: 'var(--color-brand)' }} />
        <span className="text-xl font-bold tracking-wider text-primary">CryptoBot</span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-brand font-medium'
                  : 'text-secondary hover:bg-primary hover:text-primary'
              )
            }
            style={({ isActive }) => (isActive ? { color: 'var(--color-brand)' } : {})}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
