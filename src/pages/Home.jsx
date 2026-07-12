import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  FiShield, FiCheckCircle, FiAlertTriangle, FiFileText,
  FiZap, FiLock, FiGlobe, FiArrowRight, FiPlay,
  FiStar, FiUsers, FiTrendingUp, FiAward
} from 'react-icons/fi';
import ScanForm from '../components/ScanForm';

// Animated counter hook
function useCountUp(end, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  return count;
}

// Feature card component
function FeatureCard({ icon, title, description, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="relative group bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 transition-colors"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600/20 transition-colors">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

// Step card for how it works
function StepCard({ number, title, description, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex gap-4 items-start"
    >
      <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
        {number}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <h4 className="text-white font-semibold">{title}</h4>
        </div>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>
    </motion.div>
  );
}

// Testimonial card
function TestimonialCard({ name, role, company, quote, rating }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6"
    >
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <FiStar key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-600'}`} />
        ))}
      </div>
      <p className="text-slate-300 text-sm mb-4 leading-relaxed">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {name[0]}
        </div>
        <div>
          <p className="text-white text-sm font-medium">{name}</p>
          <p className="text-slate-500 text-xs">{role}, {company}</p>
        </div>
      </div>
    </motion.div>
  );
}

// Stat counter
function StatItem({ icon, value, label, suffix = '' }) {
  const count = useCountUp(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
        {count}{suffix}
      </div>
      <div className="text-slate-500 text-sm">{label}</div>
    </motion.div>
  );
}

