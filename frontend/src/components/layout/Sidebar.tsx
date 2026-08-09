import React, { useState } from 'react';
import { NavLink } from 'react-router';
import { LayoutDashboard, Bot, Settings, TrendingUp, Network, ActivitySquare, ChevronLeft, Menu, User } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../../context/AuthContext';
import { ProfileDrawer } from './ProfileDrawer';

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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <aside className={cn(
      "h-screen bg-panel border-r border-panel flex flex-col transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className={cn(
        "h-16 flex items-center border-b border-panel transition-all duration-300",
        isCollapsed ? "justify-center" : "px-6 justify-between"
      )}>
        {!isCollapsed && (
          <div className="flex items-center overflow-hidden">
            <TrendingUp className="w-6 h-6 text-brand mr-2 flex-shrink-0" style={{ color: 'var(--color-brand)' }} />
            <span className="text-xl font-bold tracking-wider text-primary whitespace-nowrap">CryptoBot</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md text-secondary hover:text-primary hover:bg-primary transition-colors focus:outline-none flex-shrink-0"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <Menu className="w-6 h-6" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center rounded-lg transition-colors overflow-hidden',
                isCollapsed ? 'justify-center p-3 mx-auto w-12 h-12' : 'px-4 py-3',
                isActive
                  ? 'bg-primary text-brand font-medium'
                  : 'text-secondary hover:bg-primary hover:text-primary'
              )
            }
            title={isCollapsed ? item.name : undefined}
            style={({ isActive }) => (isActive ? { color: 'var(--color-brand)' } : {})}
          >
            <item.icon className={cn("flex-shrink-0", isCollapsed ? "w-6 h-6" : "w-5 h-5 mr-3")} />
            {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={cn("border-t border-panel p-4 flex justify-center", isCollapsed ? "items-center" : "")}>
        <button 
          onClick={() => setIsProfileOpen(true)}
          className={cn(
            "flex items-center space-x-2 hover:opacity-80 transition-opacity w-full overflow-hidden",
            isCollapsed ? "justify-center" : "px-2"
          )}
          title={isCollapsed ? (user?.email || 'Profile') : undefined}
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary flex-shrink-0">
            <User className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <span className="text-sm font-medium text-primary truncate">
              {user?.email ? user?.email.split('@')[0] : 'Trader'}
            </span>
          )}
        </button>
      </div>

      <ProfileDrawer 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </aside>
  );
};
