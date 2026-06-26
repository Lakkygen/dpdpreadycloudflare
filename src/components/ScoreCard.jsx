import { motion } from 'framer-motion';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';

export default function ScoreCard({ score, previousScore, severityBreakdown }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const trend = previousScore ? score - previousScore : 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
      {/* Circular progress */}
      <div className="relative w-48 h-48">
        <svg className="transform -rotate-90" width="100%" height="100%">
          <circle
            cx="96"
            cy="96"
            r={radius}
            strokeWidth="12"
            stroke="#f1f5f9"
            fill="transparent"
          />
          <motion.circle
            cx="96"
            cy="96"
            r={radius}
            strokeWidth="12"
            stroke="url(#scoreGradient)"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold text-gray-900">{score}</span>
          <span className="text-sm text-gray-500">/100</span>
        </div>
      </div>

      {/* Trend indicator */}
      {previousScore && (
        <div className="mt-2 flex items-center space-x-1">
          {trend > 0 ? (
            <FiArrowUp className="text-green-500 w-5 h-5" />
          ) : trend < 0 ? (
            <FiArrowDown className="text-red-500 w-5 h-5" />
          ) : null}
          <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-400'}`}>
            {trend !== 0 ? `${Math.abs(trend)} pts` : 'No change'}
          </span>
        </div>
      )}

      {/* Severity breakdown */}
      {severityBreakdown && (
        <div className="mt-4 w-full grid grid-cols-3 gap-2">
          {['critical', 'warning', 'passed'].map((severity) => (
            <div key={severity} className="text-center">
              <div className={`w-full h-2 rounded-full ${
                severity === 'critical' ? 'bg-red-100' : severity === 'warning' ? 'bg-yellow-100' : 'bg-green-100'
              }`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(severityBreakdown[severity] / (severityBreakdown.total || 1)) * 100}%` }}
                  className={`h-full rounded-full ${
                    severity === 'critical' ? 'bg-red-500' : severity === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                />
              </div>
              <span className="text-xs text-gray-500 capitalize">{severity}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
