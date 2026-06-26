import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

export default function ErrorFallback({ error }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
          <FiAlertTriangle className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">Something went wrong</h1>
        <p className="mt-2 text-gray-600">
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            <FiRefreshCw className="w-5 h-5 mr-2" />
            Retry
          </button>
          <a
            href="mailto:support@dpdpready.com"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
