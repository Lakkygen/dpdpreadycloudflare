import { useState } from 'react';
import ScanForm from '../components/ScanForm';
import ScoreCard from '../components/ScoreCard';
import IssueCard from '../components/IssueCard';
import { useScan } from '../hooks/useScan';

export default function Scan() {
  const { scanState, result, progress } = useScan();

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Website Scanner</h1>
        <ScanForm />

        {scanState === 'scanning' && (
          <div className="mt-8 text-center">
            <div className="w-full bg-slate-800 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-4 text-slate-400">Scanning in progress... {progress}%</p>
          </div>
        )}

        {scanState === 'done' && result && (
          <div className="mt-12 space-y-8">
            <ScoreCard
              score={result.overallScore}
              previousScore={null}
              severityBreakdown={{
                critical: result.recommendations?.filter((i) => i.severity === 'critical').length || 0,
                warning: result.recommendations?.filter((i) => i.severity === 'high' || i.severity === 'medium').length || 0,
                passed: result.recommendations?.filter((i) => i.passed).length || 0,
                total: result.recommendations?.length || 0,
              }}
            />
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Findings</h2>
              {result.recommendations?.map((issue, idx) => (
                <IssueCard key={idx} issue={issue} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
