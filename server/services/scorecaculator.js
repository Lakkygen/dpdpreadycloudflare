export function calculateComplianceScore(checkResults = []) {
  if (!Array.isArray(checkResults) || checkResults.length === 0) return 0;

  const totals = checkResults.reduce(
    (acc, item) => {
      const weight = Number(item.weight ?? 1);
      const score =
        typeof item.score === 'number'
          ? item.score
          : item.passed === false
            ? 0
            : item.passed === true
              ? 100
              : 0;

      acc.weight += weight > 0 ? weight : 1;
      acc.points += (weight > 0 ? weight : 1) * Math.max(0, Math.min(100, score));
      return acc;
    },
    { weight: 0, points: 0 }
  );

  if (!totals.weight) return 0;
  return Math.round(totals.points / totals.weight);
}

export function scoreLabel(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Strong';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Weak';
  return 'Poor';
}

export function scoreBand(score) {
  if (score >= 90) return 'green';
  if (score >= 75) return 'blue';
  if (score >= 60) return 'yellow';
  if (score >= 40) return 'orange';
  return 'red';
}

export function normalizeCheckResults(checkResults = []) {
  return (Array.isArray(checkResults) ? checkResults : []).map((item) => ({
    ...item,
    weight: Number(item.weight ?? 1),
    score:
      typeof item.score === 'number'
        ? Math.max(0, Math.min(100, item.score))
        : item.passed === false
          ? 0
          : 100
  }));
}

export default {
  calculateComplianceScore,
  scoreLabel,
  scoreBand,
  normalizeCheckResults
};
