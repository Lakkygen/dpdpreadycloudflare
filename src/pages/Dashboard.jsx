import React from "react";
import { Link } from "react-router-dom";

const ScanIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/></svg>;
const FileIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const ArrowRightIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;

export default function Dashboard() {
  const scans = [
    { url: "https://example.com", date: "Jul 12, 2026", score: 72, status: "warning" },
    { url: "https://client-site.in", date: "Jul 10, 2026", score: 91, status: "pass" },
    { url: "https://startup.io", date: "Jul 8, 2026", score: 45, status: "fail" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back! Here's your compliance overview.</p>
        </div>
        <Link to="/scan" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
          <ScanIcon /> New Scan
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        {[{label:"Total Scans",value:"24",change:"+3 this week",color:"text-blue-600",bg:"bg-blue-50"},{label:"Avg Score",value:"68%",change:"+5% vs last month",color:"text-emerald-600",bg:"bg-emerald-50"},{label:"Reports Generated",value:"18",change:"12 this month",color:"text-violet-600",bg:"bg-violet-50"}].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            <p className={`text-xs font-medium mt-2 ${stat.color} ${stat.bg} inline-block px-2 py-1 rounded-lg`}>{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent Scans</h2>
          <Link to="/report" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">View all <ArrowRightIcon /></Link>
        </div>
        <div className="divide-y divide-slate-100">
          {scans.map((scan, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${scan.status === "pass" ? "bg-emerald-100 text-emerald-600" : scan.status === "warning" ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"}`}>
                  <FileIcon />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{scan.url}</p>
                  <p className="text-xs text-slate-500">{scan.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`text-sm font-bold ${scan.status === "pass" ? "text-emerald-600" : scan.status === "warning" ? "text-amber-600" : "text-red-600"}`}>{scan.score}%</div>
                <Link to="/report" className="text-sm font-medium text-slate-600 hover:text-slate-900">View</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
