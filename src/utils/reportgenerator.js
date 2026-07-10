import { stripHtml } from './validators';

export function buildReportData(scan) {
  const results = scan.results_json || scan.recommendations || {};
  const issues = Array.isArray(results) ? results : (results.issues || []);
  const overallScore = scan.overall_score || scan.overallScore || 0;

  const severityBreakdown = {
    critical: issues.filter((i) => i.severity === 'critical').length,
    high: issues.filter((i) => i.severity === 'high').length,
    medium: issues.filter((i) => i.severity === 'medium').length,
    low: issues.filter((i) => i.severity === 'low').length,
    passed: issues.filter((i) => i.passed === true).length,
    total: issues.length,
  };

  const executiveSummary = generateExecutiveSummary(scan.url, overallScore, issues);
  const actions = generateActionPlan(issues);

  return {
    url: scan.url,
    overallScore,
    generatedAt: new Date().toISOString(),
    scanDate: scan.created_at || scan.crawledAt,
    executiveSummary,
    findings: issues.map((issue) => ({
      check: issue.title || issue.checkId || issue.label || 'Unknown Check',
      status: issue.passed ? 'passed' : 'failed',
      severity: issue.severity || 'medium',
      fix: issue.suggestedFix || issue.recommendation || 'Review and update privacy practices.',
      evidence: issue.evidence || '',
    })),
    actions,
    severityBreakdown,
  };
}

function generateExecutiveSummary(url, score, issues) {
  const failedCount = issues.filter((i) => !i.passed).length;
  const passedCount = issues.filter((i) => i.passed).length;

  let summary = `This DPDP compliance audit for ${url} resulted in an overall score of ${score}/100. `;

  if (score >= 80) {
    summary += `The website demonstrates strong privacy compliance practices with ${passedCount} checks passed. `;
  } else if (score >= 50) {
    summary += `The website shows moderate compliance with ${failedCount} areas requiring attention. `;
  } else {
    summary += `The website requires significant privacy compliance improvements with ${failedCount} critical issues identified. `;
  }

  summary += `Key focus areas include consent management, data retention policies, and user rights implementation.`;
  return summary;
}

function generateActionPlan(issues) {
  const failedIssues = issues.filter((i) => !i.passed);
  if (!failedIssues.length) return ['No action required. Maintain current privacy practices.'];

  return failedIssues.map((issue) => {
    const fix = issue.suggestedFix || issue.recommendation || 'Update privacy policy and implement required controls.';
    return `${issue.title || issue.checkId || issue.label}: ${fix}`;
  });
}
