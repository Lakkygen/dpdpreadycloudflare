import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";

// ─── Icons ─────────────────────────────────────────────────────────
const ShieldIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const ScanIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/>
    <path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const FileTextIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);

const ZapIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const BarChartIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const StarIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const PlayIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);

// ─── Animation Variants ────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

// ─── Main Component ────────────────────────────────────────────────
export default function Home() {
  const [url, setUrl] = useState("");
  const [openFaq, setOpenFaq] = useState(0);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

  const features = [
    { icon: <ScanIcon />, title: "AI-Powered Website Scan", desc: "Our engine crawls your site and analyzes every page against all 25+ DPDP Act compliance checkpoints in seconds.", color: "bg-blue-50 text-blue-600" },
    { icon: <BarChartIcon />, title: "Instant Compliance Score", desc: "Get a clear 0-100 score broken down by category — consent, privacy policy, data security, user rights, and more.", color: "bg-indigo-50 text-indigo-600" },
    { icon: <FileTextIcon />, title: "Board-Ready PDF Reports", desc: "Download beautifully formatted, lawyer-reviewed compliance reports you can share with stakeholders and regulators.", color: "bg-violet-50 text-violet-600" },
    { icon: <ZapIcon />, title: "Actionable Recommendations", desc: "Every finding comes with a specific, step-by-step fix. No vague advice — just clear instructions to get compliant.", color: "bg-amber-50 text-amber-600" },
    { icon: <LockIcon />, title: "DPDP Act Specific", desc: "Built exclusively for India's Digital Personal Data Protection Act 2023. Not a generic GDPR tool retrofitted for India.", color: "bg-emerald-50 text-emerald-600" },
    { icon: <ShieldIcon />, title: "Continuous Monitoring", desc: "Schedule automated scans to catch compliance drift. Get alerted the moment your website falls out of compliance.", color: "bg-rose-50 text-rose-600" },
  ];

  const faqs = [
    { q: "What is the DPDP Act and does it apply to my business?", a: "The Digital Personal Data Protection Act 2023 is India's comprehensive data privacy law. It applies to any organization processing digital personal data of individuals in India, regardless of where your business is located." },
    { q: "How accurate is the AI-powered scan?", a: "Our engine is trained specifically on the DPDP Act and checks against 25+ compliance checkpoints. While highly accurate, we recommend consulting a legal expert for final compliance certification." },
    { q: "Can I scan any website or just my own?", a: "You can scan any publicly accessible website. This is useful for auditing your own properties, competitive analysis, or client assessments." },
    { q: "What does the PDF report include?", a: "Each report includes an executive summary, overall compliance score, section-by-section breakdown, risk-rated findings, and specific remediation steps." },
    { q: "Is my data safe when I use DPDPready?", a: "Absolutely. We only scan publicly available website content. We don't store your website data permanently, and all scans are encrypted in transit." },
    { q: "Can I get a refund if I'm not satisfied?", a: "Yes. We offer a 14-day money-back guarantee on all paid plans. Contact us for a full refund — no questions asked." },
  ];

  return (
    <div className="bg-white overflow-hidden">
      {/* ─── Hero ───────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 -z-10">
          <motion.div 
            animate={{ x: [0, 30, -20, 0], y: [0, -20, 10, 0], scale: [1, 1.1, 0.95, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-100/50 rounded-full blur-3xl opacity-60" 
          />
          <motion.div 
            animate={{ x: [0, -20, 30, 0], y: [0, 15, -25, 0], scale: [1, 0.9, 1.05, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-0 w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-3xl opacity-50" 
          />
          <motion.div 
            animate={{ x: [0, 25, -15, 0], y: [0, -30, 20, 0], scale: [1, 1.15, 0.9, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-50/60 rounded-full blur-3xl opacity-50" 
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl"
            >
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-8"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
                </span>
                <span className="text-sm font-semibold text-blue-700">Now Compliant with India's DPDP Act 2023</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-6"
              >
                Privacy Compliance, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Automated</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-lg lg:text-xl text-slate-600 leading-relaxed mb-10 max-w-xl"
              >
                Scan any website against India's Digital Personal Data Protection Act. Get an instant compliance score, AI-powered findings, and a board-ready PDF report — in under 2 minutes.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-3 mb-6"
              >
                <div className="relative flex-1 group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <GlobeIcon />
                  </div>
                  <input 
                    type="url" 
                    placeholder="https://your-website.com" 
                    value={url} 
                    onChange={(e) => setUrl(e.target.value)} 
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm hover:border-slate-300"
                  />
                </div>
                <Link 
                  to={url ? `/scan?url=${encodeURIComponent(url)}` : "/scan"} 
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 whitespace-nowrap active:scale-95"
                >
                  <ScanIcon /> Scan Now
                </Link>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-6 text-sm text-slate-500"
              >
                <div className="flex items-center gap-2"><CheckCircleIcon /> <span>No credit card required</span></div>
                <div className="flex items-center gap-2"><CheckCircleIcon /> <span>Free first scan</span></div>
              </motion.div>
            </motion.div>

            {/* Right: Mockup Card */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              style={{ y: heroY }}
              className="relative lg:pl-8"
            >
              <div className="relative bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-200/60 overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"/>
                    <div className="w-3 h-3 rounded-full bg-amber-400"/>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"/>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-white rounded-md px-3 py-1.5 text-xs text-slate-400 border border-slate-200 text-center">dpdpready.app/scan/results</div>
                  </div>
                </div>
                
                {/* Mock content */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Scan Results for</p>
                      <p className="text-sm font-semibold text-slate-900">example.com</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full border-4 border-amber-400 flex items-center justify-center">
                        <span className="text-lg font-bold text-amber-600">68%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {[
                      { label: "Privacy Policy", status: "Pass", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
                      { label: "Consent Banner", status: "Fail", color: "bg-red-50 text-red-700 border-red-100" },
                      { label: "Data Retention", status: "Warn", color: "bg-amber-50 text-amber-700 border-amber-100" },
                    ].map((item) => (
                      <div key={item.label} className={`flex items-center justify-between p-3 rounded-lg border ${item.color}`}>
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="text-xs font-bold uppercase">{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border border-slate-100 p-3 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">DPDP Compliant</p>
                  <p className="text-xs text-slate-500">Report generated</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Social Proof ─────────────────────────────────────────── */}
      <section className="py-12 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-sm text-slate-500 mb-8"
          >
            Trusted by compliance teams at forward-thinking companies
          </motion.p>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-8 lg:gap-16 opacity-50"
          >
            {["TechCorp India", "LegalEase", "DataGuard", "PrivaSys", "ComplyNow"].map((name) => (
              <motion.span 
                key={name}
                variants={itemVariants}
                className="text-lg font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-default"
              >
                {name}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────────── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-6">Everything you need for DPDP compliance</h2>
            <p className="text-lg text-slate-600 leading-relaxed">From automated scanning to board-ready reports, we've built the complete compliance toolkit for Indian businesses.</p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-900/5 transition-all cursor-default"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-6">Compliance in three simple steps</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: "01", title: "Paste URL", desc: "Enter any website URL. No installation, no setup required.", color: "bg-blue-600" },
              { step: "02", title: "AI Analysis", desc: "Our engine scans pages, reads policies, and checks against 25+ DPDP checkpoints.", color: "bg-indigo-600" },
              { step: "03", title: "Get Report", desc: "Download a detailed PDF report with scores, findings, and actionable fixes.", color: "bg-violet-600" },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative text-center"
              >
                <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <span className="text-white text-xl font-bold">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-full">
                    <div className="h-0.5 bg-slate-200 w-24 mx-auto"/>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ───────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.01 }}
            className="relative bg-slate-900 rounded-3xl p-12 lg:p-16 overflow-hidden text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20"/>
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Ready to get compliant?</h2>
              <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">Join hundreds of Indian businesses using DPDPready to stay ahead of compliance requirements.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/register" 
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-all shadow-lg hover:-translate-y-0.5"
                >
                  Start Free Scan <ArrowRightIcon />
                </Link>
                <Link 
                  to="/pricing" 
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-white font-semibold rounded-xl border border-white/20 hover:bg-white/10 transition-all"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">Questions? We've got answers.</h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl border border-slate-100 overflow-hidden"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-slate-900 pr-4">{faq.q}</span>
                  <motion.span 
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDownIcon />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-4 text-slate-600 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                  <ShieldIcon />
                </div>
                <span className="text-lg font-bold text-slate-900">DPDP<span className="text-blue-600">ready</span></span>
              </Link>
              <p className="text-sm text-slate-500 max-w-sm leading-relaxed">AI-powered privacy compliance for India's DPDP Act. Scan websites, generate reports, stay compliant.</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link to="/scan" className="hover:text-blue-600 transition-colors">Scan</Link></li>
                <li><Link to="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link></li>
                <li><Link to="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400">© 2026 DPDPready. All rights reserved.</p>
            <p className="text-sm text-slate-400">Built for India's DPDP Act 2023</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
