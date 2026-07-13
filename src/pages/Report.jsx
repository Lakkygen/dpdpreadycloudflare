import React from "react";
import { Link } from "react-router-dom";

const DownloadIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const CheckIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const AlertIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const ArrowLeftIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;

export default function Report() {
  const report = {
    url: "https://example.com",
    date: "July 12, 2026",
    score: 72,
    summary: { pass: 12, warn: 5, fail: 3 },
    findings: [
      { title: "Missing Data Principal Rights Page", severity: "critical", section: "Section 12 & 13", detail: "No dedicated page or mechanism for users to access, correct, or delete their personal data." },
      { title: "Cookie Consent Not Granular", severity: "warning", section: "Section 6", detail: "Cookie banner exists but does not provide granular control over different categories of cookies." },
      { title: "DPO Contact Missing", severity: "critical", section: "Section 8(4)", detail: "Privacy policy does not include contact details of the Data Protection Officer." },
      { title: "Privacy Policy Present", severity: "pass", section: "Section 7", detail: "Comprehensive privacy policy found at /privacy-policy with all required disclosures." },
      { title: "Security Headers Configured", severity: "pass", section: "Section 8", detail: "HSTS, X-Frame-Options, Content-Security-Policy, and X-Content-Type-Options are all present." },
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
          <ArrowLeftIcon />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Compliance Report</h1>
          <p className="text-sm text-slate-500">{report.url} · {report.date}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="text-center md:text-left">
            <p className="text-sm text-slate-500 mb-1">Overall Compliance Score</p>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${report.score >= 80 ? "border-emerald-400" : report.score >= 50 ? "border-amber-400" : "border-red-400"}`}>
                <span className={`text-xl font-bold ${report.score >= 80 ? "text-emerald-600" : report.score >= 50 ? "text-amber-600" : "text-red-600"}`}>{report.score}%</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all">
              <DownloadIcon /> Download PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center p-4 bg-emerald-50 rounded-xl">
            <p className="text-2xl font-bold text-emerald-600">{report.summary.pass}</p>
            <p className="text-xs text-emerald-700 mt-1">Passed</p>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-xl">
            <p className="text-2xl font-bold text-amber-600">{report.summary.warn}</p>
            <p className="text-xs text-amber-700 mt-1">Warnings</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-xl">
            <p className="text-2xl font-bold text-red-600">{report.summary.fail}</p>
            <p className="text-xs text-red-700 mt-1">Critical</p>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-slate-900 mb-4">Detailed Findings</h2>
        <div className="space-y-3">
          {report.findings.map((finding, i) => (
            <div key={i} className={`p-4 rounded-xl border ${finding.severity === "pass" ? "bg-emerald-50/50 border-emerald-100" : finding.severity === "warning" ? "bg-amber-50/50 border-amber-100" : "bg-red-50/50 border-red-100"}`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${finding.severity === "pass" ? "bg-emerald-100 text-emerald-600" : finding.severity === "warning" ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"}`}>
                  {finding.severity === "pass" ? <CheckIcon /> : <AlertIcon />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold text-slate-900">{finding.title}</p>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${finding.severity === "pass" ? "bg-emerald-100 text-emerald-700" : finding.severity === "warning" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{finding.severity}</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">{finding.detail}</p>
                  <p className="text-xs text-slate-400">{finding.section}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
