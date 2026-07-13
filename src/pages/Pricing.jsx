import React from "react";
import { Link } from "react-router-dom";

const CheckIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

export default function Pricing() {
  const plans = [
    { name: "Starter", price: "Free", period: "", desc: "Perfect for small websites and initial assessments.", features: ["1 website scan per month", "Basic compliance score", "Summary findings", "Email support"], cta: "Start Free", popular: false },
    { name: "Professional", price: "₹2,999", period: "/month", desc: "For growing businesses that need regular compliance checks.", features: ["10 website scans per month", "Detailed AI-powered findings", "PDF report generation", "Priority email support", "Compliance history tracking"], cta: "Start Pro Trial", popular: true },
    { name: "Enterprise", price: "Custom", period: "", desc: "For large organizations with complex compliance needs.", features: ["Unlimited scans", "API access", "White-label reports", "Dedicated account manager", "Custom compliance rules", "SSO & team management"], cta: "Contact Sales", popular: false },
  ];

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Pricing</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-6">Simple, transparent pricing</h1>
          <p className="text-lg text-slate-600 leading-relaxed">Start free. Upgrade when you need more power. No hidden fees, no surprises.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan, i) => (
            <div key={i} className={`relative rounded-2xl p-8 ${plan.popular ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/20 scale-105 z-10" : "bg-white border border-slate-100 text-slate-900"}`}>
              {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">Most Popular</div>}
              <div className="mb-6"><h3 className={`text-lg font-semibold mb-2 ${plan.popular ? "text-white" : "text-slate-900"}`}>{plan.name}</h3><p className={`text-sm ${plan.popular ? "text-slate-300" : "text-slate-500"}`}>{plan.desc}</p></div>
              <div className="mb-6"><span className={`text-4xl font-bold ${plan.popular ? "text-white" : "text-slate-900"}`}>{plan.price}</span><span className={`text-sm ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>{plan.period}</span></div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-3">
                    <CheckIcon className={`w-5 h-5 shrink-0 mt-0.5 ${plan.popular ? "text-blue-400" : "text-blue-600"}`} />
                    <span className={`text-sm ${plan.popular ? "text-slate-300" : "text-slate-600"}`}>{f}</span>
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 ${plan.popular ? "bg-white text-slate-900 hover:bg-slate-100 shadow-lg" : "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20"}`}>{plan.cta}</button>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto bg-slate-50 rounded-2xl p-8 border border-slate-100">
          <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {[
              { q: "Can I switch plans at any time?", a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately." },
              { q: "Do you offer annual billing?", a: "Yes, annual billing gives you 2 months free. Contact us for enterprise annual contracts." },
              { q: "What payment methods do you accept?", a: "We accept all major credit cards, UPI, and net banking for Indian customers." },
            ].map((faq, i) => (
              <div key={i} className="border-b border-slate-200 pb-4 last:border-0">
                <p className="font-semibold text-slate-900 mb-2">{faq.q}</p>
                <p className="text-sm text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
