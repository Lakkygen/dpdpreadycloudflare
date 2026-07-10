import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { FiUser, FiCreditCard, FiSettings } from 'react-icons/fi';

export default function Account() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Account</h1>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FiUser /> Profile
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'billing'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FiCreditCard /> Billing
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FiSettings /> Settings
          </button>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Email</label>
                  <p className="text-white">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Plan</label>
                  <p className="text-white capitalize">{user?.plan || 'Free'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Billing</h2>
              <p className="text-slate-400">
                Current plan: <span className="text-white capitalize">{user?.plan || 'Free'}</span>
              </p>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Manage Subscription
              </button>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Settings</h2>
              <button
                onClick={signOut}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
