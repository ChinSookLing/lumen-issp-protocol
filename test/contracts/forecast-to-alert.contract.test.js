/**
 * forecast-to-alert.contract.test.js
 * 驗證 L3→L4 contract schema 合規
 *
 * Node-05 設計 / Node-01 實作
 * 2026-02-18
 */
'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { aggregateToContract } = require('../../src/pipeline/adapters/from-forecast');

// Load schema
const schemaPath = path.join(__dirname, '../../contracts/forecast-to-alert.v1.schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

// Simple schema validator (no external deps)
function validateContract(payload) {
  const errors = [];

  // Check required fields
  for (const field of schema.required) {
    if (!(field in payload)) {
      errors.push(`missing required field: ${field}`);
    }
  }

  // Type checks
  if (typeof payload.time_utc !== 'string') errors.push('time_utc must be string');
  if (typeof payload.chat_id !== 'string') errors.push('chat_id must be string');

  // Window checks
  if (payload.window) {
    if (typeof payload.window.from_utc !== 'string') errors.push('window.from_utc must be string');
    if (typeof payload.window.to_utc !== 'string') errors.push('window.to_utc must be string');
    if (![7, 30, 90].includes(payload.window.size)) errors.push('window.size must be 7/30/90');
  }

  // Forecast checks
  if (payload.forecast) {
    const f = payload.forecast;
    if (!['rising', 'stable', 'declining'].includes(f.trend)) errors.push('forecast.trend invalid');
    if (typeof f.intensity !== 'number' || f.intensity < 0 || f.intensity > 1) errors.push('forecast.intensity out of range');
    if (typeof f.gate_hit !== 'number') errors.push('forecast.gate_hit must be number');
    if (!Array.isArray(f.top_patterns)) errors.push('forecast.top_patterns must be array');
  }

  // Evidence + fingerprint
  if (!Array.isArray(payload.evidence_ids)) errors.push('evidence_ids must be array');
  if (payload.build_fingerprint) {
    const b = payload.build_fingerprint;
    if (typeof b.build_id !== 'string') errors.push('build_fingerprint.build_id must be string');
    if (typeof b.commit_hash !== 'string') errors.push('build_fingerprint.commit_hash must be string');
    if (!['live', 'test', 'audit'].includes(b.operator_mode)) errors.push('operator_mode invalid');
  }

  // No additional properties
  const allowed = Object.keys(schema.properties);
  for (const key of Object.keys(payload)) {
    if (!allowed.includes(key)) errors.push(`unexpected field: ${key}`);
  }

  return errors;
}

// ============================================================
// Test fixture: minimal valid aggregate from runForecast
// ============================================================
function makeAggregate(overrides = {}) {
  return {
    aggregate_id: 'agg_test_001',
    timestamp: '2026-02-18T12:00:00.000Z',
    window_days: 7,
    target_pattern: 'MB',
    data_points: 35,
    event_refs: ['evt_001', 'evt_002', 'evt_003'],
    forecast: {
      trendBand: 'rising',
      avg_intensity: 0.65,
      gate_hit: 2,
      slope: 0.04,
      probability: 0.8,
      confidence: 0.8,
      aligned_examples: []
    },
    ...overrides
  };
}

// ============================================================
// Tests
// ============================================================

describe('forecast-to-alert contract v1', () => {

  it('aggregateToContract produces valid contract payload', () => {
    const agg = makeAggregate();
    const contract = aggregateToContract(agg, {
      chatId: 'test-chat-001',
      commitHash: 'abc1234',
      operatorMode: 'test'
    });

    const errors = validateContract(contract);
    assert.deepStrictEqual(errors, [], `Contract validation failed: ${errors.join(', ')}`);
  });

  it('contract has all 6 required fields', () => {
    const contract = aggregateToContract(makeAggregate(), { chatId: 'c1' });
    for (const field of ['time_utc', 'chat_id', 'window', 'forecast', 'evidence_ids', 'build_fingerprint']) {
      assert.ok(field in contract, `missing: ${field}`);
    }
  });

  it('forecast.trend maps from trendBand', () => {
    const contract = aggregateToContract(makeAggregate({ forecast: { trendBand: 'declining', avg_intensity: 0.3, gate_hit: 1 } }));
    assert.equal(contract.forecast.trend, 'declining');
  });

  it('evidence_ids pass through from event_refs', () => {
    const agg = makeAggregate({ event_refs: ['e1', 'e2', 'e3', 'e4'] });
    const contract = aggregateToContract(agg);
    assert.deepStrictEqual(contract.evidence_ids, ['e1', 'e2', 'e3', 'e4']);
  });

  it('throws on null aggregate', () => {
    assert.throws(() => aggregateToContract(null), /aggregate is null/);
  });

  it('window.size matches aggregate window_days', () => {
    const contract = aggregateToContract(makeAggregate({ window_days: 30 }));
    assert.equal(contract.window.size, 30);
  });

});
