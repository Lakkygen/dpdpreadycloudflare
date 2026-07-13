import React from "react";
import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/" className="text-sm text-blue-600 hover:text-blue-700 font-medium">← Back to home</Link>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-8">Terms of Service</h1>
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-600 leading-relaxed mb-6">Last updated: July 12, 2026</p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-slate-600 leading-relaxed mb-4">By accessing or using DPDPready, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Description of Service</h2>
          <p className="text-slate-600 leading-relaxed mb-4">DPDPready provides automated website scanning and compliance reporting tools for India's Digital Personal Data Protection Act. Our reports are for informational purposes and do not constitute legal advice.</p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. User Accounts</h2>
          <p className="text-slate-600 leading-relaxed mb-4">You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use.</p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Subscription and Payments</h2>
          <p className="text-slate-600 leading-relaxed mb-4">Some features require a paid subscription. Payments are processed securely. You may cancel your subscription at any time, but no refunds will be provided for partial months.</p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Limitation of Liability</h2>
          <p className="text-slate-600 leading-relaxed mb-4">DPDPready is not a law firm and does not provide legal advice. Our compliance reports are generated algorithmically and should be reviewed by qualified legal professionals before reliance.</p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">6. Contact</h2>
          <p className="text-slate-600 leading-relaxed mb-4">For questions about these Terms, contact us at legal@dpdpready.app.</p>
        </div>
      </div>
    </div>
  );
}
