import React, { useState } from 'react';
import { Moon, Sun, Bell, User } from 'lucide-react';
import { useLocation } from 'react-router';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ProfileDrawer } from './ProfileDrawer';

export const Topbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const { user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/': return 'Dashboard';
      case '/bots': return 'Bot Laboratory';
      case '/hf-trading': return 'Order Flow Chart';
      case '/history': return 'Trade History';
      case '/settings': return 'Settings';
      default: return '';
    }
  };

  return (
    <>
      <header className="h-16 bg-panel border-b border-panel flex items-center justify-between px-6 transition-colors duration-200 relative z-10">
        <div className="flex-1 flex items-center pl-2">
          <h1 className="text-xl font-bold text-primary">{getPageTitle(location.pathname)}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div id="topbar-ws-indicator"></div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-secondary hover:bg-primary hover:text-primary transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button className="p-2 rounded-full text-secondary hover:bg-primary hover:text-primary transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center space-x-2 pl-2 border-l border-panel ml-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary">
              <User className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-primary hidden md:block">
              {user?.email ? user?.email.split('@')[0] : 'Trader'}
            </span>
          </button>
        </div>
      </header>
      
      {/* Profile Drawer Overlay */}
      <ProfileDrawer 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </>
  );
};
