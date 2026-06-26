import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiShield } from 'react-icons/fi';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Animated background mesh */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-6">
              <FiShield className="w-4 h-4 mr-2" />
              India’s DPDP Act Compliance
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight">
              Privacy audits
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                simplified.
              </span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-xl">
              Scan any website for DPDP compliance. Get an AI‑powered report with actionable fixes in under 2 minutes.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/scan"
                className="inline-flex items-center justify-center px-8 py-3.5 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                Scan your website free
                <FiArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center px-8 py-3.5 text-lg font-semibold text-blue-600 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 transition-all"
              >
                View plans
              </Link>
            </div>
            <div className="mt-10 flex items-center space-x-6 text-sm text-gray-500">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                2,400+ websites scanned
              </span>
              <span>⭐ 4.9/5 rating</span>
            </div>
          </motion.div>

          {/* Visual side: floating score card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:flex justify-center"
          >
            <div className="relative w-80 h-80 bg-white rounded-3xl shadow-2xl overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-50" />
              <div className="relative z-10 text-center">
                <div className="w-40 h-40 mx-auto rounded-full border-[12px] border-blue-500 flex items-center justify-center bg-white shadow-inner">
                  <span className="text-5xl font-extrabold text-gray-900">87</span>
                  <span className="text-lg font-medium text-gray-500">/100</span>
                </div>
                <p className="mt-4 text-lg font-semibold text-gray-800">Compliance Score</p>
                <p className="text-sm text-gray-500">example.com</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
