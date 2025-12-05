import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Layout/Navbar';

// Page Loader Component
function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400">Loading...</p>
      </div>
    </div>
  );
}

// Lazy load components for better performance
const ChatBot = React.lazy(() => import('./components/Support/ChatBot'));
const CookieConsent = React.lazy(() => import('./components/ui/CookieConsent'));
const DiscoverPage = React.lazy(() => import('./pages/DiscoverPage'));
const SignupPage = React.lazy(() => import('./pages/SignupPage'));
const SignInPage = React.lazy(() => import('./pages/SignInPage'));
const EmailVerificationPage = React.lazy(() => import('./pages/EmailVerificationPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const DiscoverDashboardPage = React.lazy(() => import('./pages/dashboard/DiscoverPage'));
const NotificationsPage = React.lazy(() => import('./pages/dashboard/NotificationsPage'));
const PromotionsPage = React.lazy(() => import('./pages/dashboard/PromotionsPage'));
const WalletPage = React.lazy(() => import('./pages/dashboard/WalletPage'));
const ProfilePage = React.lazy(() => import('./pages/dashboard/ProfilePage'));
const ProfileEditPage = React.lazy(() => import('./pages/dashboard/ProfileEditPage'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const SupportPage = React.lazy(() => import('./pages/support/SupportPage'));
const ArticlePage = React.lazy(() => import('./pages/support/ArticlePage'));
const SettingsPage = React.lazy(() => import('./pages/settings/SettingsPage'));
const AboutPage = React.lazy(() => import('./pages/legal/AboutPage'));
const HowItWorksPage = React.lazy(() => import('./pages/legal/HowItWorksPage'));
const PrivacyPage = React.lazy(() => import('./pages/legal/PrivacyPage'));
const TermsPage = React.lazy(() => import('./pages/legal/TermsPage'));
const CookiesPage = React.lazy(() => import('./pages/legal/CookiesPage'));
const DMCAPage = React.lazy(() => import('./pages/legal/DMCAPage'));
const CreatorProfilePage = React.lazy(() => import('./pages/CreatorProfilePage'));
const AccountInfoPage = React.lazy(() => import('./pages/settings/AccountInfoPage'));
const SecurityPage = React.lazy(() => import('./pages/settings/SecurityPage'));
const PaymentMethodsPage = React.lazy(() => import('./pages/settings/PaymentMethodsPage'));
const SubscriptionsPage = React.lazy(() => import('./pages/settings/SubscriptionsPage'));
const TransactionHistoryPage = React.lazy(() => import('./pages/settings/TransactionHistoryPage'));
const DeleteAccountPage = React.lazy(() => import('./pages/settings/DeleteAccountPage'));
const PaymentSuccess = React.lazy(() => import('./pages/PaymentSuccess'));
const PaymentCancel = React.lazy(() => import('./pages/PaymentCancel'));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage'));
const PayPalTestPage = React.lazy(() => import('./pages/PayPalTestPage'));

// Import Admin Guard
const AdminGuard = React.lazy(() => import('./components/AdminProtection/AdminGuard'));

// OAuth Callback Handler Component
function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  React.useEffect(() => {
    // Check if this is an OAuth callback with success
    const urlParams = new URLSearchParams(location.search);
    const accessToken = urlParams.get('access_token');
    const error = urlParams.get('error');
    
    if (error) {
      // Handle OAuth error
      console.error('OAuth error:', error);
      navigate('/signin?error=oauth_failed');
    } else if (accessToken || user) {
      // Successful OAuth, redirect to dashboard
      navigate('/dashboard');
    } else {
      // No token and no user, redirect to signin
      navigate('/signin');
    }
  }, [navigate, location, user]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400">Completing sign in...</p>
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  return <>{children}</>;
}

// App Routes Component
function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <React.Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<DiscoverPage />} />
          <Route path="/creators" element={<DiscoverPage />} />
          <Route path="/search" element={<DiscoverPage />} />
          <Route 
            path="/signup" 
            element={user ? <Navigate to="/dashboard" replace /> : <SignupPage />} 
          />
          <Route 
            path="/signin" 
            element={user ? <Navigate to="/dashboard" replace /> : <SignInPage />} 
          />
          <Route 
            path="/forgot-password" 
            element={user ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />} 
          />
          <Route 
            path="/reset-password/:token" 
            element={user ? <Navigate to="/dashboard" replace /> : <ResetPasswordPage />} 
          />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/discover" 
            element={
              <ProtectedRoute>
                <DiscoverDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/promotions" 
            element={
              <ProtectedRoute>
                <PromotionsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/wallet" 
            element={
              <ProtectedRoute>
                <WalletPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/profile/edit" 
            element={
              <ProtectedRoute>
                <ProfileEditPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <React.Suspense fallback={<PageLoader />}>
                  <AdminGuard requireStrictAuth={false}>
                    <AdminDashboard />
                  </AdminGuard>
                </React.Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/settings" 
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/support/article/:articleId" element={<ArticlePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
          <Route path="/dmca" element={<DMCAPage />} />
          <Route path="/creator/:username" element={<CreatorProfilePage />} />
          
          {/* OAuth Callback Route */}
          <Route path="/auth/callback" element={<OAuthCallback />} />
          
          {/* Payment Routes */}
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
          <Route path="/paypal-test" element={<PayPalTestPage />} />
          
          {/* Settings Routes */}
          <Route 
            path="/dashboard/settings/account/info" 
            element={
              <ProtectedRoute>
                <AccountInfoPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/settings/account/security" 
            element={
              <ProtectedRoute>
                <SecurityPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/settings/account/delete" 
            element={
              <ProtectedRoute>
                <DeleteAccountPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/settings/payments/methods" 
            element={
              <ProtectedRoute>
                <PaymentMethodsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/settings/payments/subscriptions" 
            element={
              <ProtectedRoute>
                <SubscriptionsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/settings/payments/history" 
            element={
              <ProtectedRoute>
                <TransactionHistoryPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect old routes */}
          <Route path="/home" element={<Navigate to="/" replace />} />
        </Routes>
        <ChatBot />
        <CookieConsent />
      </React.Suspense>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;