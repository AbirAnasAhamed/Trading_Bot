import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Bots } from './pages/Bots';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { HFTradingBot } from './pages/HFTradingBot';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Landing } from './pages/Landing/Landing';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Landing Page Route */}
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />} 
      />
      
      {/* Protected Layout Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="bots" element={<Bots />} />
        <Route path="hf-trading" element={<HFTradingBot />} />
        <Route path="history" element={<History />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
