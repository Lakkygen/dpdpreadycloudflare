import { calculateComplianceScore, scoreLabel } from './scoreCaculator.js';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function summarizeBySeverity(findings = []) {
  return findings.reduce(
    (acc, item) => {
      const severity = (item.severity || 'medium').toLowerCase();
      if (severity in acc) acc[severity] += 1;
      else acc.medium += 1;
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0 }
  );
}

export function buildReportData(scanResult = {}) {
  const findings = asArray(scanResult.issues || scanResult.findings || scanResult.results);
  const checks = asArray(scanResult.heuristicResults || scanResult.checks || findings);

  const overallScore =
    typeof scanResult.overallScore === 'number'
      ? scanResult.overallScore
      : calculateComplianceScore(checks);

  const summary = {
    score: overallScore,
    label: scoreLabel(overallScore),
    confidence:
      typeof scanResult.confidence === 'number' ? scanResult.confidence : 0.5,
    issuesCount: findings.length,
    severityBreakdown: summarizeBySeverity(findings)
  };

  const recommendations = findings
    .filter((item) => item.passed === false || item.status === 'failed')
    .slice(0, 10)
    .map((item) => ({
      title: item.title || item.label || 'Action required',
      detail: item.suggestedFix || item.description || 'Review manually.',
      severity: item.severity || 'medium'
    }));

  return {
    website: scanResult.finalUrl || scanResult.url || '',
    scannedAt: scanResult.scannedAt || new Date().toISOString(),
    title: scanResult.title || '',
    summary,
    findings,
    recommendations,
    raw: scanResult
  };
}

export function generateReportFilename(scanResult = {}) {
  const hostname = (() => {
    try {
      return new URL(scanResult.finalUrl || scanResult.url || 'https://example.com').hostname;
    } catch {
      return 'dpdpready-report';
    }
  })();

  const safeHost = hostname.replace(/[^a-z0-9.-]/gi, '_');
  const date = new Date().toISOString().slice(0, 10);
  return `${safeHost}-dpdp-report-${date}.json`;
}

export function buildTextSummary(scanResult = {}) {
  const data = buildReportData(scanResult);

  return [
    `Website: ${data.website}`,
    `Score: ${data.summary.score} (${data.summary.label})`,
    `Findings: ${data.summary.issuesCount}`,
    `Critical: ${data.summary.severityBreakdown.critical}`,
    `High: ${data.summary.severityBreakdown.high}`,
    `Medium: ${data.summary.severityBreakdown.medium}`,
    `Low: ${data.summary.severityBreakdown.low}`
  ].join('\n');
}

export default {
  buildReportData,
  generateReportFilename,
  buildTextSummary
};
