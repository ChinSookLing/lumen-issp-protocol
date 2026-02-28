// test/forecast/confidence-rules.test.js
// Author: Node-03 (AI Council Validator / Schema Architect)
// Tests for R² confidence split — rule-based confidence

const { test } = require('node:test');
const assert = require('node:assert');
const { computeConfidence } = require('../../src/forecast/confidence-rules');

test('Triple hit, high consistency → high', () => {
  assert.strictEqual(computeConfidence({
    hitCount: 3,
    componentScores: [0.8, 0.75, 0.85],
    boosterHit: false
  }), 'high');
});

test('Double hit, moderate consistency → medium', () => {
  assert.strictEqual(computeConfidence({
    hitCount: 2,
    componentScores: [0.5, 0.6],
    boosterHit: false
  }), 'medium');
});

test('Single hit, low → low', () => {
  assert.strictEqual(computeConfidence({
    hitCount: 1,
    componentScores: [0.4],
    boosterHit: false
  }), 'low');
});

test('Booster only → low', () => {
  assert.strictEqual(computeConfidence({
    hitCount: 0,
    componentScores: [],
    boosterHit: true
  }), 'low');
});

test('Triple hit but inconsistent → low', () => {
  assert.strictEqual(computeConfidence({
    hitCount: 3,
    componentScores: [0.9, 0.3, 0.2],
    boosterHit: false
  }), 'low');
});
