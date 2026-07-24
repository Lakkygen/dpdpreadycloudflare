import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// ─── Icons ─────────────────────────────────────────────────────────
const ScanIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/>
    <path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const FileIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
  </svg>
);

const TrendUpIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
  </svg>
);

const EmptyStateIcon = () => (
  <svg className="w-20 h-20 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 12h8"/><path d="M12 8v8"/>
  </svg>
);

// ─── Skeleton Components ───────────────────────────────────────────
const StatCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-pulse">
    <div className="h-4 bg-slate-200 rounded w-24 mb-3"/>
    <div className="h-8 bg-slate-200 rounded w-16 mb-2"/>
    <div className="h-4 bg-slate-200 rounded w-20"/>
  </div>
);

const ScanRowSkeleton = () => (
  <div className="px-6 py-4 flex items-center justify-between animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-slate-200"/>
      <div>
        <div className="h-4 bg-slate-200 rounded w-40 mb-1"/>
        <div className="h-3 bg-slate-200 rounded w-24"/>
      </div>
    </div>
    <div className="h-4 bg-slate-200 rounded w-12"/>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────
export default function Dashboard() {
  const [scans, setScans] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState({ name: "Free", scansUsed: 0, scansLimit: 2 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch scans
      const scansRes = await fetch("/api/scans?page=1&limit=5", { headers });
      const scansData = await scansRes.json();

      // Fetch subscription/plan info
      const subRes = await fetch("/api/billing/subscription", { headers });
      const subData = await subRes.json();

      // Fetch user profile for plan
      const userRes = await fetch("/api/auth/me", { headers });
      const userData = await userRes.json();

      setScans(scansData.scans || []);
      
      // Calculate stats
      const allScans = scansData.scans || [];
      const totalScans = scansData.total || 0;
      const avgScore = allScans.length > 0 
        ? Math.round(allScans.reduce((a, s) => a + (s.overall_score || 0), 0) / allScans.length)
        : 0;
      const reportsGenerated = allScans.filter(s => s.status === "completed").length;

      setStats({
        totalScans,
        avgScore,
        reportsGenerated,
        recentChange: totalScans > 0 ? `+${Math.min(totalScans, 3)} this week` : "Start scanning"
      });

      // Plan info
      const planName = userData.user?.plan || "free";
      const planLimits = { free: 2, starter: 10, pro: 50, agency: 999 };
      setPlan({
        name: planName.charAt(0).toUpperCase() + planName.slice(1),
        scansUsed: totalScans,
        scansLimit: planLimits[planName] || 2
      });

    } catch (err) {
      console.error("Dashboard fetch error:", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", icon: "text-emerald-600" };
    if (score >= 50) return { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", icon: "text-amber-600" };
    return { text: "text-red-600", bg: "bg-red-50", border: "border-red-100", icon: "text-red-600" };
  };

  const getStatusBadge = (status) => {
    const map = {
      completed: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Completed" },
      pending: { bg: "bg-blue-100", text: "text-blue-700", label: "Pending" },
      crawling: { bg: "bg-amber-100", text: "text-amber-700", label: "Scanning" },
      analysing: { bg: "bg-violet-100", text: "text-violet-700", label: "Analyzing" },
      failed: { bg: "bg-red-100", text: "text-red-700", label: "Failed" }
    };
    return map[status] || map.pending;
  };

  // ─── Empty State ────────────────────────────────────────────────
  if (!loading && scans.length === 0) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Welcome back! Ready to check some compliance?</p>
          </div>
          <Link 
            to="/scan" 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:-translate-y-0.5"
          >
            <ScanIcon /> New Scan
          </Link>
        </motion.div>

        {/* Stats Row */}
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { label: "Total Scans", value: "0", change: "Start scanning", color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Avg Score", value: "—", change: "No data yet", color: "text-slate-400", bg: "bg-slate-50" },
            { label: "Reports", value: "0", change: "Complete a scan", color: "text-slate-400", bg: "bg-slate-50" }
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
            >
              <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              <p className={`text-xs font-medium mt-2 ${stat.color} ${stat.bg} inline-block px-2 py-1 rounded-lg`}>{stat.change}</p>
            </motion.div>
          ))}
        </div>

        {/* Usage Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <SparklesIcon />
              <span className="text-sm font-semibold text-slate-900">{plan.name} Plan</span>
            </div>
            <span className="text-sm text-slate-500">{plan.scansUsed} / {plan.scansLimit} scans used</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-blue-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((plan.scansUsed / plan.scansLimit) * 100, 100)}%` }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {plan.scansLimit - plan.scansUsed} scans remaining this month. 
            <Link to="/pricing" className="text-blue-600 hover:text-blue-700 font-medium ml-1">Upgrade for more</Link>
          </p>
        </motion.div>

        {/* Empty State */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.6 }}
            className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <EmptyStateIcon />
          </motion.div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Your first scan is waiting</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
            Paste any website URL above to get your DPDP compliance score instantly. 
            We'll analyze privacy policies, consent banners, security headers, and more.
          </p>
          <Link 
            to="/scan"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5"
          >
            <ScanIcon /> Start Your First Scan
          </Link>
        </motion.div>
      </div>
    );
  }

  // ─── Loading State ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-slate-200 rounded w-40 mb-2 animate-pulse"/>
            <div className="h-4 bg-slate-200 rounded w-64 animate-pulse"/>
          </div>
          <div className="h-10 bg-slate-200 rounded-xl w-32 animate-pulse"/>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="h-5 bg-slate-200 rounded w-32 animate-pulse"/>
            <div className="h-4 bg-slate-200 rounded w-20 animate-pulse"/>
          </div>
          <ScanRowSkeleton /><ScanRowSkeleton /><ScanRowSkeleton />
        </div>
      </div>
    );
  }

  // ─── Full Dashboard ─────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back! Here's your compliance overview.</p>
        </div>
        <Link 
          to="/scan" 
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:-translate-y-0.5"
        >
          <ScanIcon /> New Scan
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-6">
        {[
          { label: "Total Scans", value: String(stats?.totalScans || 0), change: stats?.recentChange || "0 this week", color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Avg Score", value: stats?.avgScore ? `${stats.avgScore}%` : "—", change: stats?.avgScore >= 70 ? "Great score!" : "Room to improve", color: stats?.avgScore >= 70 ? "text-emerald-600" : "text-amber-600", bg: stats?.avgScore >= 70 ? "bg-emerald-50" : "bg-amber-50" },
          { label: "Reports Generated", value: String(stats?.reportsGenerated || 0), change: `${stats?.reportsGenerated || 0} this month`, color: "text-violet-600", bg: "bg-violet-50" }
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            <p className={`text-xs font-medium mt-2 ${stat.color} ${stat.bg} inline-block px-2 py-1 rounded-lg`}>
              {stat.change}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Usage Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <SparklesIcon />
            <span className="text-sm font-semibold text-slate-900">{plan.name} Plan</span>
          </div>
          <span className="text-sm text-slate-500">{plan.scansUsed} / {plan.scansLimit} scans used</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            className={`h-full rounded-full ${plan.scansUsed >= plan.scansLimit ? 'bg-red-500' : 'bg-blue-600'}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((plan.scansUsed / plan.scansLimit) * 100, 100)}%` }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {plan.scansLimit - plan.scansUsed > 0 ? (
            <>{plan.scansLimit - plan.scansUsed} scans remaining. <Link to="/pricing" className="text-blue-600 hover:text-blue-700 font-medium">Need more?</Link></>
          ) : (
            <>You've hit your limit. <Link to="/pricing" className="text-blue-600 hover:text-blue-700 font-medium">Upgrade now</Link></>
          )}
        </p>
      </motion.div>

      {/* Recent Scans */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent Scans</h2>
          <Link to="/scan" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
            View all <ArrowRightIcon />
          </Link>
        </div>
        
        <AnimatePresence>
          <div className="divide-y divide-slate-100">
            {scans.map((scan, i) => {
              const colors = getScoreColor(scan.overall_score || 0);
              const statusBadge = getStatusBadge(scan.status);
              return (
                <motion.div 
                  key={scan.id || i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => scan.status === "completed" ? navigate(`/report/${scan.id}`) : null}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.bg} ${colors.icon} group-hover:scale-110 transition-transform`}>
                      <FileIcon />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{scan.url}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500">{new Date(scan.created_at).toLocaleDateString()}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                          {statusBadge.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {scan.status === "completed" && (
                      <div className={`text-sm font-bold ${colors.text}`}>{scan.overall_score || 0}%</div>
                    )}
                    <ArrowRightIcon />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
