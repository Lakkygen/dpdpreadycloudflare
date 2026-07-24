import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// ─── Icons ─────────────────────────────────────────────────────────
const UserIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const MailIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);

const CreditIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);

const BellIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const LoadingSpinner = () => (
  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
);

// ─── Main Component ────────────────────────────────────────────────
export default function Account() {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ full_name: "", email: "", company: "" });
  const [notifications, setNotifications] = useState({
    scanComplete: true,
    weeklySummary: true,
    newFeatures: false,
    marketing: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccountData();
  }, []);

  const fetchAccountData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const [userRes, subRes] = await Promise.all([
        fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/billing/subscription", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const userData = await userRes.json();
      const subData = await subRes.json();

      if (userData.user) {
        setUser(userData.user);
        setFormData({
          full_name: userData.user.full_name || "",
          email: userData.user.email || "",
          company: userData.user.company || "",
        });
      }

      setSubscription(subData.subscription);
    } catch (err) {
      toast.error("Failed to load account data");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      toast.success("Profile updated successfully");
      setUser({ ...user, ...formData });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/users/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(notifications),
      });

      if (!res.ok) throw new Error("Failed to update preferences");

      toast.success("Preferences saved");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm("Are you sure? Your plan will remain active until the end of the billing period.")) {
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/billing/cancel", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to cancel");

      toast.success("Subscription cancelled. You'll keep access until the end of your billing period.");
      fetchAccountData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getPlanColor = (plan) => {
    const map = {
      free: "bg-slate-100 text-slate-700",
      pro: "bg-blue-100 text-blue-700",
      agency: "bg-violet-100 text-violet-700",
      enterprise: "bg-emerald-100 text-emerald-700",
    };
    return map[plan?.toLowerCase()] || map.free;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: <UserIcon /> },
    { id: "billing", label: "Billing", icon: <CreditIcon /> },
    { id: "notifications", label: "Notifications", icon: <BellIcon /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your profile, subscription, and preferences.</p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="flex border-b border-slate-100 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 lg:p-8">
          <AnimatePresence mode="wait">
            {/* ─── Profile Tab ────────────────────────────────────── */}
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-lg space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Your company name"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleProfileSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {saving ? <LoadingSpinner /> : <CheckIcon />}
                  {saving ? "Saving..." : "Save Changes"}
                </motion.button>
              </motion.div>
            )}

            {/* ─── Billing Tab ────────────────────────────────────── */}
            {activeTab === "billing" && (
              <motion.div
                key="billing"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-lg space-y-6"
              >
                {/* Current Plan */}
                <div className={`rounded-xl p-6 border ${getPlanColor(user?.plan)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold opacity-80">Current Plan</p>
                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full bg-white/50`}>
                      {subscription?.status || "Active"}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 capitalize">{user?.plan || "Free"}</p>
                  {subscription && (
                    <p className="text-sm text-slate-600 mt-1">
                      Renews on {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                  )}
                  <div className="mt-4 flex gap-3">
                    <Link
                      to="/pricing"
                      className="px-4 py-2 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-all"
                    >
                      Change Plan
                    </Link>
                    {subscription && (
                      <button
                        onClick={handleCancelSubscription}
                        className="px-4 py-2 text-red-600 text-sm font-medium hover:bg-red-50 rounded-lg transition-all"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Usage */}
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Usage This Month</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Scans used</span>
                    <span className="text-sm font-medium text-slate-900">
                      {user?.scans_used || 0} / {user?.scans_limit || 2}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(((user?.scans_used || 0) / (user?.scans_limit || 2)) * 100, 100)}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>

                {/* Payment Method Placeholder */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Payment Method</h3>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="w-10 h-6 bg-slate-800 rounded" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">•••• •••• •••• 4242</p>
                      <p className="text-xs text-slate-500">Expires 12/27</p>
                    </div>
                    <button
                      onClick={() => toast("Payment method update coming soon", { icon: "🔧" })}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Update
                    </button>
                  </div>
                </div>

                {/* Billing History */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Billing History</h3>
                  <div className="space-y-2">
                    {subscription ? (
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <p className="text-sm font-medium text-slate-900 capitalize">{user?.plan} Plan</p>
                          <p className="text-xs text-slate-500">{new Date(subscription.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className="text-sm font-medium text-slate-900">
                          ${subscription.plan === "pro" ? "29" : subscription.plan === "agency" ? "97" : "0"}
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 p-4 bg-slate-50 rounded-xl">No billing history yet</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── Notifications Tab ──────────────────────────────── */}
            {activeTab === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-lg space-y-4"
              >
                {[
                  { key: "scanComplete", label: "Email me when a scan completes", desc: "Get notified as soon as your compliance scan is ready" },
                  { key: "weeklySummary", label: "Weekly compliance summary", desc: "Receive a weekly digest of your scan activity" },
                  { key: "newFeatures", label: "New feature announcements", desc: "Be the first to know about new DPDPready features" },
                  { key: "marketing", label: "Marketing and promotional emails", desc: "Occasional updates about offers and compliance news" },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-all"
                  >
                    <div className="pr-4">
                      <p className="text-sm font-medium text-slate-700">{item.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications[item.key]}
                      onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0 mt-0.5"
                    />
                  </label>
                ))}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNotificationSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {saving ? <LoadingSpinner /> : <CheckIcon />}
                  {saving ? "Saving..." : "Save Preferences"}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
