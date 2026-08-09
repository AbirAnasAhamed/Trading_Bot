import React, { useRef, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import type { Notification } from '../../services/api/notifications';
import { NotificationItem } from './NotificationItem';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-16 right-6 w-80 bg-background/80 backdrop-blur-xl border border-panel/50 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[80vh] animate-dropdown-slide-down"
    >
      <div className="p-4 border-b border-panel/50 flex items-center justify-between bg-panel/30">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-primary">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-brand text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded-md text-secondary hover:text-primary hover:bg-panel transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-y-auto flex-1">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-secondary">
            <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map(notification => (
            <NotificationItem 
              key={notification.id} 
              notification={notification} 
              onRead={onMarkAsRead} 
            />
          ))
        )}
      </div>

      {notifications.length > 0 && unreadCount > 0 && (
        <div className="p-3 border-t border-panel/50 bg-panel/30">
          <button
            onClick={onMarkAllAsRead}
            className="w-full py-2 flex items-center justify-center text-sm font-medium text-secondary hover:text-primary transition-colors"
          >
            <Check className="w-4 h-4 mr-2" />
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
};
