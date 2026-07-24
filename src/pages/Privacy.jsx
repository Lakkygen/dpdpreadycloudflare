import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ShieldIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

export default function Privacy() {
  const sections = [
    {
      title: "Information We Collect",
      content: "We collect information you provide directly to us, such as your name, email address, and company information when you create an account. We also collect data about your website scans, including URLs analyzed and compliance scores generated."
    },
    {
      title: "How We Use Your Information",
      content: "We use your information to provide and improve our services, process payments, send notifications about your scans, and communicate with you about updates and new features. We do not sell your personal data to third parties."
    },
    {
      title: "Data Security",
      content: "We implement industry-standard security measures including SSL encryption, secure data storage, and regular security audits. Your payment information is processed securely through Razorpay and never stored on our servers."
    },
    {
      title: "Cookies and Tracking",
      content: "We use cookies to maintain your session, remember your preferences, and analyze site usage. You can control cookie settings through your browser. We use Plausible Analytics for privacy-friendly usage tracking."
    },
    {
      title: "Your Rights",
      content: "Under India's DPDP Act, you have the right to access, correct, and delete your personal data. You can request a copy of your data or ask us to delete your account and associated information at any time."
    },
    {
      title: "Third-Party Services",
      content: "We use Supabase for authentication and database services, Razorpay for payment processing, and OpenRouter for AI analysis. Each of these services has their own privacy policies and security measures."
    },
    {
      title: "Data Retention",
      content: "We retain your account data for as long as your account is active. Scan results are retained based on your plan. If you delete your account, we remove your personal data within 30 days, except where required by law."
    },
    {
      title: "Contact Us",
      content: "If you have questions about this Privacy Policy or your data, contact us at privacy@dpdpready.tech."
    }
  ];

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldIcon />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-slate-600">Last updated: July 24, 2026</p>
        </motion.div>

        {/* Content */}
        <div className="space-y-8">
          {sections.map((section, i) => (
            <motion.section
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <h2 className="text-xl font-semibold text-slate-900 mb-3">{section.title}</h2>
              <p className="text-slate-600 leading-relaxed">{section.content}</p>
            </motion.section>
          ))}
        </div>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 pt-8 border-t border-slate-100 text-center"
        >
          <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
            ← Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
