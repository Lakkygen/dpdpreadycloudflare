/**
 * Build a structured report object from scan results.
 * Used by ReportViewer and PDF generation.
 *
 * @param {object} scan - scan result from API
 * @param {string} url - scanned URL
 * @returns {object} reportData
 */
export function buildReportData(scan, url) {
  const findings = (scan.issues || []).map((issue) => ({
    check: issue.title,
    status: issue.status,
    severity: issue.severity,
    description: issue.description,
    fix: issue.suggestedFix,
  }));

  const passedChecks = findings.filter((f) => f.status === 'passed').length;
  const failedChecks = findings.filter((f) => f.status === 'failed').length;

  const executiveSummary =
    failedChecks === 0
      ? `Great news! ${url} is fully compliant with India’s DPDP Act based on our scan. No issues were detected.`
      : `${url} has ${failedChecks} compliance issue${failedChecks > 1 ? 's' : ''} that need attention. The most critical areas involve ${getTopCriticalAreas(findings)}. Addressing these will bring your site into full compliance.`;

  return {
    url,
    generatedAt: new Date().toISOString(),
    overallScore: scan.overallScore ?? calculateOverallScore(scan.checks),
    executiveSummary,
    findings,
    actions: findings
      .filter((f) => f.status === 'failed')
      .map((f, i) => `${i + 1}. ${f.fix}`),
  };
}

function getTopCriticalAreas(findings) {
  const failed = findings.filter((f) => f.status === 'failed');
  if (failed.length === 0) return 'none';
  return failed
    .filter((f) => f.severity === 'critical')
    .map((f) => f.check.toLowerCase())
    .join(', ');
}

/**
 * Export report data as CSV string.
 * @param {object} reportData - from buildReportData()
 * @returns {string} CSV content
 */
export function exportToCSV(reportData) {
  const rows = [['Check', 'Status', 'Severity', 'Fix']];
  reportData.findings.forEach((f) =>
    rows.push([f.check, f.status, f.severity, `"${f.fix.replace(/"/g, '""')}"`])
  );
  return rows.map((row) => row.join(',')).join('\n');
}

/**
 * Export report data as JSON.
 */
export function exportToJSON(reportData) {
  return JSON.stringify(reportData, null, 2);
}
