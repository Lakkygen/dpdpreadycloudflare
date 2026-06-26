import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../assets/logo.svg';

export default function AuthLayout() {
  const location = useLocation();
  const isLogin = location.pathname.includes('login');

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-cyan-500 p-12 items-center justify-center relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-md text-center">
          <img src={logo} alt="DPDPready" className="h-12 mx-auto brightness-0 invert" />
          <h1 className="mt-8 text-4xl font-extrabold text-white leading-tight">
            {isLogin ? 'Welcome back' : 'Start your compliance journey'}
          </h1>
          <p className="mt-4 text-lg text-blue-100">
            {isLogin
              ? 'Log in to your account to manage scans and reports.'
              : 'Create your account and get your first scan free.'}
          </p>
          {/* Static trust indicators */}
          <div className="mt-12 flex justify-center space-x-8 text-white/80 text-sm">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2" />
              99.9% uptime
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2" />
              SOC 2 certified
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <img src={logo} alt="DPDPready" className="h-8 mx-auto" />
          </div>
          <Outlet />
          <p className="mt-8 text-center text-sm text-gray-500">
            {isLogin ? (
              <>
                Don’t have an account?{' '}
                <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
                  Sign up free
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                  Log in
                </Link>
              </>
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
