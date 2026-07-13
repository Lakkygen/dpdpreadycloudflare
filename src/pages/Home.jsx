import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ShieldIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const ScanIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/></svg>;
const FileTextIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const ZapIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const CheckCircleIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const ArrowRightIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const LockIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const BarChartIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>;
const GlobeIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const StarIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const ChevronDownIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;

export default function Home() {
  const [url, setUrl] = useState("");
  const [openFaq, setOpenFaq] = useState(0);

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
    <div className="bg-white">
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-100/50 rounded-full blur-3xl opacity-60" />
          <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-50/60 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-8">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
                </span>
                <span className="text-sm font-semibold text-blue-700">Now Compliant with India's DPDP Act 2023</span>
              </div>

              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-6">
                Privacy Compliance, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Automated</span>
              </h1>
              <p className="text-lg lg:text-xl text-slate-600 leading-relaxed mb-10 max-w-xl">
                Scan any website against India's Digital Personal Data Protection Act. Get an instant compliance score, AI-powered findings, and a board-ready PDF report — in under 2 minutes.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <GlobeIcon />
                  <input type="url" placeholder="https://your-website.com" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" />
                </div>
                <Link to="/scan" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 whitespace-nowrap">
                  <ScanIcon /> Scan Now
                </Link>
              </div>

              <div className="flex items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2"><CheckCircleIcon /> <span>No credit card required</span></div>
                <div className="flex items-center gap-2"><CheckCircleIcon /> <span>Free first scan</span></div>
              </div>
            </div>

            <div className="relative lg:pl-8">
              <div className="relative bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-200/60 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400"/><div className="w-3 h-3 rounded-full bg-amber-400"/><div className="w-3 h-3 rounded-full bg-emerald-400"/></div>
                  <div className="flex-1 mx-4"><div className="bg-white rounded-md px-3 py-1.5 text-xs text-slate-400 border border-slate-200 text-center">dpdpready.app/scan/results</div></div>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Compliance Score</p>
                      <p className="text-3xl font-bold text-slate-900 mt-1">72<span className="text-lg text-slate-400">/100</span></p>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-amber-400 flex items-center justify-center"><span className="text-sm font-bold text-amber-600">72%</span></div>
                  </div>
                  <div className="space-y-3">
                    {[{l:"Consent Mechanism",s:85,c:"bg-emerald-500"},{l:"Privacy Policy",s:60,c:"bg-amber-500"},{l:"Data Security",s:45,c:"bg-red-500"},{l:"User Rights",s:90,c:"bg-emerald-500"}].map((item) => (
                      <div key={item.l}>
                        <div className="flex justify-between text-sm mb-1.5"><span className="text-slate-700 font-medium">{item.l}</span><span className="text-slate-500">{item.s}%</span></div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${item.c} rounded-full`} style={{width:`${item.s}%`}} /></div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0 mt-0.5"><LockIcon /></div>
                    <div><p className="text-sm font-semibold text-red-800">Critical: Missing DPO Contact</p><p className="text-xs text-red-600 mt-1">Section 8(4) violation detected. Your privacy policy must include a Data Protection Officer contact.</p></div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl shadow-slate-900/10 border border-slate-100 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center"><FileTextIcon /></div>
                <div><p className="text-xs text-slate-500">Report Generated</p><p className="text-sm font-semibold text-slate-900">DPDP_Compliance_Report.pdf</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-widest mb-8">Trusted by compliance teams at forward-thinking companies</p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
            {["TechCorp India","StartUp Delhi","LegalEase","DataVault","CloudFirst","SecureNet"].map((name) => (
              <div key={name} className="text-lg font-bold text-slate-300 hover:text-slate-400 transition-colors select-none">{name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-6">Everything you need to stay compliant</h2>
            <p className="text-lg text-slate-600 leading-relaxed">From automated scanning to executive-ready reports, we handle the heavy lifting so your legal and engineering teams can focus on what matters.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="group bg-white rounded-2xl p-8 border border-slate-100 hover:border-slate-200 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/5 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-xl ${f.color.split(' ')[0]} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className={f.color.split(' ')[1]}>{f.icon}</div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 lg:py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-6">Compliance in three simple steps</h2>
            <p className="text-lg text-slate-600 leading-relaxed">No complex audits. No expensive consultants. Just enter your URL and let our AI do the rest.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {[{n:"01",t:"Enter Your Website URL",d:"Paste any website URL into our scanner. No installation, no code changes, no setup required."},{n:"02",t:"AI Analysis in 2 Minutes",d:"Our engine crawls your site, reads your privacy policy, checks consent flows, and validates against the DPDP Act."},{n:"03",t:"Download Your Report",d:"Get a detailed compliance score, categorized findings, and a professionally formatted PDF report."}].map((step, i) => (
              <div key={i} className="relative">
                {i < 2 && <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-blue-200 to-transparent" />}
                <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-slate-900/5 transition-all duration-300">
                  <div className="text-5xl font-bold text-slate-100 mb-6">{step.n}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{step.t}</h3>
                  <p className="text-slate-600 leading-relaxed">{step.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Report Preview */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Reports</p>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-6">Reports that impress your board</h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">Every scan generates a beautifully formatted PDF report with executive summaries, detailed findings, risk ratings, and actionable next steps.</p>
              <div className="space-y-4">
                {["Executive summary with overall compliance score","Section-by-section DPDP Act breakdown","Risk-rated findings (Critical, Warning, Pass)","Specific remediation steps for each issue","Comparison tracking across multiple scans"].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5"><CheckCircleIcon /></div>
                    <p className="text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2 relative">
              <div className="bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-200/60 overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2"><FileTextIcon /><span className="text-sm font-medium text-slate-600">DPDP_Compliance_Report.pdf</span></div>
                <div className="p-8 space-y-6">
                  <div className="text-center pb-6 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">DPDP Compliance Report</p>
                    <h3 className="text-2xl font-bold text-slate-900">example.com</h3>
                    <p className="text-sm text-slate-500 mt-1">Generated on July 12, 2026</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[{v:"12",l:"Passed",c:"bg-emerald-50 text-emerald-600"},{v:"5",l:"Warnings",c:"bg-amber-50 text-amber-600"},{v:"3",l:"Critical",c:"bg-red-50 text-red-600"}].map((stat) => (
                      <div key={stat.l} className={`text-center p-4 rounded-xl ${stat.c.split(' ')[0]}`}>
                        <p className={`text-2xl font-bold ${stat.c.split(' ')[1]}`}>{stat.v}</p>
                        <p className={`text-xs mt-1 ${stat.c.split(' ')[1].replace('text','text-opacity-70')}`}>{stat.l}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                      <div className="flex items-center gap-2 mb-2"><span className="px-2 py-0.5 bg-red-200 text-red-800 text-xs font-bold rounded">CRITICAL</span><span className="text-sm font-semibold text-red-800">Missing Data Principal Rights Page</span></div>
                      <p className="text-xs text-red-600">Section 12 & 13 — Users must be able to access, correct, and delete their data.</p>
                    </div>
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                      <div className="flex items-center gap-2 mb-2"><span className="px-2 py-0.5 bg-amber-200 text-amber-800 text-xs font-bold rounded">WARNING</span><span className="text-sm font-semibold text-amber-800">Cookie Consent Not Granular</span></div>
                      <p className="text-xs text-amber-600">Section 6 — Consent must be free, specific, informed, unconditional, and unambiguous.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 lg:py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-6">Simple, transparent pricing</h2>
            <p className="text-lg text-slate-600 leading-relaxed">Start free. Upgrade when you need more power. No hidden fees, no surprises.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[{name:"Starter",price:"Free",period:"",desc:"Perfect for small websites and initial assessments.",features:["1 website scan per month","Basic compliance score","Summary findings","Email support"],cta:"Start Free",popular:false},{name:"Professional",price:"₹2,999",period:"/month",desc:"For growing businesses that need regular compliance checks.",features:["10 website scans per month","Detailed AI-powered findings","PDF report generation","Priority email support","Compliance history tracking"],cta:"Start Pro Trial",popular:true},{name:"Enterprise",price:"Custom",period:"",desc:"For large organizations with complex compliance needs.",features:["Unlimited scans","API access","White-label reports","Dedicated account manager","Custom compliance rules","SSO & team management"],cta:"Contact Sales",popular:false}].map((plan, i) => (
              <div key={i} className={`relative rounded-2xl p-8 ${plan.popular ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/20 scale-105 z-10" : "bg-white border border-slate-100 text-slate-900"}`}>
                {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">Most Popular</div>}
                <div className="mb-6"><h3 className={`text-lg font-semibold mb-2 ${plan.popular ? "text-white" : "text-slate-900"}`}>{plan.name}</h3><p className={`text-sm ${plan.popular ? "text-slate-300" : "text-slate-500"}`}>{plan.desc}</p></div>
                <div className="mb-6"><span className={`text-4xl font-bold ${plan.popular ? "text-white" : "text-slate-900"}`}>{plan.price}</span><span className={`text-sm ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>{plan.period}</span></div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-3">
                      <svg className={`w-5 h-5 shrink-0 mt-0.5 ${plan.popular ? "text-blue-400" : "text-blue-600"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      <span className={`text-sm ${plan.popular ? "text-slate-300" : "text-slate-600"}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 ${plan.popular ? "bg-white text-slate-900 hover:bg-slate-100 shadow-lg" : "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20"}`}>{plan.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Testimonials</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-6">Loved by compliance teams</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[{quote:"DPDPready saved us weeks of legal review. We scanned our entire platform and had a compliance report ready for our board meeting the same day.",author:"Priya Sharma",role:"General Counsel, FinTech Startup"},{quote:"The actionable recommendations are what set this apart. Instead of vague advice, we got exact clauses to add and remove.",author:"Rahul Mehta",role:"CTO, E-commerce Platform"},{quote:"We used DPDPready to audit 12 client websites in one afternoon. The white-label reports are professional enough to put our agency name on them.",author:"Ananya Reddy",role:"Founder, Digital Agency"}].map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-slate-900/5 transition-all duration-300">
                <div className="flex gap-1 mb-4">{[1,2,3,4,5].map((s) => <StarIcon key={s} />)}</div>
                <p className="text-slate-700 leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">{t.author.split(" ").map((n) => n[0]).join("")}</div>
                  <div><p className="text-sm font-semibold text-slate-900">{t.author}</p><p className="text-xs text-slate-500">{t.role}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 lg:py-32 bg-slate-50/50">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-6">Frequently asked questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className={`bg-white rounded-xl border transition-all duration-300 ${openFaq === i ? "border-blue-200 shadow-md shadow-blue-900/5" : "border-slate-100"}`}>
                <button className="w-full flex items-center justify-between p-6 text-left" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                  <span className="font-semibold text-slate-900 pr-4">{faq.q}</span>
                  <ChevronDownIcon className={`shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && <div className="px-6 pb-6"><p className="text-slate-600 leading-relaxed">{faq.a}</p></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 lg:p-16 text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-5xl font-bold text-white tracking-tight mb-6">Ready to get compliant?</h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10">Join hundreds of Indian businesses using DPDPready to stay ahead of regulations. Your first scan is completely free.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/scan" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-all shadow-xl hover:-translate-y-0.5">
                  <ScanIcon /> Start Free Scan
                </Link>
                <Link to="/demo" className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border border-slate-600 text-white font-semibold rounded-xl hover:bg-white/5 transition-all">
                  View Demo Report <ArrowRightIcon />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
