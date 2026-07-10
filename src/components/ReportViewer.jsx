import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiPrinter, FiShare2 } from 'react-icons/fi';
import { useReports } from '../hooks/useReports';
import { buildReportData } from '../utils/reportGenerator';

export default function ReportViewer({ scanId }) {
  const { generate, pollUntilReady, download } = useReports();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      try {
        const reportId = await generate(scanId);
        if (reportId) {
          await pollUntilReady(reportId);
          setReportData({
            url: 'https://example.com',
            overallScore: 75,
            generatedAt: new Date().toISOString(),
            executiveSummary: 'This is a sample report summary.',
            findings: [
              { check: 'Consent Banner', status: 'failed', severity: 'high', fix: 'Add a cookie consent banner.' },
              { check: 'Privacy Policy', status: 'passed', severity: 'low', fix: 'No action needed.' },
            ],
            actions: ['Add cookie consent banner', 'Update privacy policy'],
          });
        }
      } catch (err) {
        console.error('Failed to load report:', err);
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [scanId, generate, pollUntilReady]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading report...</div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Report not available.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden"
    >
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

      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900">DPDP Compliance Audit</h1>
          <p className="mt-2 text-lg text-gray-500">{reportData.url}</p>
          <p className="text-sm text-gray-400">
            Generated on {new Date(reportData.generatedAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex justify-center my-8">
          <div className="w-32 h-32 rounded-full border-8 border-blue-500 flex items-center justify-center">
            <span className="text-3xl font-bold">{reportData.overallScore}</span>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Executive Summary</h2>
          <p className="text-gray-600">{reportData.executiveSummary}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Findings</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-sm font-semibold text-gray-700">Check</th>
                  <th className="p-3 text-sm font-semibold text-gray-700">Status</th>
                  <th className="p-3 text-sm font-semibold text-gray-700">Severity</th>
                  <th className="p-3 text-sm font-semibold text-gray-700">Fix</th>
                </tr>
              </thead>
              <tbody>
                {reportData.findings.map((finding, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="p-3 text-sm text-gray-900">{finding.check}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          finding.status === 'passed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {finding.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          finding.severity === 'critical'
                            ? 'bg-red-100 text-red-700'
                            : finding.severity === 'high'
                            ? 'bg-orange-100 text-orange-700'
                            : finding.severity === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {finding.severity}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-600">{finding.fix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Recommended Action Plan</h2>
          <ol className="list-decimal list-inside space-y-2">
            {reportData.actions.map((action, idx) => (
              <li key={idx} className="text-gray-600">{action}</li>
            ))}
          </ol>
        </div>
      </div>
    </motion.div>
  );
}
