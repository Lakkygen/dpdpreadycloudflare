import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  FiShield, FiCheckCircle, FiAlertTriangle, FiFileText,
  FiZap, FiLock, FiGlobe, FiArrowRight, FiPlay,
  FiStar, FiUsers, FiTrendingUp
} from 'react-icons/fi';
import ScanForm from '../components/ScanForm';

// ---------------------------------------------------------------------------
// Design tokens (kept inline so this file is drop-in — move to tailwind
// config / CSS variables if you want to reuse the palette elsewhere)
// ---------------------------------------------------------------------------
// paper      #F7F5F0  page background, warm official-document tone
// paper-alt  #EFEAE0  card / alternating-section background
// ink        #14213D  headings, primary text — deep archival navy
// ink-soft   #5B6472  body copy
// line       #DDD6C4  hairlines, borders
// seal       #B8863A  primary accent — bronze/gold, evokes an official seal
// seal-dark  #96692B  hover state for seal accent
// verify     #3F6F5E  "compliant" / positive signal
// alert      #B1503A  "risk" / negative signal
// ---------------------------------------------------------------------------

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

// The signature element: a rotating seal, like an official stamp of
// verification. Reused at three scales — hero, step 3, and the closing CTA —
// so it reads as the mark of the product rather than a one-off flourish.
function ComplianceSeal({ size = 160, ringSpeed = 40 }) {
  const uid = useState(() => `sealPath-${Math.random().toString(36).slice(2, 9)}`)[0];
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: ringSpeed, repeat: Infinity, ease: 'linear' }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <path id={uid} d="M 100,100 m -82,0 a 82,82 0 1,1 164,0 a 82,82 0 1,1 -164,0" />
          </defs>
          <text fontSize="10.5" letterSpacing="3.2" fill="#B8863A" className="font-mono uppercase">
            <textPath href={`#${uid}`}>
              COMPLIANCE VERIFIED &#8226; DPDP ACT 2023 &#8226; COMPLIANCE VERIFIED &#8226; DPDP ACT 2023 &#8226;
            </textPath>
          </text>
        </svg>
      </motion.div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="rounded-full bg-[#14213D] border-2 border-[#B8863A] flex items-center justify-center shadow-[0_1px_0_rgba(184,134,58,0.5)_inset]"
          style={{ width: size * 0.52, height: size * 0.52 }}
        >
          <FiShield style={{ width: size * 0.22, height: size * 0.22 }} className="text-[#F7F5F0]" />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ eyebrow, icon, title, description, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group bg-white border border-[#DDD6C4] rounded-lg p-6 hover:border-[#B8863A] hover:shadow-[0_8px_24px_-12px_rgba(20,33,61,0.18)] transition-all"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="w-11 h-11 rounded-full bg-[#F7F5F0] border border-[#DDD6C4] flex items-center justify-center group-hover:border-[#B8863A] transition-colors">
          {icon}
        </div>
        <span className="font-mono text-[10px] tracking-widest uppercase text-[#B8863A]">
          {eyebrow}
        </span>
      </div>
      <h3 className="font-display text-lg text-[#14213D] mb-2">{title}</h3>
      <p className="text-[#5B6472] text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

function StepCard({ number, title, description, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex gap-4 items-start"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-[#B8863A] bg-white flex items-center justify-center text-[#14213D] font-mono text-sm font-medium">
        {number}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <h4 className="font-display text-[#14213D] text-lg">{title}</h4>
        </div>
        <p className="text-[#5B6472] text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

function TestimonialCard({ name, role, company, quote, rating }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="bg-white border border-[#DDD6C4] rounded-lg p-6"
    >
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <FiStar key={i} className={`w-4 h-4 ${i < rating ? 'text-[#B8863A] fill-[#B8863A]' : 'text-[#DDD6C4]'}`} />
        ))}
      </div>
      <p className="font-display italic text-[#14213D] text-[15px] mb-5 leading-relaxed">
        &#8220;{quote}&#8221;
      </p>
      <div className="flex items-center gap-3 pt-4 border-t border-[#EFEAE0]">
        <div className="w-9 h-9 rounded-full bg-[#14213D] border border-[#B8863A] flex items-center justify-center text-[#F7F5F0] font-mono text-xs">
          {name[0]}
        </div>
        <div>
          <p className="text-[#14213D] text-sm font-medium">{name}</p>
          <p className="font-mono text-[#5B6472] text-[11px] uppercase tracking-wide">{role}, {company}</p>
        </div>
      </div>
    </motion.div>
  );
}

function StatItem({ icon, value, label, suffix = '' }) {
  const count = useCountUp(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="font-mono text-3xl sm:text-4xl font-medium text-[#14213D] mb-1">
        {count}{suffix}
      </div>
      <div className="text-[#5B6472] text-xs uppercase tracking-widest">{label}</div>
    </motion.div>
  );
}

