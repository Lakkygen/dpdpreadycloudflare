import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateComplianceScore } from '../../src/services/scoreCaculator.js';

test('calculateComplianceScore returns weighted score', () => {
  const score = calculateComplianceScore([
    { passed: true, weight: 2, score: 100 },
    { passed: false, weight: 1, score: 0 }
  ]);

  assert.equal(score, 67);
});
