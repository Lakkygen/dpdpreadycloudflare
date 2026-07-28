import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiSearch, FiLoader, FiShield, FiCheckCircle, FiXCircle, FiAlertTriangle } from "react-icons/fi";
import { toast } from "react-toastify";

const STEPS = [
  { label: "Initializing", icon: <FiLoader className="animate-spin" /> },
  { label: "Crawling website", icon: <FiSearch /> },
  { label: "Analyzing content", icon: <FiShield /> },
  { label: "Generating report", icon: <FiCheckCircle /> },
];

export default function Scan() {
  const [searchParams] = useSearchParams();
  const [url, setUrl] = useState(searchParams.get("url") || "");
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState(null);
  const [scanId, setScanId] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const pollRef = useRef(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleScan = async (e) => {
    e.preventDefault();
    setError(null);
    if (!url) {
      toast.error("Please enter a website URL");
      return;
    }

    let scanUrl = url;
    if (!/^https?:\/\//i.test(scanUrl)) {
      scanUrl = "https://" + scanUrl;
    }

    setScanning(true);
    setProgress(0);
    setCurrentStep(0);
    setResults(null);
    setScanId(null);

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Please log in to scan");
      navigate("/login");
      return;
    }

    try {
      toast.loading("Starting scan...", { id: "scan-start" });

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
        throw new Error(data.error || `Failed to start scan (${res.status})`);
      }

      setScanId(data.scanId);
      toast.success("Scan started! Analyzing your website...");
      startPolling(data.scanId);

    } catch (err) {
      toast.dismiss("scan-start");
      setError(err.message);
      setScanning(false);
    }
  };

  const startPolling = (id) => {
    const token = localStorage.getItem("authToken");
    let stepIndex = 0;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/scans/${id}/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) {
          clearInterval(pollRef.current);
          setError(data.error || "Scan status check failed");
          setScanning(false);
          return;
        }

        const progressMap = { pending: 0, crawling: 20, analysing: 60, completed: 100, failed: 100 };
        const prog = progressMap[data.status] || (data.overall_score ? 100 : 0);
        setProgress(prog);

        const newStepIndex = Math.min(Math.floor((prog / 100) * (STEPS.length - 1)), STEPS.length - 1);
        if (newStepIndex > stepIndex) {
          stepIndex = newStepIndex;
          setCurrentStep(newStepIndex);
        }

        if (data.status === "completed" || data.overall_score) {
          clearInterval(pollRef.current);
          fetchResults(id);
        } else if (data.status === "failed") {
          clearInterval(pollRef.current);
          setScanning(false);
          setError("Scan failed on the server.");
        }
      } catch (err) {
        console.error("Poll error:", err);
      }
    }, 2000);
  };

  const fetchResults = async (id) => {
    setLoadingResults(true);
    const token = localStorage.getItem("authToken");

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
      setError(err.message);
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
    window.open(`/api/reports/${results.id}/pdf`, "_blank");
    toast.success("PDF download started!");
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
          >
            <FiAlertTriangle className="text-red-500 text-xl flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-red-800 font-semibold text-sm">Scan Failed</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-xs text-red-600 underline hover:text-red-800"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Scan Your Website</h1>
          <p className="text-slate-500">Enter any URL to analyze it against India's DPDP Act.</p>
        </div>

        {/* Input */}
        <form onSubmit={handleScan} className="relative mb-8">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            disabled={scanning}
            className="w-full pl-12 pr-32 py-4 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={scanning || !url.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
          >
            {scanning ? <><FiLoader className="animate-spin" /> Scanning...</> : "Start Scan"}
          </button>
        </form>

        {/* Progress */}
        {scanning && (
          <div className="mb-8">
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-4">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              {STEPS.map((step, i) => (
                <div key={i} className={`flex items-center gap-1 ${i <= currentStep ? "text-blue-600 font-medium" : ""}`}>
                  {i < currentStep ? <FiCheckCircle size={14} /> : step.icon}
                  {step.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {results && !scanning && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className={`bg-white rounded-2xl border p-6 ${getScoreColor(results.overall_score || 0).border}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Scan Results</h2>
                  <p className="text-slate-500 text-sm">{results.url}</p>
                </div>
                <div className={`w-20 h-20 rounded-full border-4 ${getScoreColor(results.overall_score || 0).ring} flex items-center justify-center ${getScoreColor(results.overall_score || 0).bg}`}>
                  <span className={`text-2xl font-bold ${getScoreColor(results.overall_score || 0).text}`}>{results.overall_score || 0}%</span>
                </div>
              </div>

              {results.ai_confidence && (
                <p className="text-sm text-slate-600 mb-4">AI Confidence: {Math.round(results.ai_confidence * 100)}%</p>
              )}

              <div className="space-y-3">
                {results.results_json?.checks?.map((check, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${check.status === "passed" ? "bg-emerald-50" : "bg-red-50"}`}>
                    {check.status === "passed" ? <FiCheckCircle className="text-emerald-500 mt-0.5" /> : <FiXCircle className="text-red-500 mt-0.5" />}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm text-slate-800">{check.title}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${check.status === "passed" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                          {check.status === "passed" ? "Passed" : "Failed"}
                        </span>
                      </div>
                      {check.description && <p className="text-xs text-slate-600 mt-1">{check.description}</p>}
                      {check.suggestedFix && <p className="text-xs text-slate-500 mt-1">Fix: {check.suggestedFix}</p>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => navigate(`/report/${results.id}`)} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors">
                  View Full Report
                </button>
                <button onClick={handleDownloadPDF} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm transition-colors">
                  Download PDF
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
