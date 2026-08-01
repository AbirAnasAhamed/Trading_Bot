import { apiClient } from './client';

export interface SystemHealthComponents {
  api: 'online' | 'offline';
  database: 'online' | 'offline';
  redis: 'online' | 'offline';
  celery: 'online' | 'offline';
}

export interface SystemHealthResponse {
  status: 'online' | 'degraded' | 'offline';
  uptime_seconds: number;
  cpu_usage: number;
  ram_usage: number;
  components: SystemHealthComponents;
}

export const statusService = {
  getHealth: (): Promise<SystemHealthResponse> => {
    return apiClient<SystemHealthResponse>('/status/health', { method: 'GET' });
  }
};
