import { motion } from 'framer-motion';
import { FiDownload, FiPrinter, FiShare2 } from 'react-icons/fi';

export default function ReportViewer({ reportData }) {
  // This renders a styled HTML document, ready for print / export.
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden"
    >
      {/* Toolbar */}
      <div className="border-b border-gray-100 px-6 py-3 flex items-center justify-between bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">Compliance Report</h2>
        <div className="flex space-x-2">
          <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
            <FiPrinter className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
            <FiDownload className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
            <FiShare2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Report body */}
      <div className="p-8 max-w-4xl mx-auto">
        {/* Cover */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900">DPDP Compliance Audit</h1>
          <p className="mt-2 text-lg text-gray-500">{reportData.url}</p>
          <p className="text-sm text-gray-400">Generated on {new Date(reportData.generatedAt).toLocaleDateString()}</p>
        </div>

        {/* Score */}
        <div className="flex justify-center my-8">
          <div className="w-32 h-32 rounded-full border-8 border-blue-500 flex items-center justify-center">
            <span className="text-3xl font-bold">{reportData.overallScore}</span>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Executive Summary</h2>
          <p className="text-gray-600">{reportData.executiveSummary}</p>
        </div>

        {/* Findings table */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Findings</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Check</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Status</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Severity</th>
                </tr>
              </thead>
              <tbody>
                {reportData.findings.map((finding, idx) => (
                  <tr key={idx} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-gray-800">{finding.check}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        finding.status === 'passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {finding.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 capitalize">{finding.severity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action plan */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Recommended Actions</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            {reportData.actions.map((action, idx) => (
              <li key={idx}>{action}</li>
            ))}
          </ol>
        </div>
      </div>
    </motion.div>
  );
}
