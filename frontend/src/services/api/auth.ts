import { apiClient } from './client';
import type { User, AuthResponse, LoginCredentials } from '../../types/auth';

export const authService = {
  getMe: (): Promise<User> => {
    return apiClient<User>('/auth/me', { method: 'GET' });
  },
  
  login: (credentials: LoginCredentials): Promise<AuthResponse> => {
    return apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: (credentials: LoginCredentials): Promise<User> => {
    return apiClient<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }
};
