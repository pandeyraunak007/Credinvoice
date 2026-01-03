import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Import Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Import Buyer pages
import BuyerDashboard from './pages/buyer/Dashboard';
import InvoicesPage from './pages/buyer/Invoices';
import CreateInvoice from './pages/buyer/CreateInvoice';
import InvoiceDetail from './pages/buyer/InvoiceDetail';
import BidReviewPage from './pages/buyer/BidReview';
import BuyerAnalytics from './pages/buyer/Analytics';

// Import Seller pages
import { SellerDashboard, OfferDetailPage, DiscountOffersList, GSTFinancing } from './pages/seller/SellerPortal';

// Import Financier pages
import FinancierDashboard from './pages/financier/Dashboard';
import Marketplace from './pages/financier/Marketplace';
import FinancierGSTFinancing from './pages/financier/GSTFinancing';
import Portfolio from './pages/financier/Portfolio';
import Collections from './pages/financier/Collections';

// Import KYC pages
import KYCOnboarding from './pages/kyc/KYCOnboarding';
import KYCStatus from './pages/kyc/KYCStatus';

// Import Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminKYCQueue from './pages/admin/KYCQueue';
import KYCReviewDetail from './pages/admin/KYCReviewDetail';
import AdminUsers from './pages/admin/Users';
import AdminInvoices from './pages/admin/Invoices';
import AdminTransactions from './pages/admin/Transactions';
import AdminAuditLogs from './pages/admin/AuditLogs';

// Import Shared pages
import Account from './components/Account';
import Notifications from './components/Notifications';
import ContractsPage from './pages/shared/ContractsPage';
import ContractDetailPage from './pages/shared/ContractDetailPage';

// Import Landing page
import Landing from './pages/Landing';

// Import Public pages
import About from './pages/public/About';
import Blog from './pages/public/Blog';
import BlogPost from './pages/public/BlogPost';
import Privacy from './pages/public/Privacy';
import Terms from './pages/public/Terms';
import Security from './pages/public/Security';
import Products from './pages/public/Products';
import DynamicDiscounting from './pages/public/DynamicDiscounting';
import InvoiceFinancing from './pages/public/InvoiceFinancing';
import Pricing from './pages/public/Pricing';

// Loading Spinner Component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children, allowedRoles = [], requireKYC = true }) {
  const { isAuthenticated, loading, user, profile, isKYCComplete, isKYCPending } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.userType)) {
    // Redirect to appropriate dashboard based on user type
    const dashboardRoutes = {
      BUYER: '/dashboard',
      SELLER: '/seller',
      FINANCIER: '/financier',
      ADMIN: '/admin',
    };
    return <Navigate to={dashboardRoutes[user.userType] || '/dashboard'} replace />;
  }

  // Check KYC status (skip for admin)
  if (requireKYC && user.userType !== 'ADMIN') {
    // If profile doesn't exist or KYC not started, redirect to onboarding
    if (!profile) {
      return <Navigate to="/kyc/onboarding" replace />;
    }

    // If KYC is pending/submitted, redirect to status page
    if (isKYCPending) {
      return <Navigate to="/kyc/status" replace />;
    }

    // If KYC not complete, redirect to onboarding
    if (!isKYCComplete) {
      return <Navigate to="/kyc/onboarding" replace />;
    }
  }

  return children;
}

// KYC Route - Only for users who haven't completed KYC
function KYCRoute({ children }) {
  const { isAuthenticated, loading, user, isKYCComplete } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If KYC is already complete, redirect to dashboard
  if (isKYCComplete) {
    const dashboardRoutes = {
      BUYER: '/dashboard',
      SELLER: '/seller',
      FINANCIER: '/financier',
      ADMIN: '/admin',
    };
    return <Navigate to={dashboardRoutes[user.userType] || '/dashboard'} replace />;
  }

  return children;
}

// Public Route - Redirect to dashboard if already logged in
function PublicRoute({ children }) {
  const { isAuthenticated, loading, user, isKYCComplete } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    // Check if KYC is complete
    if (!isKYCComplete && user.userType !== 'ADMIN') {
      return <Navigate to="/kyc/onboarding" replace />;
    }

    // Redirect to appropriate dashboard
    const dashboardRoutes = {
      BUYER: '/dashboard',
      SELLER: '/seller',
      FINANCIER: '/financier',
      ADMIN: '/admin',
    };
    return <Navigate to={dashboardRoutes[user.userType] || '/dashboard'} replace />;
  }

  return children;
}