export default function Home() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.97]);

  return (
    <div className="min-h-screen bg-[#F7F5F0] font-body overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Newsreader', Georgia, serif; }
        .font-body { font-family: 'Inter', system-ui, sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', ui-monospace, monospace; }
      `}</style>

      {/* Ambient background — quiet, paper-toned, not neon */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#B8863A]/[0.06] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#3F6F5E]/[0.05] rounded-full blur-[100px]" />
      </div>

      {/* Hero */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <ComplianceSeal size={132} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-[#DDD6C4] rounded-full text-[#14213D] text-xs font-mono uppercase tracking-widest mb-8"
          >
            India&#39;s DPDP Act, 2023
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-medium text-[#14213D] tracking-tight mb-6"
          >
            Privacy compliance,
            <br />
            <span className="italic text-[#B8863A]">made legible.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-lg text-[#5B6472] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Scan any website against India&#39;s DPDP Act. Get a plain-language report,
            prioritized fixes, and a downloadable PDF — in under two minutes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link
              to="/scan"
              className="group flex items-center gap-2 px-8 py-4 bg-[#B8863A] hover:bg-[#96692B] text-white font-medium rounded-lg transition-colors shadow-[0_10px_30px_-12px_rgba(184,134,58,0.6)]"
            >
              <FiZap className="w-5 h-5" />
              Start free scan
              <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/pricing"
              className="flex items-center gap-2 px-8 py-4 bg-transparent hover:bg-white text-[#14213D] font-medium rounded-lg transition-colors border border-[#14213D]/20"
            >
              <FiPlay className="w-5 h-5" />
              View pricing
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto pt-10 border-t border-[#DDD6C4]"
          >
            <StatItem icon={<FiZap className="w-5 h-5 text-[#B8863A]" />} value={2} label="Min scan time" suffix="min" />
            <StatItem icon={<FiCheckCircle className="w-5 h-5 text-[#3F6F5E]" />} value={50} label="Compliance checks" suffix="+" />
            <StatItem icon={<FiShield className="w-5 h-5 text-[#14213D]" />} value={100} label="DPDP coverage" suffix="%" />
            <StatItem icon={<FiUsers className="w-5 h-5 text-[#B1503A]" />} value={500} label="Sites scanned" suffix="+" />
          </motion.div>
        </div>
      </motion.section>

      {/* Trusted by */}
      <section className="py-12 border-y border-[#DDD6C4] bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[#5B6472] text-xs font-mono uppercase tracking-widest mb-8">
            Preparing for enforcement alongside teams at
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4">
            {['TechCorp', 'DataSafe', 'PrivacyFirst', 'SecureNet', 'CloudGuard'].map((name) => (
              <div key={name} className="font-display text-[#14213D]/50 font-medium text-lg">{name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-medium text-[#14213D] mb-4">
              Everything the Act requires you to check
            </h2>
            <p className="text-[#5B6472] max-w-2xl mx-auto">
              Our scanner works through every clause that matters, so you don&#39;t have to
              read the Act to know where you stand.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              eyebrow="Consent"
              icon={<FiShield className="w-5 h-5 text-[#14213D]" />}
              title="Consent management"
              description="Verify cookie banners, consent mechanisms, and preference storage against DPDP requirements."
              delay={0}
            />
            <FeatureCard
              eyebrow="Protection"
              icon={<FiLock className="w-5 h-5 text-[#3F6F5E]" />}
              title="Data protection"
              description="Check encryption, data minimization, and secure storage of personal information."
              delay={0.08}
            />
            <FeatureCard
              eyebrow="Policy"
              icon={<FiFileText className="w-5 h-5 text-[#B8863A]" />}
              title="Privacy policy audit"
              description="AI reads your privacy policy for completeness, clarity, and alignment with the Act."
              delay={0.16}
            />
            <FeatureCard
              eyebrow="Transfers"
              icon={<FiGlobe className="w-5 h-5 text-[#B1503A]" />}
              title="Cross-border data"
              description="Identify data transfers outside India and check them against DPDP transfer rules."
              delay={0.24}
            />
            <FeatureCard
              eyebrow="Risk"
              icon={<FiAlertTriangle className="w-5 h-5 text-[#B1503A]" />}
              title="Risk assessment"
              description="Get severity-rated findings with remediation steps ordered by impact, not alphabet."
              delay={0.32}
            />
            <FeatureCard
              eyebrow="Monitoring"
              icon={<FiTrendingUp className="w-5 h-5 text-[#3F6F5E]" />}
              title="Continuous monitoring"
              description="Schedule recurring scans and get notified the moment your compliance score changes."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#EFEAE0]/60 border-y border-[#DDD6C4]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-medium text-[#14213D] mb-4">
              How it works
            </h2>
            <p className="text-[#5B6472] max-w-2xl mx-auto">
              Three steps between you and a certified answer.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10 max-w-4xl mx-auto">
            <StepCard
              number="1"
              title="Enter a website URL"
              description="Paste any website URL into the scanner. No signup needed for your first scan."
              icon={<FiGlobe className="w-4 h-4 text-[#14213D]" />}
            />
            <StepCard
              number="2"
              title="Automated analysis"
              description="Our engine crawls the site and checks it against DPDP Act requirements, clause by clause."
              icon={<FiZap className="w-4 h-4 text-[#14213D]" />}
            />
            <StepCard
              number="3"
              title="Get your report"
              description="Receive a compliance score, prioritized findings, and a downloadable PDF action plan."
              icon={<FiFileText className="w-4 h-4 text-[#14213D]" />}
            />
          </div>
        </div>
      </section>

      {/* Live demo */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-medium text-[#14213D] mb-4">
              Try it now
            </h2>
            <p className="text-[#5B6472]">
              Enter any website URL below to start your free compliance scan.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white border border-[#DDD6C4] rounded-xl p-8 shadow-[0_20px_50px_-24px_rgba(20,33,61,0.15)]"
          >
            <ScanForm />
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#EFEAE0]/60 border-y border-[#DDD6C4]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-medium text-[#14213D] mb-4">
              Read by compliance teams
            </h2>
            <p className="text-[#5B6472]">
              What DPOs, CTOs, and counsel say after their first scan.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard
              name="Priya Sharma"
              role="DPO"
              company="TechStart India"
              quote="DPDPready cut our compliance audit time from weeks to minutes. The findings are precise, not generic."
              rating={5}
            />
            <TestimonialCard
              name="Rahul Mehta"
              role="CTO"
              company="DataVault"
              quote="We audited fifty client sites with it. The PDF reports alone saved us two hundred hours of manual work."
              rating={5}
            />
            <TestimonialCard
              name="Ananya Patel"
              role="Legal Counsel"
              company="SecureNet"
              quote="Finally a tool that reads the DPDP Act the way a lawyer would. The recommendations hold up."
              rating={4}
            />
          </div>
        </div>
      </section>

      {/* CTA — styled like a certificate: navy ground, gold hairline, corner ticks */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-[#14213D] rounded-2xl p-8 sm:p-14 text-center overflow-hidden"
          >
            <div className="absolute inset-3 border border-[#B8863A]/40 rounded-xl pointer-events-none" />
            {[['top-4','left-4','border-t','border-l'],['top-4','right-4','border-t','border-r'],
              ['bottom-4','left-4','border-b','border-l'],['bottom-4','right-4','border-b','border-r']].map(([t,r,b1,b2], i) => (
              <div key={i} className={`absolute ${t} ${r} w-6 h-6 ${b1} ${b2} border-[#B8863A]`} />
            ))}

            <div className="relative flex justify-center mb-6">
              <ComplianceSeal size={84} ringSpeed={28} />
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-medium text-white mb-4">
              Ready to know where you stand?
            </h2>
            <p className="text-[#F7F5F0]/70 text-lg mb-8 max-w-xl mx-auto">
              Join hundreds of companies using DPDPready to stay ahead of India&#39;s
              data protection law.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/scan"
                className="flex items-center gap-2 px-8 py-4 bg-[#B8863A] hover:bg-[#96692B] text-white font-medium rounded-lg transition-colors"
              >
                <FiZap className="w-5 h-5" />
                Start free scan
              </Link>
              <Link
                to="/pricing"
                className="flex items-center gap-2 px-8 py-4 bg-transparent text-white font-medium rounded-lg hover:bg-white/5 transition-colors border border-white/20"
              >
                View pricing
              </Link>
            </div>
            <p className="text-[#F7F5F0]/50 text-sm mt-6 font-mono">
              No credit card required &#8226; free tier includes 10 scans/month
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#DDD6C4] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 text-[#14213D] font-display font-medium text-lg mb-4">
                <FiShield className="text-[#B8863A]" />
                DPDPready
              </div>
              <p className="text-[#5B6472] text-sm">
                AI-powered privacy compliance for India&#39;s DPDP Act, 2023.
              </p>
            </div>
            <div>
              <h4 className="text-[#14213D] font-medium mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/scan" className="text-[#5B6472] hover:text-[#14213D] transition-colors">Scanner</Link></li>
                <li><Link to="/pricing" className="text-[#5B6472] hover:text-[#14213D] transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#14213D] font-medium mb-3">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="text-[#5B6472] hover:text-[#14213D] transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-[#5B6472] hover:text-[#14213D] transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#14213D] font-medium mb-3">Legal</h4>
              <p className="text-[#5B6472] text-sm">
                DPDPready provides automated guidance. Consult a legal professional for compliance matters.
              </p>
            </div>
          </div>
          <div className="border-t border-[#DDD6C4] pt-8 text-center text-[#5B6472] text-sm">
            &#169; {new Date().getFullYear()} DPDPready. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
