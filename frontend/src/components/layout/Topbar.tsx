import React, { useState, useEffect } from 'react';
import { Moon, Sun, Bell, User, Activity } from 'lucide-react';
import { useLocation } from 'react-router';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ProfileDrawer } from './ProfileDrawer';
import { SystemHealthDropdown } from './SystemHealthDropdown';
import { NotificationDropdown } from './NotificationDropdown';
import { statusService } from '../../services/api/status';
import { notificationService } from '../../services/api/notifications';
import type { Notification } from '../../services/api/notifications';
import { notificationSocket } from '../../services/api/notificationSocketService';
import type { SystemHealthResponse } from '../../services/api/status';

export const Topbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const { user } = useAuth();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHealthOpen, setIsHealthOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [health, setHealth] = useState<SystemHealthResponse | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchHealth = async () => {
    try {
      const data = await statusService.getHealth();
      setHealth(data);
    } catch (e) {
      setHealth({
        status: 'offline',
        uptime_seconds: 0,
        cpu_usage: 0,
        ram_usage: 0,
        components: { api: 'offline', database: 'offline', redis: 'offline', celery: 'offline' }
      });
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (user?.notifications_enabled && token) {
      loadNotifications();
      
      notificationSocket.connect(token);
      const unsubscribe = notificationSocket.onNotification((newNotification) => {
        setNotifications(prev => [newNotification, ...prev]);
      });
      
      return () => {
        unsubscribe();
        notificationSocket.disconnect();
      };
    } else if (!user?.notifications_enabled) {
        notificationSocket.disconnect();
        setNotifications([]);
    }
  }, [user?.notifications_enabled]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.error('Failed to mark notification as read', e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      console.error('Failed to mark all notifications as read', e);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/': return 'Dashboard';
      case '/bots': return 'Bot Laboratory';
      case '/hf-trading': return 'Order Flow Chart';
      case '/backtest': return 'Backtest Engine';
      case '/ml-studio': return 'ML Training Studio';
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
            onClick={() => setIsHealthOpen(!isHealthOpen)}
            className={`flex items-center px-3 py-1.5 rounded-full border transition-all duration-300 ${
              !health ? 'bg-gray-500/10 border-gray-500/20 text-gray-500' :
              health.status === 'online' ? 'bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500/20' :
              health.status === 'degraded' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.2)]' :
              'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
            }`}
          >
            <Activity className="w-4 h-4 mr-2" />
            <span className="text-xs font-bold uppercase hidden md:inline-block">
              {!health ? 'Checking...' : health.status}
            </span>
          </button>
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-secondary hover:bg-primary hover:text-primary transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`p-2 rounded-full transition-colors relative ${isNotificationsOpen ? 'bg-panel text-primary' : 'text-secondary hover:bg-primary hover:text-primary'}`}
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background animate-pulse"></span>
            )}
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
      
      <SystemHealthDropdown 
        isOpen={isHealthOpen} 
        onClose={() => setIsHealthOpen(false)} 
        health={health} 
      />
      
      <ProfileDrawer 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />

      <NotificationDropdown
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </>
  );
};
