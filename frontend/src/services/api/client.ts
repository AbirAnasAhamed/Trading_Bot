// Centralized API Client for reduced memory footprint (reusing base URL and headers logic)
const BASE_URL = 'http://localhost:8000/api';

export const apiClient = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  const token = localStorage.getItem('token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'API request failed');
  }

  return response.json();
};
