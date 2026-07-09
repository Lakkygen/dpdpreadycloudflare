import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateScore, getSeverityWeight } from './scoreCalculator.js';

describe('scoreCalculator', () => {
  it('returns 0 for empty results', () => {
    assert.strictEqual(calculateScore([]), 0);
  });

  it('calculates weighted average correctly', () => {
    const results = [
      { weight: 50, score: 80 },
      { weight: 50, score: 60 },
    ];
    assert.strictEqual(calculateScore(results), 70);
  });

  it('handles passed boolean', () => {
    const results = [
      { weight: 100, passed: true },
      { weight: 100, passed: false },
    ];
    assert.strictEqual(calculateScore(results), 50);
  });

  it('returns correct severity weights', () => {
    assert.strictEqual(getSeverityWeight('critical'), 4);
    assert.strictEqual(getSeverityWeight('passed'), 0);
  });
});
