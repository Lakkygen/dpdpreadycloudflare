import React, { useState } from "react";
import { Link } from "react-router-dom";

const GlobeIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const ScanIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/></svg>;
const CheckIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const AlertIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const FileIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const ArrowRightIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;

export default function Scan() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);

  const handleScan = (e) => {
    e.preventDefault();
    if (!url) return;
    setScanning(true);
    setResults(null);
    setTimeout(() => {
      setScanning(false);
      setResults({
        score: 68,
        url: url,
        date: new Date().toLocaleDateString(),
        checks: [
          { name: "Privacy Policy Present", status: "pass", detail: "Found at /privacy-policy" },
          { name: "DPO Contact Listed", status: "fail", detail: "No Data Protection Officer contact found", section: "Section 8(4)" },
          { name: "Consent Mechanism", status: "warn", detail: "Cookie banner exists but lacks granular controls", section: "Section 6" },
          { name: "Data Principal Rights", status: "fail", detail: "No dedicated page for access/correction/deletion", section: "Section 12" },
          { name: "Security Headers", status: "pass", detail: "HSTS, X-Frame-Options, CSP present" },
          { name: "Third-Party Disclosures", status: "pass", detail: "All data processors listed in privacy policy" },
        ]
      });
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-4">Scan Your Website</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Enter any URL to analyze it against India's DPDP Act. Results in under 2 minutes.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-900/5 p-8 mb-8">
          <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><GlobeIcon /></div>
              <input
                type="url"
                required
                placeholder="https://your-website.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={scanning}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 whitespace-nowrap disabled:opacity-70 disabled:hover:translate-y-0"
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
            </button>
          </form>
        </div>

        {scanning && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-900">Analyzing {url}</p>
            <p className="text-sm text-slate-500 mt-2">Crawling pages, reading privacy policy, checking consent flows...</p>
          </div>
        )}

        {results && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-900/5 p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Scan Results for</p>
                  <h2 className="text-xl font-bold text-slate-900">{results.url}</h2>
                  <p className="text-sm text-slate-400 mt-1">Scanned on {results.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center mx-auto mb-2 ${results.score >= 80 ? "border-emerald-400" : results.score >= 50 ? "border-amber-400" : "border-red-400"}`}>
                      <span className={`text-xl font-bold ${results.score >= 80 ? "text-emerald-600" : results.score >= 50 ? "text-amber-600" : "text-red-600"}`}>{results.score}%</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Compliance Score</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {results.checks.map((check, i) => (
                  <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border ${check.status === "pass" ? "bg-emerald-50/50 border-emerald-100" : check.status === "warn" ? "bg-amber-50/50 border-amber-100" : "bg-red-50/50 border-red-100"}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${check.status === "pass" ? "bg-emerald-100 text-emerald-600" : check.status === "warn" ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"}`}>
                      {check.status === "pass" ? <CheckIcon /> : <AlertIcon />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-semibold text-slate-900">{check.name}</p>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${check.status === "pass" ? "bg-emerald-100 text-emerald-700" : check.status === "warn" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{check.status}</span>
                      </div>
                      <p className="text-sm text-slate-600">{check.detail}</p>
                      {check.section && <p className="text-xs text-slate-400 mt-1">{check.section}</p>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link to="/report" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                  <FileIcon /> View Full Report
                </Link>
                <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all">
                  Download PDF <ArrowRightIcon />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