export default function Home() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div className="min-h-screen bg-slate-950 overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[150px]" />
      </div>

      {/* Hero Section */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-800 rounded-full text-blue-400 text-sm font-medium mb-8"
          >
            <FiShield className="w-4 h-4" />
            India's DPDP Act 2023 Compliant
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6"
          >
            Privacy Compliance
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Made Simple
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Scan any website for India's DPDP Act compliance. Get AI-powered
            reports, actionable fixes, and downloadable PDFs — all in under 2 minutes.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link
              to="/scan"
              className="group flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50"
            >
              <FiZap className="w-5 h-5" />
              Start Free Scan
              <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/pricing"
              className="flex items-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all border border-slate-700"
            >
              <FiPlay className="w-5 h-5" />
              View Pricing
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
          >
            <StatItem icon={<FiZap className="w-6 h-6 text-blue-500" />} value={2} label="Min Scan Time" suffix="min" />
            <StatItem icon={<FiCheckCircle className="w-6 h-6 text-green-500" />} value={50} label="Compliance Checks" suffix="+" />
            <StatItem icon={<FiShield className="w-6 h-6 text-purple-500" />} value={100} label="DPDP Coverage" suffix="%" />
            <StatItem icon={<FiUsers className="w-6 h-6 text-pink-500" />} value={500} label="Sites Scanned" suffix="+" />
          </motion.div>
        </div>
      </motion.section>

      {/* Trusted By / Logos */}
      <section className="py-12 border-y border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-slate-500 text-sm mb-8 uppercase tracking-wider">
            Trusted by compliance teams at
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
            {['TechCorp', 'DataSafe', 'PrivacyFirst', 'SecureNet', 'CloudGuard'].map((name) => (
              <div key={name} className="text-slate-400 font-semibold text-lg">{name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need for
              <span className="text-blue-500"> DPDP Compliance</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Our AI-powered scanner checks every critical aspect of your website's privacy compliance.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<FiShield className="w-6 h-6 text-blue-500" />}
              title="Consent Management"
              description="Verify cookie banners, consent mechanisms, and user preference storage comply with DPDP requirements."
              delay={0}
            />
            <FeatureCard
              icon={<FiLock className="w-6 h-6 text-green-500" />}
              title="Data Protection"
              description="Check encryption, data minimization practices, and secure storage of personal information."
              delay={0.1}
            />
            <FeatureCard
              icon={<FiFileText className="w-6 h-6 text-purple-500" />}
              title="Privacy Policy Audit"
              description="AI analyzes your privacy policy for completeness, clarity, and DPDP Act alignment."
              delay={0.2}
            />
            <FeatureCard
              icon={<FiGlobe className="w-6 h-6 text-pink-500" />}
              title="Cross-Border Data"
              description="Identify data transfers outside India and verify compliance with DPDP cross-border provisions."
              delay={0.3}
            />
            <FeatureCard
              icon={<FiAlertTriangle className="w-6 h-6 text-yellow-500" />}
              title="Risk Assessment"
              description="Get severity-rated findings with actionable remediation steps prioritized by impact."
              delay={0.4}
            />
            <FeatureCard
              icon={<FiTrendingUp className="w-6 h-6 text-cyan-500" />}
              title="Continuous Monitoring"
              description="Schedule automated scans and get alerted when your compliance score changes."
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How It <span className="text-blue-500">Works</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Get your compliance report in three simple steps.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <StepCard
              number="1"
              title="Enter Website URL"
              description="Paste any website URL into our scanner. No signup required for your first scan."
              icon={<FiGlobe className="w-5 h-5 text-blue-500" />}
            />
            <StepCard
              number="2"
              title="AI Analysis"
              description="Our engine crawls your site and uses GPT-4o to analyze privacy practices against DPDP Act requirements."
              icon={<FiZap className="w-5 h-5 text-purple-500" />}
            />
            <StepCard
              number="3"
              title="Get Your Report"
              description="Receive a detailed compliance score, prioritized findings, and a downloadable PDF action plan."
              icon={<FiFileText className="w-5 h-5 text-green-500" />}
            />
          </div>
        </div>
      </section>

      {/* Live Demo / Scan Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Try It <span className="text-blue-500">Now</span>
            </h2>
            <p className="text-slate-400">
              Enter any website URL below to start your free compliance scan.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8"
          >
            <ScanForm />
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Loved by <span className="text-blue-500">Compliance Teams</span>
            </h2>
            <p className="text-slate-400">
              See what professionals say about DPDPready.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard
              name="Priya Sharma"
              role="DPO"
              company="TechStart India"
              quote="DPDPready cut our compliance audit time from weeks to minutes. The AI insights are incredibly accurate."
              rating={5}
            />
            <TestimonialCard
              name="Rahul Mehta"
              role="CTO"
              company="DataVault"
              quote="We used this to audit 50+ client websites. The PDF reports alone saved us 200+ hours of manual work."
              rating={5}
            />
            <TestimonialCard
              name="Ananya Patel"
              role="Legal Counsel"
              company="SecureNet"
              quote="Finally, a tool that understands India's DPDP Act. The actionable recommendations are spot-on."
              rating={4}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 sm:p-12 text-center"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Ensure Compliance?
              </h2>
              <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
                Join hundreds of companies using DPDPready to stay compliant with India's data protection laws.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/scan"
                  className="flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
                >
                  <FiZap className="w-5 h-5" />
                  Start Free Scan
                </Link>
                <Link
                  to="/pricing"
                  className="flex items-center gap-2 px-8 py-4 bg-blue-500/20 text-white font-semibold rounded-xl hover:bg-blue-500/30 transition-colors border border-blue-400/30"
                >
                  View Pricing
                </Link>
              </div>
              <p className="text-blue-200 text-sm mt-6">
                No credit card required. Free tier includes 10 scans/month.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-lg mb-4">
                <FiShield className="text-blue-500" />
                DPDPready
              </div>
              <p className="text-slate-500 text-sm">
                AI-powered privacy compliance for India's DPDP Act 2023.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/scan" className="text-slate-400 hover:text-white transition-colors">Scanner</Link></li>
                <li><Link to="/pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-slate-400 hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Legal</h4>
              <p className="text-slate-500 text-sm">
                DPDPready provides automated guidance. Consult a legal professional for compliance matters.
              </p>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
            © {new Date().getFullYear()} DPDPready. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
