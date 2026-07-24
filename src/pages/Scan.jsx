import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// ─── Icons ─────────────────────────────────────────────────────────
const GlobeIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const ScanIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/>
    <path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const AlertIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
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

const ShieldCheckIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 12 15 16 10"/>
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

// ─── Progress Steps ────────────────────────────────────────────────
const STEPS = [
  { label: "Initializing", icon: "🔍" },
  { label: "Crawling pages", icon: "🕷️" },
  { label: "Reading privacy policy", icon: "📄" },
  { label: "Checking consent banners", icon: "🍪" },
  { label: "Analyzing with AI", icon: "🤖" },
  { label: "Generating report", icon: "📊" },
];

// ─── Skeleton for Results ──────────────────────────────────────────
const ResultSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-8 space-y-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded w-32"/>
        <div className="h-6 bg-slate-200 rounded w-48"/>
      </div>
      <div className="w-20 h-20 rounded-full bg-slate-200"/>
    </div>
    {[1,2,3,4,5].map(i => (
      <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-slate-200 shrink-0"/>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-40"/>
          <div className="h-3 bg-slate-200 rounded w-full"/>
        </div>
      </div>
    ))}
  </div>
);

// ─── Main Component ────────────────────────────────────────────────
export default function Scan() {
  const [searchParams] = useSearchParams();
  const [url, setUrl] = useState(searchParams.get("url") || "");
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState(null);
  const [scanId, setScanId] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const navigate = useNavigate();
  const pollRef = useRef(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!url) {
      toast.error("Please enter a website URL");
      return;
    }

    // Validate URL
    let scanUrl = url;
    if (!/^https?:\/\//i.test(scanUrl)) {
      scanUrl = "https://" + scanUrl;
    }

    setScanning(true);
    setProgress(0);
    setCurrentStep(0);
    setResults(null);
    setScanId(null);

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to scan");
      navigate("/login");
      return;
    }

    try {
      toast.loading("Starting scan...", { id: "scan-start" });

      // 1. Create scan
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: scanUrl }),
      });

      const data = await res.json();
      toast.dismiss("scan-start");

      if (!res.ok) {
        throw new Error(data.error || "Failed to start scan");
      }

      setScanId(data.scanId);
      toast.success("Scan started! Analyzing your website...");

      // 2. Start polling
      startPolling(data.scanId);

    } catch (err) {
      toast.dismiss("scan-start");
      toast.error(err.message);
      setScanning(false);
    }
  };

  const startPolling = (id) => {
    const token = localStorage.getItem("token");
    let stepIndex = 0;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/scans/${id}/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        // Map progress to steps
        const progressMap = { pending: 0, crawling: 20, analysing: 60, completed: 100, failed: 100 };
        const prog = progressMap[data.status] || 0;
        setProgress(prog);

        // Advance step based on progress
        const newStepIndex = Math.min(Math.floor((prog / 100) * (STEPS.length - 1)), STEPS.length - 1);
        if (newStepIndex > stepIndex) {
          stepIndex = newStepIndex;
          setCurrentStep(newStepIndex);
        }

        if (data.status === "completed") {
          clearInterval(pollRef.current);
          fetchResults(id);
        } else if (data.status === "failed") {
          clearInterval(pollRef.current);
          setScanning(false);
          toast.error("Scan failed. Please try again.");
        }
      } catch (err) {
        console.error("Poll error:", err);
      }
    }, 2000); // Poll every 2 seconds
  };

  const fetchResults = async (id) => {
    setLoadingResults(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`/api/scans/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch results");

      setResults(data.scan);
      setScanning(false);
      toast.success("Scan complete! Here's your compliance report.");

    } catch (err) {
      toast.error(err.message);
      setScanning(false);
    } finally {
      setLoadingResults(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", ring: "border-emerald-400" };
    if (score >= 50) return { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", ring: "border-amber-400" };
    return { text: "text-red-600", bg: "bg-red-50", border: "border-red-100", ring: "border-red-400" };
  };

  const handleDownloadPDF = () => {
    if (!results) return;
    // Trigger PDF download via backend
    window.open(`/api/reports/${results.id}/pdf`, "_blank");
    toast.success("PDF download started!");
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-4">Scan Your Website</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Enter any URL to analyze it against India's DPDP Act. Results in under 2 minutes.</p>
        </motion.div>

        {/* URL Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-900/5 p-8 mb-8"
        >
          <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <GlobeIcon />
              </div>
              <input
                type="url"
                required
                placeholder="https://your-website.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={scanning}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
              />
            </div>
            <motion.button
              type="submit"
              disabled={scanning}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 whitespace-nowrap disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {scanning ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <ScanIcon /> Start Scan
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Scanning Progress */}
        <AnimatePresence>
          {scanning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 mb-8"
            >
              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">{Math.round(progress)}%</span>
                  <span className="text-sm text-slate-500">{STEPS[currentStep]?.label}</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Steps */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                {STEPS.map((step, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: i === currentStep ? 1.1 : 1,
                      opacity: i <= currentStep ? 1 : 0.4,
                    }}
                    className="text-center"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 text-lg ${
                      i < currentStep ? "bg-emerald-100" : i === currentStep ? "bg-blue-100 animate-pulse" : "bg-slate-100"
                    }`}>
                      {i < currentStep ? <CheckIcon /> : step.icon}
                    </div>
                    <p className={`text-xs font-medium ${i <= currentStep ? "text-slate-700" : "text-slate-400"}`}>
                      {step.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Results Skeleton */}
        {loadingResults && <ResultSkeleton />}

        {/* Results */}
        <AnimatePresence>
          {results && !loadingResults && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-900/5 p-8">
                {/* Score Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Scan Results for</p>
                    <h2 className="text-xl font-bold text-slate-900">{results.url}</h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Scanned on {new Date(results.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                    className="text-center"
                  >
                    <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center mx-auto mb-2 ${getScoreColor(results.overall_score || 0).ring}`}>
                      <span className={`text-2xl font-bold ${getScoreColor(results.overall_score || 0).text}`}>
                        {results.overall_score || 0}%
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Compliance Score</p>
                  </motion.div>
                </div>

                {/* AI Confidence */}
                {results.ai_confidence && (
                  <div className="flex items-center gap-2 mb-6 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <ShieldCheckIcon />
                    <span className="text-sm text-blue-800">
                      <span className="font-semibold">AI Confidence:</span> {Math.round(results.ai_confidence * 100)}% — 
                      Analysis based on {results.ai_confidence > 0.8 ? "comprehensive" : "limited"} page content
                    </span>
                  </div>
                )}

                {/* Checks */}
                <div className="space-y-3">
                  {results.results_json?.checks?.map((check, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-start gap-4 p-4 rounded-xl border ${
                        check.status === "passed" ? "bg-emerald-50/50 border-emerald-100" :
                        check.status === "warning" ? "bg-amber-50/50 border-amber-100" :
                        "bg-red-50/50 border-red-100"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        check.status === "passed" ? "bg-emerald-100 text-emerald-600" :
                        check.status === "warning" ? "bg-amber-100 text-amber-600" :
                        "bg-red-100 text-red-600"
                      }`}>
                        {check.status === "passed" ? <CheckIcon /> : <AlertIcon />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-semibold text-slate-900">{check.title}</p>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                            check.status === "passed" ? "bg-emerald-100 text-emerald-700" :
                            check.status === "warning" ? "bg-amber-100 text-amber-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {check.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{check.description}</p>
                        {check.suggestedFix && (
                          <p className="text-xs text-slate-500 mt-1">
                            <span className="font-medium">Fix:</span> {check.suggestedFix}
                          </p>
                        )}
                        {check.section && <p className="text-xs text-slate-400 mt-1">{check.section}</p>}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownloadPDF}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                  >
                    <FileIcon /> View Full Report
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownloadPDF}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
                  >
                    <DownloadIcon /> Download PDF
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
