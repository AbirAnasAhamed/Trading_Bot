import { apiClient } from './client';

export interface Notification {
  id: number;
  user_id: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
}

export const notificationService = {
  getNotifications: async (skip: number = 0, limit: number = 100): Promise<Notification[]> => {
    return apiClient<Notification[]>(`/notifications/?skip=${skip}&limit=${limit}`);
  },

  markAsRead: async (id: number): Promise<Notification> => {
    return apiClient<Notification>(`/notifications/${id}/read`, {
      method: 'PUT'
    });
  },

  markAllAsRead: async (): Promise<{ message: string }> => {
    return apiClient<{ message: string }>('/notifications/read-all', {
      method: 'PUT'
    });
  }
};
