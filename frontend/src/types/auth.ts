export interface User {
  id: number;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  notifications_enabled: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}
