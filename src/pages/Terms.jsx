export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-950 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-slate-300">
            By accessing or using DPDPready, you agree to be bound by these Terms of Service.
          </p>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Use of Service</h2>
          <p className="text-slate-300">
            DPDPready provides automated privacy compliance scanning tools. The reports generated are for
            informational purposes only and do not constitute legal advice.
          </p>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Disclaimer</h2>
          <p className="text-slate-300">
            While we strive for accuracy, DPDPready makes no warranties about the completeness or reliability
            of scan results. Always consult with a qualified legal professional for DPDP compliance matters.
          </p>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Limitation of Liability</h2>
          <p className="text-slate-300">
            DPDPready shall not be liable for any indirect, incidental, or consequential damages arising from
            your use of the service.
          </p>
        </div>
      </div>
    </div>
  );
}
