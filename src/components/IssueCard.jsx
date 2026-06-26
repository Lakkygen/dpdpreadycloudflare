import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiCopy, FiCheck, FiAlertTriangle, FiInfo } from 'react-icons/fi';
import { toast } from 'react-toastify';

const severityConfig = {
  critical: { color: 'bg-red-100 text-red-800 border-red-200', icon: FiAlertTriangle },
  warning: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: FiAlertTriangle },
  info: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: FiInfo },
};

export default function IssueCard({ issue }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const SeverityIcon = severityConfig[issue.severity]?.icon || FiInfo;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Fix suggestion copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      layout
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${severityConfig[issue.severity].color}`}>
            <SeverityIcon className="w-3.5 h-3.5 mr-1" />
            {issue.severity}
          </span>
          <h3 className="text-base font-semibold text-gray-900">{issue.title}</h3>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <FiChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-6 pb-4"
          >
            <p className="text-gray-600 text-sm mb-3">{issue.description}</p>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-500 uppercase">AI‑suggested fix</span>
                <button
                  onClick={() => handleCopy(issue.suggestedFix)}
                  className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                >
                  {copied ? <FiCheck className="w-3.5 h-3.5 mr-1" /> : <FiCopy className="w-3.5 h-3.5 mr-1" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-sm text-gray-800">{issue.suggestedFix}</p>
            </div>
            {issue.learnMore && (
              <a
                href={issue.learnMore}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center text-sm text-blue-600 hover:underline"
              >
                Learn more about this issue →
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
