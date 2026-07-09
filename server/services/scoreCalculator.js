import { clampNumber } from '../utils/validators.js';

export function calculateScore(results = []) {
  if (!Array.isArray(results) || results.length === 0) return 0;

  const weighted = results.reduce(
    (acc, result) => {
      const weight = Number(result.weight ?? 0);
      const score =
        typeof result.score === 'number'
          ? clampNumber(result.score, 0, 100)
          : result.passed === false
            ? 0
            : 100;

      acc.totalWeight += weight > 0 ? weight : 1;
      acc.totalPoints += (weight > 0 ? weight : 1) * score;
      return acc;
    },
    { totalWeight: 0, totalPoints: 0 }
  );

  if (!weighted.totalWeight) return 0;
  return Math.round(weighted.totalPoints / weighted.totalWeight);
}

export function getSeverityWeight(severity) {
  const weights = { critical: 4, high: 3, medium: 2, low: 1, passed: 0 };
  return weights[severity] || 0;
}
