import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiLoader } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const { signIn, authError } = useAuth();
  const navigate = useNavigate();

  // Diagnostic: check env vars on mount
  useEffect(() => {
    const info = [
      `VITE_SUPABASE_URL: ${import.meta.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING'}`,
      `VITE_SUPABASE_ANON_KEY: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'}`,
      `VITE_API_URL: ${import.meta.env.VITE_API_URL || '/api'}`,
    ].join(' | ');
    setDebugInfo(info);
    console.log('[LOGIN DIAGNOSTIC]', info);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('LOGIN ERROR:', err);
      let msg = err.message || 'Login failed';
      
      // Detect specific errors
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('network')) {
        msg = `Cannot connect to auth server. This usually means:\n1. Supabase project is paused\n2. Wrong Supabase URL/key\n3. No internet connection\n\nDebug: ${debugInfo}`;
      } else if (msg.includes('Invalid login')) {
        msg = 'Wrong email or password.';
      } else if (msg.includes('Email not confirmed')) {
        msg = 'Please confirm your email first.';
      }
      
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-slate-500 mt-1">Sign in to your compliance dashboard</p>
        </div>

        {/* Auth config error */}
        {authError && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
            <strong>Config Error:</strong> {authError}
          </div>
        )}

        {/* Login error */}
        {errorMsg && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 whitespace-pre-line">
            {errorMsg}
          </div>
        )}

        {/* Debug info */}
        {debugInfo && (
          <div className="mb-4 bg-slate-100 rounded-lg p-2 text-xs text-slate-500 font-mono break-all">
            {debugInfo}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || authError}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <><FiLoader className="animate-spin" /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
            Start free trial
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