// Main App Routes
function AppRoutes() {
  return (
    <Routes>
      {/* Landing Page - Public */}
      <Route path="/" element={<Landing />} />

      {/* Public Pages - No Auth Required */}
      <Route path="/about" element={<About />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/security" element={<Security />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/dynamic-discounting" element={<DynamicDiscounting />} />
      <Route path="/products/invoice-financing" element={<InvoiceFinancing />} />
      <Route path="/pricing" element={<Pricing />} />

      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* KYC Routes */}
      <Route
        path="/kyc/onboarding"
        element={
          <KYCRoute>
            <KYCOnboarding />
          </KYCRoute>
        }
      />
      <Route
        path="/kyc/status"
        element={
          <KYCRoute>
            <KYCStatus />
          </KYCRoute>
        }
      />

      {/* Buyer Portal Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['BUYER']}>
            <BuyerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices"
        element={
          <ProtectedRoute allowedRoles={['BUYER']}>
            <InvoicesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices/create"
        element={
          <ProtectedRoute allowedRoles={['BUYER', 'SELLER']}>
            <CreateInvoice />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices/:id"
        element={
          <ProtectedRoute allowedRoles={['BUYER', 'SELLER']}>
            <InvoiceDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices/:id/bids"
        element={
          <ProtectedRoute allowedRoles={['BUYER', 'SELLER']}>
            <BidReviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute allowedRoles={['BUYER']}>
            <BuyerAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contracts"
        element={
          <ProtectedRoute allowedRoles={['BUYER']}>
            <ContractsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contracts/:contractId"
        element={
          <ProtectedRoute allowedRoles={['BUYER', 'SELLER', 'FINANCIER']}>
            <ContractDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Seller Portal Routes */}
      <Route
        path="/seller"
        element={
          <ProtectedRoute allowedRoles={['SELLER']}>
            <SellerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/discounts"
        element={
          <ProtectedRoute allowedRoles={['SELLER']}>
            <DiscountOffersList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/offers/:id"
        element={
          <ProtectedRoute allowedRoles={['SELLER']}>
            <OfferDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/invoices"
        element={
          <ProtectedRoute allowedRoles={['SELLER']}>
            <InvoicesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/invoices/create"
        element={
          <ProtectedRoute allowedRoles={['SELLER']}>
            <CreateInvoice />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/contracts"
        element={
          <ProtectedRoute allowedRoles={['SELLER']}>
            <ContractsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/financing"
        element={
          <ProtectedRoute allowedRoles={['SELLER']}>
            <GSTFinancing />
          </ProtectedRoute>
        }
      />

      {/* Financier Portal Routes */}
      <Route
        path="/financier"
        element={
          <ProtectedRoute allowedRoles={['FINANCIER']}>
            <FinancierDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financier/marketplace"
        element={
          <ProtectedRoute allowedRoles={['FINANCIER']}>
            <Marketplace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financier/marketplace/:id"
        element={
          <ProtectedRoute allowedRoles={['FINANCIER']}>
            <Marketplace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financier/gst-financing"
        element={
          <ProtectedRoute allowedRoles={['FINANCIER']}>
            <FinancierGSTFinancing />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financier/portfolio"
        element={
          <ProtectedRoute allowedRoles={['FINANCIER']}>
            <Portfolio />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financier/collections"
        element={
          <ProtectedRoute allowedRoles={['FINANCIER']}>
            <Collections />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financier/bids"
        element={
          <ProtectedRoute allowedRoles={['FINANCIER']}>
            <Portfolio />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financier/contracts"
        element={
          <ProtectedRoute allowedRoles={['FINANCIER']}>
            <ContractsPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']} requireKYC={false}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/kyc"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']} requireKYC={false}>
            <AdminKYCQueue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/kyc/:id"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']} requireKYC={false}>
            <KYCReviewDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']} requireKYC={false}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/invoices"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']} requireKYC={false}>
            <AdminInvoices />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/transactions"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']} requireKYC={false}>
            <AdminTransactions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']} requireKYC={false}>
            <AdminAuditLogs />
          </ProtectedRoute>
        }
      />

      {/* Shared Routes - Account & Notifications */}
      <Route
        path="/account"
        element={
          <ProtectedRoute allowedRoles={['BUYER', 'SELLER', 'FINANCIER']}>
            <Account />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowedRoles={['BUYER', 'SELLER', 'FINANCIER']}>
            <Notifications />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to landing page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Main App Component
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
