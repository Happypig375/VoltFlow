import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';

import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import MapHome from './pages/MapHome';
import Onboarding from './pages/Onboarding';
import ChargeSession from './pages/ChargeSession';
import Payment from './pages/Payment';
import Sessions from './pages/Sessions';
import Profile from './pages/Profile';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
  }, [isLoadingAuth, isAuthenticated, location.pathname, navigate]);

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/payment" element={<Payment />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<MapHome />} />
        <Route path="/charge" element={<ChargeSession />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;