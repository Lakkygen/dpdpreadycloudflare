import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import LoadingSpinner from '../components/LoadingSpinner';

// Lazy page imports – each split into separate chunks
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

// Fallback for lazy loading – inline spinner
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <LoadingSpinner size="lg" text="Loading page…" />
  </div>
);

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public marketing pages */}
      <Route element={<MainLayout />}>
        <Route
          index
          element={
            <React.Suspense fallback={<PageLoader />}>
              <Home />
            </React.Suspense>
          }
        />
        <Route
          path="scan"
          element={
            <React.Suspense fallback={<PageLoader />}>
              <Scan />
            </React.Suspense>
          }
        />
        <Route
          path="pricing"
          element={
            <React.Suspense fallback={<PageLoader />}>
              <Pricing />
            </React.Suspense>
          }
        />
        <Route
          path="privacy"
          element={
            <React.Suspense fallback={<PageLoader />}>
              <Privacy />
            </React.Suspense>
          }
        />
        <Route
          path="terms"
          element={
            <React.Suspense fallback={<PageLoader />}>
              <Terms />
            </React.Suspense>
          }
        />
      </Route>

      {/* Auth pages (different layout) */}
      <Route element={<AuthLayout />}>
        <Route
          path="login"
          element={
            <React.Suspense fallback={<PageLoader />}>
              <Login />
            </React.Suspense>
          }
        />
        <Route
          path="register"
          element={
            <React.Suspense fallback={<PageLoader />}>
              <Register />
            </React.Suspense>
          }
        />
      </Route>

      {/* Protected app pages */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="dashboard"
          element={
            <React.Suspense fallback={<PageLoader />}>
              <Dashboard />
            </React.Suspense>
          }
        />
        <Route
          path="report/:scanId"
          element={
            <React.Suspense fallback={<PageLoader />}>
              <Report />
            </React.Suspense>
          }
        />
        <Route
          path="account"
          element={
            <React.Suspense fallback={<PageLoader />}>
              <Account />
            </React.Suspense>
          }
        />
      </Route>

      {/* Catch-all: 404 */}
      <Route element={<MainLayout />}>
        <Route
          path="*"
          element={
            <React.Suspense fallback={<PageLoader />}>
              <NotFound />
            </React.Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
