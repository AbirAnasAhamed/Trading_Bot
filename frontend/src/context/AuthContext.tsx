import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/api/auth';
import type { User } from '../types/auth';

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUser = useCallback(async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Session expired or invalid:', error);
      // Clean up invalid session
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      // Another tab wants the session token
      if (e.key === 'REQUEST_SESSION_TOKEN' && e.newValue) {
        const sessionToken = sessionStorage.getItem('token');
        if (sessionToken) {
          localStorage.setItem('SHARE_SESSION_TOKEN', sessionToken);
          localStorage.removeItem('SHARE_SESSION_TOKEN');
        }
      }
      // Another tab provided the session token
      if (e.key === 'SHARE_SESSION_TOKEN' && e.newValue) {
        if (!sessionStorage.getItem('token')) {
          sessionStorage.setItem('token', e.newValue);
          setToken(e.newValue);
          fetchUser();
        }
      }
      // Handle logout from another tab
      if (e.key === 'LOGOUT_EVENT') {
        sessionStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    window.addEventListener('storage', handleStorage);

    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (storedToken) {
      setToken(storedToken);
      fetchUser();
    } else {
      // Ask other tabs if they have a session token
      localStorage.setItem('REQUEST_SESSION_TOKEN', Date.now().toString());
      localStorage.removeItem('REQUEST_SESSION_TOKEN');
      
      // Wait a moment for other tabs to respond
      setTimeout(() => {
        if (!sessionStorage.getItem('token') && !localStorage.getItem('token')) {
          setIsLoading(false);
        }
      }, 100);
    }

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [fetchUser]);

  const login = async (newToken: string, rememberMe: boolean = false) => {
    if (rememberMe) {
      localStorage.setItem('token', newToken);
    } else {
      sessionStorage.setItem('token', newToken);
    }
    setToken(newToken);
    // After setting token, fetch user profile to complete login
    try {
      const userData = await authService.getMe();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to fetch user after login:', error);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    // Notify other tabs to logout
    localStorage.setItem('LOGOUT_EVENT', Date.now().toString());
    localStorage.removeItem('LOGOUT_EVENT');
    
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
