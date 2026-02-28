/**
 * group-d-forecast.test.js
 * Group D — Forecast Engine 正式驗收測試
 *
 * M81 DoD #1: forecast engine 對 50 條向量的 trend 預測 ≥ 80% 準確
 *
 * 日期：2026-02-22
 * 設計：Node-01（Architect）
 */

'use strict';

const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

// Load harness and engine
const harness = require(path.join(__dirname, 'group-d-harness'));
const { computeTrend } = require(path.join(__dirname, '..', '..', 'src', 'forecast', 'forecast-engine'));

// Load vectors
const vectors = require(path.join(__dirname, '..', '..', 'conformance', 'forecast-inputs', 'gc-unified-bundle-v0.2.json'));

// ============================================================
// Test: Overall accuracy ≥ 80% (DoD)
// ============================================================

describe('Group D — Forecast Engine Validation', () => {

  let runResult;

  before(() => {
    runResult = harness.run(vectors, computeTrend);
  });

  it('should load all 50 vectors', () => {
    assert.equal(vectors.length, 50);
  });

  it('should have zero engine errors', () => {
    const errors = runResult.results.filter(r => r.error);
    assert.equal(runResult.summary.error, 0,
      `Engine errors: ${errors.map(r => r.vector_id + ': ' + r.error).join(', ')}`
    );
  });

  it('should achieve ≥ 80% overall accuracy (DoD)', () => {
    const accuracy = runResult.summary.pass / runResult.summary.total;
    assert.ok(accuracy >= 0.80,
      `Accuracy ${(accuracy * 100).toFixed(1)}% < 80% DoD threshold. ` +
      `Pass=${runResult.summary.pass}/${runResult.summary.total}`
    );
  });

  it('should achieve ≥ 80% macro-average across trend types', () => {
    const byTrend = {};
    for (const r of runResult.results) {
      if (!byTrend[r.expected_trend]) byTrend[r.expected_trend] = { pass: 0, total: 0 };
      byTrend[r.expected_trend].total++;
      if (r.matched) byTrend[r.expected_trend].pass++;
    }
    const accs = Object.values(byTrend).map(s => s.pass / s.total);
    const macroAvg = accs.reduce((a, b) => a + b, 0) / accs.length;
    assert.ok(macroAvg >= 0.80,
      `Macro-average ${(macroAvg * 100).toFixed(1)}% < 80%. ` +
      `Per-trend: ${Object.entries(byTrend).map(([t, s]) => `${t}=${(s.pass/s.total*100).toFixed(0)}%`).join(', ')}`
    );
  });
});

// ============================================================
// Test: Per-dimension accuracy
// ============================================================

describe('Group D — Per-Dimension Breakdown', () => {

  let runResult;

  before(() => {
    runResult = harness.run(vectors, computeTrend);
  });

  const dimensions = ['cross_cultural', 'temporal_accumulation', 'semantic_drift', 'hitl_boundary', 'canary_drift'];

  for (const dim of dimensions) {
    it(`should have ≥ 60% accuracy for dimension: ${dim}`, () => {
      const dimResults = runResult.results.filter(r => r.dimension === dim);
      const pass = dimResults.filter(r => r.matched).length;
      const accuracy = pass / dimResults.length;
      assert.ok(accuracy >= 0.60,
        `${dim}: ${(accuracy * 100).toFixed(0)}% < 60%. Pass=${pass}/${dimResults.length}`
      );
    });
  }
});

// ============================================================
// Test: Event generator sanity checks
// ============================================================

describe('Group D — Event Generator', () => {

  it('should generate ≥ 30 events for any vector', () => {
    for (const v of vectors) {
      const events = harness.generateEvents(v, 50);
      assert.ok(events.length >= 30,
        `${v.metadata.vector_id}: only ${events.length} events generated`
      );
    }
  });

  it('should generate events with valid timestamps', () => {
    const events = harness.generateEvents(vectors[0], 50);
    for (const e of events) {
      assert.ok(!isNaN(new Date(e.timestamp).getTime()),
        `Invalid timestamp: ${e.timestamp}`
      );
    }
  });

  it('should generate events with intensity in [0, 1]', () => {
    for (const v of vectors) {
      const events = harness.generateEvents(v, 50);
      for (const e of events) {
        assert.ok(e.intensity >= 0 && e.intensity <= 1,
          `${v.metadata.vector_id}: intensity ${e.intensity} out of range`
        );
      }
    }
  });

  it('should use a valid pattern for each vector', () => {
    const validPatterns = ['DM', 'FC', 'MB', 'EA', 'IP', 'GC', 'EP', 'CN', 'VS'];
    for (const v of vectors) {
      const events = harness.generateEvents(v, 50);
      assert.ok(validPatterns.includes(events[0].pattern),
        `${v.metadata.vector_id}: invalid pattern ${events[0].pattern}`
      );
    }
  });
});
