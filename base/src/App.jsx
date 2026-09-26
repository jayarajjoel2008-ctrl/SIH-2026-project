import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from '@/lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ScrollToTop from '@/components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import OAuthConsent from '@/pages/OAuthConsent';
import Home from '@/pages/Home';
import Assessment from '@/pages/Assessment';
import Dashboard from '@/pages/Dashboard';
import AssessmentDetail from '@/pages/AssessmentDetail';
import Breathe from '@/pages/Breathe';

import EmergencyBottomBar from '@/components/EmergencyBottomBar';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings } = useAuth();

  // Show loading spinner while checking auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="w-9 h-9 border-4 border-slate-200 border-t-[#0E9F9A] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render the main app routes
  return (
    <Routes>
      {/* Primary Landing / Authentication Portal */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/auth" element={<Login />} />

      {/* Main Public & Application Pages */}
      <Route path="/home" element={<Home />} />
      <Route path="/breathe" element={<Breathe />} />
      <Route path="/assessment" element={<Assessment />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/oauth-consent" element={<OAuthConsent />} />

      {/* Admin Only Routes: Strictly restricted to Admin */}
      <Route element={<ProtectedRoute requireAdmin />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Dashboard />} />
      </Route>

      {/* Protected Routes: Require Authentication (User or Admin) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/assessment/:id" element={<AssessmentDetail />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router basename={import.meta.env.BASE_URL} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col justify-between">
            <div className="flex-1">
              <AuthenticatedApp />
            </div>
            <EmergencyBottomBar />
          </div>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;