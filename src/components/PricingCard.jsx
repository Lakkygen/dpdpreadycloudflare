import { Link } from 'react-router-dom';
import { FiCheck, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

export default function PricingCard({ plan }) {
  const { user } = useAuth();
  const isPopular = plan.popular;

  return (
    <div
      className={`relative bg-white rounded-2xl shadow-lg border-2 transition-transform hover:-translate-y-1 ${
        isPopular ? 'border-blue-500 shadow-xl' : 'border-gray-200'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
          MOST POPULAR
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
        <p className="mt-1 text-gray-500 text-sm">{plan.description}</p>
        <div className="mt-4 flex items-baseline">
          <span className="text-4xl font-extrabold text-gray-900">₹{plan.price}</span>
          <span className="ml-1 text-gray-500 text-sm">/mo</span>
        </div>
        {plan.price === 0 && (
          <p className="mt-1 text-sm text-gray-500">Free forever</p>
        )}
        <ul className="mt-6 space-y-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start">
              <FiCheck className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <span className="ml-3 text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          {plan.price === 0 ? (
            <Link
              to="/register"
              className="block w-full py-3 text-center font-semibold text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
            >
              Get started free
            </Link>
          ) : user ? (
            <button
              onClick={() => {/* Stripe checkout logic */}}
              className="flex items-center justify-center w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md"
            >
              Subscribe now <FiArrowRight className="ml-2" />
            </button>
          ) : (
            <Link
              to={`/register?plan=${plan.id}`}
              className="flex items-center justify-center w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md"
            >
              Start free trial <FiArrowRight className="ml-2" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
