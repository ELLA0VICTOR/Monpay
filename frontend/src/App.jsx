import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Marketplace from './pages/Marketplace.jsx';
import CreatorDashboard from './pages/CreatorDashboard.jsx';
import SubscriberDashboard from './pages/SubscriberDashboard.jsx';
import CreatorProfile from './pages/CreatorProfile.jsx';
import ContentView from './pages/ContentView.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import AuthModal from './components/AuthModal.jsx';
import { Link } from 'react-router-dom';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const { isConnected } = useAccount();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-text-muted">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="card text-center py-16">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
          M
        </div>
        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-text-muted mb-6">
          Please connect your wallet to access this page
        </p>
        <div className="flex justify-center">
          <ConnectWallet />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  return children;
}

// App Routes Component
function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route 
          path="/creator" 
          element={
            <ProtectedRoute>
              <CreatorDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/me" 
          element={
            <ProtectedRoute>
              <SubscriberDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/creator/:address" element={<CreatorProfile />} />
        <Route 
          path="/content/:address" 
          element={
            <ProtectedRoute>
              <ContentView />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

// Main App Component
export default function App() {
  useEffect(() => {
    // Ensure dark mode is always enabled
    document.documentElement.classList.add('dark');
    
    // Set up global error handling
    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

// 404 Page Component
function NotFound() {
  return (
    <div className="card text-center py-16">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
        !
      </div>
      <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
      <p className="text-text-muted mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn">
        Go Home
      </Link>
    </div>
  );
}

// Import ConnectWallet for the protected route
import ConnectWallet from './components/ConnectWallet.jsx';