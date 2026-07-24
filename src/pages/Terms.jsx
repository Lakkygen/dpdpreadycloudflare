import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const FileIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);

export default function Terms() {
  const sections = [
    {
      title: "Acceptance of Terms",
      content: "By accessing or using DPDPready, you agree to be bound by these Terms of Service. If you do not agree, do not use our services. We reserve the right to modify these terms at any time."
    },
    {
      title: "Description of Service",
      content: "DPDPready provides automated website scanning and compliance analysis tools for India's Digital Personal Data Protection Act 2023. Our reports are generated using AI and should not be considered legal advice."
    },
    {
      title: "User Accounts",
      content: "You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials. Notify us immediately of any unauthorized access."
    },
    {
      title: "Payment and Billing",
      content: "Paid plans are billed in advance. You can cancel anytime, and access continues until the end of your billing period. Refunds are available within 14 days of purchase. All prices are in USD."
    },
    {
      title: "Acceptable Use",
      content: "You may only scan websites you own or have permission to analyze. Do not use our service for illegal activities, spam, or to harass others. We reserve the right to suspend accounts violating these terms."
    },
    {
      title: "Intellectual Property",
      content: "DPDPready and its content are protected by copyright and trademark laws. You may not copy, modify, or distribute our software without permission. Generated reports are yours to use as you see fit."
    },
    {
      title: "Disclaimer of Warranties",
      content: "Our service is provided 'as is' without warranties of any kind. Compliance reports are for informational purposes only and do not constitute legal advice. Consult a qualified attorney for legal matters."
    },
    {
      title: "Limitation of Liability",
      content: "DPDPready shall not be liable for any indirect, incidental, or consequential damages arising from your use of our service. Our total liability shall not exceed the amount you paid in the last 12 months."
    },
    {
      title: "Governing Law",
      content: "These terms are governed by the laws of India. Any disputes shall be resolved in the courts of New Delhi."
    },
    {
      title: "Contact Information",
      content: "For questions about these terms, contact us at legal@dpdpready.tech."
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
            <FileIcon />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">Terms of Service</h1>
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
