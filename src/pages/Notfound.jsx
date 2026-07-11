import { Link } from 'react-router-dom';
import { FiHome, FiAlertTriangle } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center">
        <FiAlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-slate-400 mb-8">Page not found</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          <FiHome /> Go Home
        </Link>
      </div>
    </div>
  );
}
