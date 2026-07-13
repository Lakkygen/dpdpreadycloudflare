import React from "react";
import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/" className="text-sm text-blue-600 hover:text-blue-700 font-medium">← Back to home</Link>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-8">Privacy Policy</h1>
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-600 leading-relaxed mb-6">Last updated: July 12, 2026</p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Introduction</h2>
          <p className="text-slate-600 leading-relaxed mb-4">DPDPready ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.</p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Information We Collect</h2>
          <p className="text-slate-600 leading-relaxed mb-4">We collect information that you provide directly to us, including:</p>
          <ul className="list-disc list-inside text-slate-600 space-y-2 mb-4">
            <li>Account information (name, email, company)</li>
            <li>Payment information (processed securely via Stripe)</li>
            <li>Website URLs you choose to scan</li>
            <li>Communication data when you contact support</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. How We Use Your Information</h2>
          <p className="text-slate-600 leading-relaxed mb-4">We use the information we collect to:</p>
          <ul className="list-disc list-inside text-slate-600 space-y-2 mb-4">
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send technical notices, updates, and support messages</li>
            <li>Respond to your comments and questions</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Data Security</h2>
          <p className="text-slate-600 leading-relaxed mb-4">We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Contact Us</h2>
          <p className="text-slate-600 leading-relaxed mb-4">If you have any questions about this Privacy Policy, please contact us at privacy@dpdpready.app.</p>
        </div>
      </div>
    </div>
  );
}
