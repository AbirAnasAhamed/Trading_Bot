import React from 'react';
import { Info, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';
import type { Notification } from '../../services/api/notifications';

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: number) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRead }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000); // diff in minutes

    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div 
      className={`p-4 border-b border-panel hover:bg-panel/50 transition-colors ${!notification.is_read ? 'bg-panel/20' : ''}`}
      onClick={() => !notification.is_read && onRead(notification.id)}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${!notification.is_read ? 'font-medium text-primary' : 'text-secondary'}`}>
            {notification.message}
          </p>
          <div className="flex items-center mt-1 text-xs text-muted">
            <Clock className="w-3 h-3 mr-1" />
            {formatDate(notification.created_at)}
          </div>
        </div>
        {!notification.is_read && (
          <div className="flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-brand inline-block"></span>
          </div>
        )}
      </div>
    </div>
  );
};
