import React, { useState } from "react";
import { Link } from "react-router-dom";

const UserIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const MailIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const CreditIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const CheckIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

export default function Account() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your profile, subscription, and preferences.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100">
          {[{id:"profile",label:"Profile",icon:<UserIcon />},{id:"billing",label:"Billing",icon:<CreditIcon />},{id:"notifications",label:"Notifications",icon:<MailIcon />}].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all ${activeTab === tab.id ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-700"}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 lg:p-8">
          {activeTab === "profile" && (
            <div className="max-w-lg space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
                <input type="text" defaultValue="John Doe" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                <input type="email" defaultValue="john@company.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Company</label>
                <input type="text" defaultValue="Acme Inc" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <button onClick={handleSave} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                {saved ? <><CheckIcon /> Saved</> : "Save Changes"}
              </button>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="max-w-lg">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 mb-6">
                <p className="text-sm font-semibold text-blue-800 mb-1">Current Plan</p>
                <p className="text-2xl font-bold text-slate-900">Professional</p>
                <p className="text-sm text-slate-600 mt-1">₹2,999/month · Renews on Aug 12, 2026</p>
                <div className="mt-4 flex gap-3">
                  <button className="px-4 py-2 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-all">Change Plan</button>
                  <button className="px-4 py-2 text-red-600 text-sm font-medium hover:bg-red-50 rounded-lg transition-all">Cancel</button>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Payment Method</h3>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-10 h-6 bg-slate-800 rounded" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">•••• •••• •••• 4242</p>
                  <p className="text-xs text-slate-500">Expires 12/27</p>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Update</button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="max-w-lg space-y-4">
              {[
                { label: "Email me when a scan completes", checked: true },
                { label: "Weekly compliance summary", checked: true },
                { label: "New feature announcements", checked: false },
                { label: "Marketing and promotional emails", checked: false },
              ].map((item, i) => (
                <label key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-all">
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  <input type="checkbox" defaultChecked={item.checked} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                </label>
              ))}
              <button onClick={handleSave} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                {saved ? <><CheckIcon /> Saved</> : "Save Preferences"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
