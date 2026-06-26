import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { isValidUrl } from '../utils/validators';
import { useScan } from '../hooks/useScan';
import LoadingSpinner from './LoadingSpinner';

export default function ScanForm() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const { scan, scanState, result } = useScan(); // scanState: idle/scanning/done/error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a website URL');
      return;
    }
    if (!isValidUrl(url)) {
      setError('Enter a valid URL (e.g., https://example.com)');
      return;
    }
    setError('');
    await scan(url);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(''); }}
            placeholder="https://yourwebsite.com"
            className="w-full pl-12 pr-36 py-4 text-lg bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
            disabled={scanState === 'scanning'}
          />
          <button
            type="submit"
            disabled={scanState === 'scanning'}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md"
          >
            {scanState === 'scanning' ? 'Scanning…' : 'Scan'}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <FiAlertCircle className="w-4 h-4 mr-1" /> {error}
          </p>
        )}
      </form>

      {/* Animated progress during scan */}
      <AnimatePresence>
        {scanState === 'scanning' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-8 text-center"
          >
            <div className="w-24 h-24 mx-auto relative">
              <LoadingSpinner size="xl" />
              <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-600">
                Analyzing
              </div>
            </div>
            <p className="mt-4 text-gray-500">
              Crawling pages, checking consent banners, analyzing privacy policies…
            </p>
          </motion.div>
        )}

        {scanState === 'done' && result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <FiCheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{result.overallScore}/100</h3>
                <p className="text-gray-500">Compliance score for {result.url}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-gray-500">Issues found</span>
                <p className="font-semibold">{result.issues?.length || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-gray-500">Passed checks</span>
                <p className="font-semibold">{result.passedChecks || 0}/6</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
