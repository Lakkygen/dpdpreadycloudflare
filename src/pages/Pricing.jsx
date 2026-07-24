import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

// ─── Icons ─────────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const ZapIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

// ─── Razorpay Checkout Script Loader ───────────────────────────────
const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// ─── Main Component ────────────────────────────────────────────────
export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [processing, setProcessing] = useState(null);
  const navigate = useNavigate();

  const plans = [
    {
      id: "free",
      name: "Free",
      price: { monthly: 0, yearly: 0 },
      period: "",
      desc: "Perfect for small websites and initial assessments.",
      features: [
        "2 website scans per month",
        "Basic compliance score",
        "Summary findings only",
        "Email support",
      ],
      cta: "Start Free",
      popular: false,
      highlight: false,
    },
    {
      id: "pro",
      name: "Pro",
      price: { monthly: 29, yearly: 290 },
      period: "/month",
      desc: "For growing businesses that need regular compliance checks.",
      features: [
        "50 website scans per month",
        "Detailed AI-powered findings",
        "PDF report generation",
        "Priority email support",
        "Compliance history tracking",
        "API access",
      ],
      cta: "Start Pro Trial",
      popular: true,
      highlight: true,
    },
    {
      id: "agency",
      name: "Agency",
      price: { monthly: 97, yearly: 970 },
      period: "/month",
      desc: "For compliance agencies managing multiple clients.",
      features: [
        "Unlimited scans",
        "White-label PDF reports",
        "Multi-client dashboard",
        "5 team seats included",
        "Custom branding",
        "Priority support + SLA",
        "API access",
      ],
      cta: "Start Agency Trial",
      popular: false,
      highlight: false,
    },
  ];

  const handleCheckout = async (plan) => {
    const token = localStorage.getItem("token");

    // Free plan — just redirect to dashboard
    if (plan.id === "free") {
      if (!token) {
        navigate("/register");
        return;
      }
      toast.success("You're on the Free plan!");
      navigate("/dashboard");
      return;
    }

    // Paid plan — need auth
    if (!token) {
      toast("Please sign in to upgrade", { icon: "🔒" });
      navigate(`/login?redirect=/pricing`);
      return;
    }

    setProcessing(plan.id);

    try {
      // Load Razorpay script
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Failed to load payment gateway");

      // Create order on backend
      const amountInPaise = plan.price[billingCycle] * 100;
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: plan.id,
          amount: amountInPaise,
          billingCycle,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");

      // Open Razorpay checkout
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "DPDPready",
        description: `${plan.name} Plan (${billingCycle})`,
        order_id: data.orderId,
        handler: async function (response) {
          // Verify payment
          const verifyRes = await fetch("/api/billing/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            toast.success(`Welcome to ${plan.name}! Your plan is now active.`);
            navigate("/dashboard");
          } else {
            toast.error("Payment verification failed. Contact support.");
          }
        },
        prefill: {
          email: "", // Will be filled by Razorpay if user is logged in
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: function () {
            setProcessing(null);
            toast("Payment cancelled", { icon: "⚠️" });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      toast.error(err.message);
      setProcessing(null);
    }
  };

  const formatPrice = (price) => {
    if (price === 0) return "Free";
    return `$${price}`;
  };

  const savings = (monthly, yearly) => {
    if (monthly === 0) return null;
    const saved = (monthly * 12) - yearly;
    return `Save $${saved}/year`;
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Pricing</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Start free. Upgrade when you need more power. No hidden fees, no surprises.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-4 mb-12"
        >
          <span className={`text-sm font-medium ${billingCycle === "monthly" ? "text-slate-900" : "text-slate-400"}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
            className="relative w-14 h-8 bg-slate-200 rounded-full transition-colors"
          >
            <motion.div
              animate={{ x: billingCycle === "yearly" ? 24 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
            />
          </button>
          <span className={`text-sm font-medium ${billingCycle === "yearly" ? "text-slate-900" : "text-slate-400"}`}>
            Yearly
          </span>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            2 months free
          </span>
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className={`relative rounded-2xl p-8 ${
                plan.highlight
                  ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/20 scale-105 z-10"
                  : "bg-white border border-slate-100 text-slate-900 hover:shadow-xl hover:shadow-slate-900/5"
              } transition-shadow`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-lg font-semibold mb-2 ${plan.highlight ? "text-white" : "text-slate-900"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm ${plan.highlight ? "text-slate-300" : "text-slate-500"}`}>
                  {plan.desc}
                </p>
              </div>

              <div className="mb-6">
                <span className={`text-4xl font-bold ${plan.highlight ? "text-white" : "text-slate-900"}`}>
                  {formatPrice(plan.price[billingCycle])}
                </span>
                {plan.price[billingCycle] > 0 && (
                  <span className={`text-sm ${plan.highlight ? "text-slate-400" : "text-slate-500"}`}>
                    {billingCycle === "yearly" ? "/year" : plan.period}
                  </span>
                )}
                {billingCycle === "yearly" && savings(plan.price.monthly, plan.price.yearly) && (
                  <p className="text-xs text-emerald-400 mt-1 font-medium">
                    {savings(plan.price.monthly, plan.price.yearly)}
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-3">
                    <span className={`w-5 h-5 shrink-0 mt-0.5 ${plan.highlight ? "text-blue-400" : "text-blue-600"}`}>
                      <CheckIcon />
                    </span>
                    <span className={`text-sm ${plan.highlight ? "text-slate-300" : "text-slate-600"}`}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCheckout(plan)}
                disabled={processing === plan.id}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                  plan.highlight
                    ? "bg-white text-slate-900 hover:bg-slate-100 shadow-lg"
                    : "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {processing === plan.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  plan.cta
                )}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Enterprise CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-3xl mx-auto bg-slate-50 rounded-2xl p-8 border border-slate-100 text-center"
        >
          <h3 className="text-xl font-bold text-slate-900 mb-2">Need a custom enterprise solution?</h3>
          <p className="text-slate-600 mb-6">
            Large organizations with complex compliance needs can get dedicated support, custom integrations, and flexible billing.
          </p>
          <a
            href="mailto:enterprise@dpdpready.tech"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
          >
            Contact Sales <ArrowRightIcon />
          </a>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-3xl mx-auto mt-16"
        >
          <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {[
              { q: "Can I switch plans at any time?", a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately." },
              { q: "Do you offer annual billing?", a: "Yes, annual billing gives you 2 months free. Contact us for enterprise annual contracts." },
              { q: "What payment methods do you accept?", a: "We accept all major credit cards, UPI, and net banking for Indian customers via Razorpay." },
              { q: "Is there a refund policy?", a: "Yes, we offer a 14-day money-back guarantee on all paid plans. No questions asked." },
            ].map((faq, i) => (
              <div key={i} className="border-b border-slate-200 pb-4 last:border-0">
                <p className="font-semibold text-slate-900 mb-2">{faq.q}</p>
                <p className="text-sm text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400"
        >
          <span className="flex items-center gap-2">
            <ShieldIcon /> SSL Secured
          </span>
          <span>·</span>
          <span>Razorpay Protected</span>
          <span>·</span>
          <span>14-Day Refund</span>
        </motion.div>
      </div>
    </div>
  );
}
