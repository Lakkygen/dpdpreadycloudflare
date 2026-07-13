import React from "react";
import { Link } from "react-router-dom";

const ArrowLeftIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-bold text-blue-600">404</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">Page not found</h1>
        <p className="text-slate-600 leading-relaxed mb-8">The page you're looking for doesn't exist or has been moved. Check the URL or return to the dashboard.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
            <ArrowLeftIcon /> Back to Home
          </Link>
          <Link to="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
