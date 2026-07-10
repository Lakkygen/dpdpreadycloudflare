import PricingCard from '../components/PricingCard';
import { PLANS } from '../utils/constants';

export default function Pricing() {
  return (
    <div className="min-h-screen bg-slate-950 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white">Pricing</h1>
          <p className="mt-4 text-lg text-slate-400">
            Choose the plan that fits your compliance needs.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.values(PLANS).map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>
      </div>
    </div>
  );
}
