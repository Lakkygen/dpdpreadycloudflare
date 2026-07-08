/**
 * DPDP Act compliance scoring model.
 *
 * Checks:
 * 1. Consent banner presence & functionality
 * 2. Cookie consent mechanism (opt-in)
 * 3. Data retention policy clarity
 * 4. Third-party data sharing disclosure
 * 5. Privacy policy completeness
 * 6. User rights (access, erasure, portability)
 *
 * Each check yields a score 0-100.
 * Weights total 100%.
 * Final score = Σ (checkScore × weight) - severity penalties
 */

const weights = {
  consentBanner: 25,
  cookieConsent: 20,
  dataRetention: 15,
  thirdPartySharing: 15,
  privacyPolicy: 15,
  userRights: 10,
};

const severityPenalty = {
  critical: 10,
  warning: 5,
  info: 0,
};

/**
 * Calculate the overall compliance score from a set of check results.
 * @param {Array} checks - Array of { checkId, score, status, severity? }
 * @returns {number} overall score (0-100)
 */
export function calculateOverallScore(checks) {
  if (!checks || checks.length === 0) return 0;

  let weightedSum = 0;
  let penalty = 0;

  for (const check of checks) {
    const weight = weights[check.checkId] || 0;
    const score = Math.min(100, Math.max(0, check.score || 0));
    weightedSum += (score / 100) * weight;

    if (check.status === 'failed' && check.severity) {
      penalty += severityPenalty[check.severity] || 0;
    }
  }

  const rawScore = weightedSum; // already scaled to 0-100 because weights sum to 100
  const finalScore = Math.round(Math.max(0, rawScore - penalty));
  return Math.min(100, finalScore);
}

/**
 * Compute a trend indicator based on previous vs current score.
 * @param {number} current - current score
 * @param {number} previous - previous score
 * @returns {string} 'up' | 'down' | 'stable'
 */
export function computeTrend(current, previous) {
  if (previous == null) return 'stable';
  const diff = current - previous;
  if (diff > 2) return 'up';
  if (diff < -2) return 'down';
  return 'stable';
}
