import React, { Suspense, lazy } from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorFallback from '../components/ErrorFallback'; // we'll create a premium error boundary

// Global error boundary wrapper (class component for lifecycle)
class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Global error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <GlobalErrorBoundary>
      {/* Toast system: premium look */}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        toastClassName="!bg-gray-900 !text-white !rounded-lg !shadow-xl !border !border-white/10"
        progressClassName="!bg-gradient-to-r !from-blue-500 !to-cyan-400"
      />

      {/* Suspense for lazy pages */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner size="xl" text="Loading application…" />
          </div>
        }
      >
        <Outlet />
      </Suspense>
    </GlobalErrorBoundary>
  );
}
