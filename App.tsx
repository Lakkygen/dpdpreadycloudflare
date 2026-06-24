import { useState, useRef, useEffect } from 'react';

// ---------- FAQ Item Component ----------
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? 'active' : ''}`}>
      <button className="faq-question" onClick={() => setOpen(!open)} aria-expanded={open}>
        {question}
        <svg className="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div className="faq-answer"><div className="faq-answer-inner">{answer}</div></div>
    </div>
  );
}

// ---------- Main App ----------
export default function App() {
  const [scanInput, setScanInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ----- Scroll Reveal (Intersection Observer) -----
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => e.target.classList.toggle('visible', e.isIntersecting)),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // ----- Sticky Mobile CTA -----
  useEffect(() => {
    const sticky = document.getElementById('stickyMobileCTA')!;
    const final = document.getElementById('cta-final')!;
    const handler = () => {
      if (window.innerWidth > 1024) { sticky.style.display = 'none'; return; }
      const rect = final.getBoundingClientRect();
      sticky.style.display = rect.top < window.innerHeight && rect.bottom > 0 ? 'none' : 'flex';
    };
    window.addEventListener('scroll', handler, { passive: true });
    window.addEventListener('resize', handler);
    handler();
    return () => { window.removeEventListener('scroll', handler); window.removeEventListener('resize', handler); };
  }, []);

  // ----- Scan Submission -----
  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) {
      const input = inputRef.current;
      if (input) {
        input.style.borderColor = '#dc2626';
        input.style.backgroundColor = '#fef2f2';
        setTimeout(() => {
          input.style.borderColor = 'var(--border)';
          input.style.backgroundColor = '#fff';
        }, 2000);
      }
      return;
    }

    setIsScanning(true);
    setShowSuccess(false);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scanInput }),
      });
      const data = await res.json();
      setScanResult(data);
      setShowSuccess(true);
    } catch (err) {
      setScanResult({ score: 0, gaps: [], summary: 'Scan failed. Please try again.' });
      setShowSuccess(true);
    } finally {
      setIsScanning(false);
    }
  };

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Navigation */}
      <nav className="nav">
        <div className="nav-inner">
          <a href="#" className="nav-logo"><span className="nav-logo-icon">D</span>DPDPReady</a>
          <a href="#cta-final" className="nav-cta" onClick={(e) => { e.preventDefault(); scrollTo('cta-final'); }}>Get Free Scan <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>
        </div>
      </nav>

      <main id="main-content">
        {/* Hero */}
        <section className="hero" id="hero">
          <div className="hero-content">
            <div className="hero-badge"><span className="hero-badge-dot"></span> DPDP Act compliance deadlines approaching</div>
            <h1 className="hero-title">Scan your website for <span>DPDP compliance gaps</span> in minutes.</h1>
            <p className="hero-subtitle">Generate the policies, notices, and action steps your business needs to look professional, stay ready, and move faster, without hiring an expensive legal team.</p>
            <div className="hero-urgency"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Free scans available during the pre-enforcement window. Secure your score now.</div>
            <div className="hero-actions">
              <a href="#cta-final" className="btn-primary" onClick={(e) => { e.preventDefault(); scrollTo('cta-final'); }}>Get Your Free DPDP Scan <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></a>
              <a href="#how-it-works" className="btn-secondary" onClick={(e) => { e.preventDefault(); scrollTo('how-it-works'); }}>See how it works</a>
            </div>
            <div className="hero-trust">
              <div className="hero-trust-avatars"><span>AK</span><span>RS</span><span>PM</span></div>
              <span>Compliance made simple for Indian businesses</span>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-glow"></div>
            <div className="dashboard-mockup">
              <div className="dashboard-header">
                <span className="dashboard-dot red"></span><span className="dashboard-dot yellow"></span><span className="dashboard-dot green"></span>
                <span className="dashboard-url">yourbusiness.com</span>
              </div>
              <div className="dashboard-body">
                <div className="dashboard-score-row">
                  <div className="score-gauge">
                    <svg viewBox="0 0 100 100"><circle className="bg-circle" cx="50" cy="50" r="36"/><circle className="fg-circle" cx="50" cy="50" r="36"/></svg>
                    <div className="score-text"><span className="score-num">70%</span><span className="score-label">Compliance Score</span></div>
                  </div>
                  <div className="dashboard-metrics">
                    <div className="dashboard-metric"><span className="metric-label">Pages scanned</span><span className="metric-value">42</span></div>
                    <div className="dashboard-metric"><span className="metric-label">Issues found</span><span className="metric-value warn">3</span></div>
                    <div className="dashboard-metric"><span className="metric-label">Docs ready</span><span className="metric-value good">2 of 3</span></div>
                  </div>
                </div>
                <div className="dashboard-issues">
                  <div className="dashboard-issue"><svg className="issue-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Missing consent notice on 3 pages</div>
                  <div className="dashboard-issue resolved"><svg className="issue-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Privacy policy detected</div>
                </div>
              </div>
              <div className="dashboard-footer">
                <button className="dashboard-btn primary">Generate Fixes →</button>
                <button className="dashboard-btn ghost">Re-scan</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Marquee */}
      <div className="logo-marquee" aria-label="Industries we serve">
        <div className="marquee-track">
          {['Built for Clinics', 'E-Commerce Store', 'SaaS Founders', 'Agencies', 'NBFCs & Lenders', 'Fintech Apps', 'Food Delivery & Q‑commerce', 'Online Pharmacies', 'Gaming & Fantasy Sports Apps', 'Travel & Booking Sites', 'HR & Recruitment Platforms', 'Edtech Platforms'].map((item, i) => (
            <div className="marquee-item" key={i}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> {item}</div>
          ))}
        </div>
      </div>

      {/* Problem Section */}
      <section className="section" id="problem">
        <span className="section-label reveal">The Problem</span>
        <h2 className="section-title reveal reveal-delay-1">DPDP compliance feels overwhelming. Ignoring it is worse.</h2>
        <p className="section-subtitle reveal reveal-delay-2">Most Indian business owners don't know where to start, and that uncertainty puts them at risk.</p>
        <div className="problem-grid">
          {[
            { icon: '😵', cls: 'confusion', title: 'Total confusion', desc: 'Legal websites throw around jargon like "data fiduciary" and "consent managers." You just want to know what applies to your business.' },
            { icon: '⚠️', cls: 'risk', title: 'Real financial risk', desc: 'Non-compliance can lead to penalties under the DPDP Act. The rules are here and enforcement is ramping up.' },
            { icon: '⏳', cls: 'time', title: 'No time to figure it out', desc: 'You\'re running a business. You can\'t spend weeks reading regulations or paying lawyers ₹25,000+ for basic documents.' }
          ].map((item, i) => (
            <div className="problem-card reveal reveal-delay-1" key={i}>
              <div className={`problem-card-icon ${item.cls}`}>{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Solution Section */}
      <section className="section" id="how-it-works">
        <span className="section-label reveal">How It Works</span>
        <h2 className="section-title reveal reveal-delay-1">From scan to compliance in 3 simple steps.</h2>
        <p className="section-subtitle reveal reveal-delay-2">No legal degree required. No confusing forms. Just a fast, clear path to DPDP readiness.</p>
        <div className="solution-steps">
          {[
            { step: 1, title: 'Enter your website', desc: 'Paste your URL. Our AI scans your site for privacy gaps, missing notices, and consent issues in under 90 seconds.' },
            { step: 2, title: 'See your compliance gaps', desc: 'Get a clear, color-coded report showing exactly what\'s missing with a simple compliance score you can track over time.' },
            { step: 3, title: 'Generate fixes & documents', desc: 'One-click generation of privacy policies, consent notices, and audit-ready checklists tailored to your business.' }
          ].map((s, i) => (
            <div className="step-card reveal reveal-delay-1" key={i}>
              <div className="step-number">{s.step}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section" id="benefits">
        <span className="section-label reveal">Outcomes</span>
        <h2 className="section-title reveal reveal-delay-1">What you actually get.</h2>
        <p className="section-subtitle reveal reveal-delay-2">Features are nice. Results are better. Here is what changes after using DPDPReady.</p>
        <div className="benefits-grid">
          {[
            { icon: '⏱️', color: 'green', title: 'Save weeks of effort', desc: 'What takes lawyers weeks and lakhs in fees, you can handle in one afternoon. Get back to building your business.' },
            { icon: '🧠', color: 'blue', title: 'End the confusion', desc: 'No more guessing what compliance means. You get a step-by-step action plan in plain English.' },
            { icon: '🏆', color: 'purple', title: 'Look professional', desc: 'Customers notice when you have proper privacy policies and consent notices. It builds trust.' },
            { icon: '📋', color: 'amber', title: 'Be audit-ready, always', desc: 'Get a living checklist that updates as regulations evolve. When someone asks about your DPDP readiness, you\'ll have the answer.' }
          ].map((b, i) => (
            <div className="benefit-card reveal reveal-delay-1" key={i}>
              <div className={`benefit-icon ${b.color}`}>{b.icon}</div>
              <div><h3>{b.title}</h3><p>{b.desc}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="section" id="features">
        <span className="section-label reveal">Platform</span>
        <h2 className="section-title reveal reveal-delay-1">Everything you need, built for speed.</h2>
        <p className="section-subtitle reveal reveal-delay-2">A focused toolkit not a bloated platform. Every feature earns its place.</p>
        <div className="features-grid">
          {[
            { title: 'Compliance Score', desc: 'Instantly see how compliant your website is with a clear, percentage-based score. Track improvements over time.' },
            { title: 'Privacy Policy Generator', desc: 'Generate a tailored privacy policy that reflects your actual data practices not a generic template.' },
            { title: 'Consent Notice Generator', desc: 'Create cookie and data consent notices that meet DPDP requirements. Customizable, copy-paste ready.' },
            { title: 'Website Scanner', desc: 'Deep scan that detects forms, tracking scripts, cookie usage, and data collection points across your entire site.' },
            { title: 'Document Export', desc: 'Export all generated documents as PDF or HTML. Ready to upload, share, or publish immediately.' },
            { title: 'Audit-Ready Checklist', desc: 'A living checklist mapped to DPDP requirements. Know exactly what\'s done and what needs attention.' }
          ].map((f, i) => (
            <div className="feature-card reveal reveal-delay-1" key={i}>
              <div className="feature-card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4338ca" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="section" id="comparison">
        <span className="section-label reveal">Compare Plans</span>
        <h2 className="section-title reveal reveal-delay-1">See exactly what you get.</h2>
        <p className="section-subtitle reveal reveal-delay-2">No surprises. No hidden limits. Pick the plan that fits your needs.</p>
        <div className="comparison-section reveal reveal-delay-1">
          <div className="comparison-header"><div>Feature</div><div>Free</div><div>Pro</div><div>Business</div></div>
          {[
            ['Website Scans', '1', 'Unlimited', 'Up to 10 sites'],
            ['Compliance Score', 'Basic', 'Full', 'Full'],
            ['Privacy Policy Generator', '—', 'Yes', 'Yes'],
            ['Consent Notice Generator', '—', 'Yes', 'Yes'],
            ['Document Export (PDF/HTML)', '—', 'Yes', 'Yes'],
            ['Audit Checklist', '—', 'Yes', 'Yes'],
            ['Email Alerts', '—', 'Yes', 'Yes'],
            ['White-Label Reports', '—', '—', 'Yes'],
            ['API Access', '—', '—', 'Yes'],
            ['Team Seats', '—', '—', '3 seats']
          ].map((row, i) => (
            <div className="comparison-row" key={i}>
              <div>{row[0]}</div>
              <div className={row[1]==='—'?'check-no':row[1]==='1'?'check-partial':'check-yes'}>{row[1]}</div>
              <div className={row[2]==='—'?'check-no':'check-yes'}>{row[2]}</div>
              <div className={row[3]==='—'?'check-no':'check-yes'}>{row[3]}</div>
            </div>
          ))}
          <div className="comparison-cta-row">
            <div></div>
            <div><a href="#cta-final" className="comparison-cta ghost" onClick={(e) => { e.preventDefault(); scrollTo('cta-final'); }}>Start Free</a></div>
            <div><a href="#cta-final" className="comparison-cta primary" onClick={(e) => { e.preventDefault(); scrollTo('cta-final'); }}>Get Pro</a></div>
            <div><a href="#cta-final" className="comparison-cta outline" onClick={(e) => { e.preventDefault(); scrollTo('cta-final'); }}>Contact Sales</a></div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="section" id="trust">
        <span className="section-label reveal">Trust</span>
        <h2 className="section-title reveal reveal-delay-1">Built for Indian businesses. Backed by real results.</h2>
        <p className="section-subtitle reveal reveal-delay-2">We are not a law firm. We are a technology company making compliance accessible.</p>
        <div className="trust-wrapper">
          <div className="trust-badges">
            {[
              ['🔒', 'Secure by design', 'Your data is encrypted. We never store sensitive scan results longer than needed.'],
              ['🇮🇳', 'India-first', 'Built specifically for the DPDP Act and Indian regulatory context. Not a repurposed GDPR tool.'],
              ['📄', 'Human-readable reports', 'No legalese. Every report and document is written for business owners, not lawyers.'],
              ['🔄', 'Always up to date', 'We track regulatory changes so your documents and checklist stay current automatically.']
            ].map((b, i) => (
              <div className="trust-badge reveal reveal-delay-1" key={i}>
                <div className="trust-badge-icon">{b[0]}</div>
                <h4>{b[1]}</h4>
                <p>{b[2]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="section" id="pricing">
        <span className="section-label reveal">Pricing</span>
        <h2 className="section-title reveal reveal-delay-1">Start free. Upgrade when you are ready.</h2>
        <p className="section-subtitle reveal reveal-delay-2">No hidden fees. No annual lock-in. Just a clear path to compliance at a fraction of traditional legal costs.</p>
        <div className="pricing-grid">
          <div className="pricing-card reveal reveal-delay-1">
            <h3 className="pricing-name">Free Scan</h3>
            <div className="pricing-price">₹0</div>
            <p className="pricing-desc">See where you stand. No credit card required.</p>
            <ul className="pricing-features"><li>1 website scan</li><li>Compliance score</li><li>Basic gap report</li><li>3-day report access</li></ul>
            <a href="#cta-final" className="pricing-cta ghost" onClick={(e) => { e.preventDefault(); scrollTo('cta-final'); }}>Start Free Scan</a>
          </div>
          <div className="pricing-card featured reveal reveal-delay-2">
            <span className="pricing-badge">Most Popular</span>
            <h3 className="pricing-name">Pro</h3>
            <div className="pricing-price">₹2,999<span>/mo</span></div>
            <div className="pricing-annual">₹2,499/mo billed annually (Save ₹6,000)</div>
            <p className="pricing-desc">Full document generation and ongoing monitoring for one website.</p>
            <ul className="pricing-features"><li>Unlimited scans</li><li>Privacy policy generator</li><li>Consent notice generator</li><li>Document export (PDF/HTML)</li><li>Audit-ready checklist</li><li>Email alerts for updates</li><li>30-day report history</li></ul>
            <a href="#cta-final" className="pricing-cta primary" onClick={(e) => { e.preventDefault(); scrollTo('cta-final'); }}>Get Started ₹2,999/mo</a>
          </div>
          <div className="pricing-card reveal reveal-delay-3">
            <h3 className="pricing-name">Business</h3>
            <div className="pricing-price">₹7,999<span>/mo</span></div>
            <div className="pricing-annual">₹6,999/mo billed annually (Save ₹12,000)</div>
            <p className="pricing-desc">For agencies and businesses managing multiple websites.</p>
            <ul className="pricing-features"><li>Up to 10 websites</li><li>Everything in Pro</li><li>White-label reports</li><li>Priority support</li><li>Team access (3 seats)</li><li>API access</li></ul>
            <a href="#cta-final" className="pricing-cta outline" onClick={(e) => { e.preventDefault(); scrollTo('cta-final'); }}>Contact Sales</a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section" id="faq">
        <span className="section-label reveal">FAQ</span>
        <h2 className="section-title reveal reveal-delay-1">Quick answers to common questions.</h2>
        <div className="faq-list">
          {[
            ['What is the DPDP Act?', 'The Digital Personal Data Protection Act, 2023 is India\'s comprehensive data privacy law. It governs how businesses collect, store, process, and share personal data of Indian citizens. If your business collects any customer data — names, phone numbers, emails, payment info — the DPDP Act applies to you.'],
            ['Is this legal advice?', 'No. DPDPReady is a technology tool that helps you identify compliance gaps and generate relevant documents. It does not replace qualified legal counsel. For complex legal situations, we recommend consulting a lawyer. But for most small and mid-sized businesses, our tool covers the essentials.'],
            ['Who is this for?', 'Indian startups, clinics, agencies, e-commerce businesses, SaaS founders, and small-to-mid-sized business owners who collect customer data through their website. If you have a website that collects any form of personal data, this tool is built for you.'],
            ['How long does a scan take?', 'Most website scans complete in under 90 seconds. Larger sites with many pages may take 2–3 minutes. You\'ll see your compliance score and gap report immediately after the scan finishes.'],
            ['Do I need technical knowledge?', 'Not at all. You paste your website URL and click scan. That\'s it. The reports are written in plain English. Installing consent notices or publishing policies is as easy as copy-pasting a few lines of code and we provide clear instructions.'],
            ['Can I cancel anytime?', 'Yes. All paid plans are month-to-month with no long-term commitment. Cancel anytime from your dashboard. You\'ll retain access until the end of your billing period.']
          ].map(([q, a], i) => <FaqItem key={i} question={q} answer={a} />)}
        </div>
      </section>

      {/* Final CTA */}
      <section className="cta-final" id="cta-final">
        <span className="section-label reveal">Get Started</span>
        <h2 className="section-title reveal reveal-delay-1">See your DPDP compliance score in 90 seconds.</h2>
        <p className="section-subtitle reveal reveal-delay-2">Free scan. Instant results. No credit card. No commitment. Just clarity.</p>
        <form className="cta-input-group reveal reveal-delay-1" onSubmit={handleScan}>
          <input
            type="text"
            className="cta-input"
            ref={inputRef}
            placeholder="Enter your website URL..."
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            disabled={isScanning}
          />
          <button className={`btn-primary ${isScanning ? 'loading' : ''}`} type="submit" disabled={isScanning}>
            {isScanning ? (
              <>
                <span className="spinner"></span>
                <span className="btn-text">Scanning...</span>
              </>
            ) : (
              <>
                <span className="btn-text">Check My Website</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </>
            )}
          </button>
        </form>
        {showSuccess && scanResult && (
          <div className="scan-success visible" role="status">
            <h4>✅ Scan complete!</h4>
            <p>Your compliance score: <strong>{scanResult.score}%</strong> — {scanResult.gaps.length} gaps found.</p>
            <p style={{marginTop:8,fontSize:'0.85rem'}}>👉 <a href="#" style={{color:'#065f46',fontWeight:600}}>View full report (demo)</a></p>
          </div>
        )}
        <div className="security-badges reveal reveal-delay-2" aria-label="Security guarantees">
          {['256-bit SSL Encryption', 'No Data Stored', 'DPDP Act Compliant', 'Instant Results'].map((text, i) => (
            <div className="security-badge" key={i}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> {text}</div>
          ))}
        </div>
        <p style={{fontSize:'0.8rem',color:'var(--text-tertiary)',marginTop:'16px'}}>🔒 We don't store your URL after the scan. Your data stays private.</p>
      </section>

      {/* Footer */}
      <footer className="footer" role="contentinfo">
        <span>© 2026 DPDPReady. Built for Indian businesses.</span>
        <div className="footer-links">
          <a href="#faq">FAQ</a> <a href="#pricing">Pricing</a> <a href="#">Privacy</a> <a href="#">Terms</a> <a href="mailto:hello@dpdpready.in">Contact</a>
        </div>
      </footer>

      {/* Sticky Mobile CTA */}
      <div className="sticky-mobile-cta" id="stickyMobileCTA" aria-hidden="true">
        <a href="#cta-final" className="btn-primary" onClick={(e) => { e.preventDefault(); scrollTo('cta-final'); }}>Get Your Free DPDP Scan →</a>
      </div>
    </>
  );
}
