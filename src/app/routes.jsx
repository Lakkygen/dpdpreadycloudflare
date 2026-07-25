import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from '../components/ProtectedRoute';

// Lazy page imports
const Home = lazy(() => import('../pages/Home'));
const Scan = lazy(() => import('../pages/Scan'));
const Pricing = lazy(() => import('../pages/Pricing'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Report = lazy(() => import('../pages/Report'));
const Account = lazy(() => import('../pages/Account'));
const Privacy = lazy(() => import('../pages/Privacy'));
const Terms = lazy(() => import('../pages/Terms'));
const NotFound = lazy(() => import('../pages/NotFound'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
  </div>
);

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public pages */}
      <Route element={<MainLayout />}>
        <Route index element={<Suspense fallback={<PageLoader />}><Home /></Suspense>} />
        <Route path="scan" element={<Suspense fallback={<PageLoader />}><Scan /></Suspense>} />
        <Route path="pricing" element={<Suspense fallback={<PageLoader />}><Pricing /></Suspense>} />
        <Route path="privacy" element={<Suspense fallback={<PageLoader />}><Privacy /></Suspense>} />
        <Route path="terms" element={<Suspense fallback={<PageLoader />}><Terms /></Suspense>} />
      </Route>

      {/* Auth pages */}
      <Route element={<AuthLayout />}>
        <Route path="login" element={<Suspense fallback={<PageLoader />}><Login /></Suspense>} />
        <Route path="register" element={<Suspense fallback={<PageLoader />}><Register /></Suspense>} />
      </Route>

      {/* Protected pages */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
        <Route path="report/:id" element={<Suspense fallback={<PageLoader />}><Report /></Suspense>} />
        <Route path="account" element={<Suspense fallback={<PageLoader />}><Account /></Suspense>} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
    </Routes>
  );
}
