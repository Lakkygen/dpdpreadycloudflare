import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

// ─── Icons ─────────────────────────────────────────────────────────
const DownloadIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const AlertIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);

const ShareIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

// ─── Skeleton ──────────────────────────────────────────────────────
const ReportSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-slate-200 rounded-lg"/>
      <div className="space-y-2">
        <div className="h-6 bg-slate-200 rounded w-48"/>
        <div className="h-4 bg-slate-200 rounded w-32"/>
      </div>
    </div>
    <div className="bg-white rounded-2xl p-8 border border-slate-100 space-y-6">
      <div className="flex items-center justify-between">
        <div className="w-20 h-20 bg-slate-200 rounded-full"/>
        <div className="w-32 h-10 bg-slate-200 rounded-xl"/>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="h-20 bg-slate-200 rounded-xl"/>
        <div className="h-20 bg-slate-200 rounded-xl"/>
        <div className="h-20 bg-slate-200 rounded-xl"/>
      </div>
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────
export default function Report() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`/api/scans/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Report not found");

      setReport(data.scan);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", ring: "border-emerald-400" };
    if (score >= 50) return { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", ring: "border-amber-400" };
    return { text: "text-red-600", bg: "bg-red-50", border: "border-red-100", ring: "border-red-400" };
  };

  const handleDownload = () => {
    window.open(`/api/reports/${id}/pdf`, "_blank");
    toast.success("PDF download started!");
  };

  const handleShare = async () => {
    const shareData = {
      title: `DPDP Compliance Report - ${report?.url}`,
      text: `Compliance Score: ${report?.overall_score}%`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  if (loading) return <ReportSkeleton />;

  if (!report) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Report not found</h2>
          <p className="text-slate-500 mb-4">This scan may have been deleted or you don't have access.</p>
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const colors = getScoreColor(report.overall_score || 0);
  const results = report.results_json || {};
  const checks = results.checks || [];
  const passed = checks.filter(c => c.status === "passed").length;
  const warnings = checks.filter(c => c.status === "warning").length;
  const failed = checks.filter(c => c.status === "failed").length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Link to="/dashboard" className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
          <ArrowLeftIcon />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Compliance Report</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
            <span className="flex items-center gap-1"><GlobeIcon /> {report.url}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><CalendarIcon /> {new Date(report.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </motion.div>

      {/* Main Report Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8"
      >
        {/* Score + Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="text-center md:text-left">
            <p className="text-sm text-slate-500 mb-1">Overall Compliance Score</p>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className={`w-20 h-20 rounded-full border-4 flex items-center justify-center ${colors.ring}`}
              >
                <span className={`text-2xl font-bold ${colors.text}`}>{report.overall_score || 0}%</span>
              </motion.div>
              <div>
                <p className={`text-sm font-semibold ${colors.text}`}>
                  {report.overall_score >= 80 ? "Excellent" : report.overall_score >= 50 ? "Needs Improvement" : "Critical"}
                </p>
                <p className="text-xs text-slate-500">Based on {checks.length} checkpoints</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-all"
            >
              <ShareIcon /> Share
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-lg"
            >
              <DownloadIcon /> Download PDF
            </motion.button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100"
          >
            <p className="text-3xl font-bold text-emerald-600">{passed}</p>
            <p className="text-xs text-emerald-700 mt-1 font-medium">Passed</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center p-4 bg-amber-50 rounded-xl border border-amber-100"
          >
            <p className="text-3xl font-bold text-amber-600">{warnings}</p>
            <p className="text-xs text-amber-700 mt-1 font-medium">Warnings</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center p-4 bg-red-50 rounded-xl border border-red-100"
          >
            <p className="text-3xl font-bold text-red-600">{failed}</p>
            <p className="text-xs text-red-700 mt-1 font-medium">Critical</p>
          </motion.div>
        </div>

        {/* AI Analysis Summary */}
        {results.aiAnalysis && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100"
          >
            <p className="text-sm text-blue-800">
              <span className="font-semibold">AI Analysis:</span> {results.aiAnalysis.summary || "Comprehensive analysis completed with AI-powered insights."}
            </p>
          </motion.div>
        )}

        {/* Detailed Findings */}
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Detailed Findings</h2>
        <div className="space-y-3">
          {checks.map((finding, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className={`p-4 rounded-xl border ${
                finding.status === "passed" ? "bg-emerald-50/50 border-emerald-100" :
                finding.status === "warning" ? "bg-amber-50/50 border-amber-100" :
                "bg-red-50/50 border-red-100"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  finding.status === "passed" ? "bg-emerald-100 text-emerald-600" :
                  finding.status === "warning" ? "bg-amber-100 text-amber-600" :
                  "bg-red-100 text-red-600"
                }`}>
                  {finding.status === "passed" ? <CheckIcon /> : <AlertIcon />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <p className="font-semibold text-slate-900">{finding.title}</p>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                      finding.status === "passed" ? "bg-emerald-100 text-emerald-700" :
                      finding.status === "warning" ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {finding.status}
                    </span>
                    {finding.severity && (
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                        finding.severity === "critical" ? "bg-red-100 text-red-700" :
                        finding.severity === "warning" ? "bg-amber-100 text-amber-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {finding.severity}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mb-1">{finding.description}</p>
                  {finding.suggestedFix && (
                    <p className="text-sm text-slate-700 bg-white/50 p-2 rounded-lg mt-2">
                      <span className="font-semibold">💡 Fix:</span> {finding.suggestedFix}
                    </p>
                  )}
                  {finding.section && <p className="text-xs text-slate-400 mt-1">{finding.section}</p>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <Link 
            to="/scan" 
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Run another scan →
          </Link>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-lg"
            >
              <DownloadIcon /> Download PDF Report
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
