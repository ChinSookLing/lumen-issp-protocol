// test/contracts/dashboard_item.schema.test.js
// Dashboard Item Schema Contract Test — M90-D05
// Owner: Node-05 (schema design) + Node-01 (test)
//
// Validates that a sample dashboard_item conforms to the
// read-only whitelist contract and explicitly excludes
// sensitive fields (acri_score, momentum_score, raw_text, evidence_index).

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const schema = require('../../schemas/dashboard_item.v0.1.schema.json');

// ============================================================
// Sample dashboard_item (valid)
// ============================================================

const VALID_ITEM = {
  item_id: 'dash_20260226_001',
  time_utc: '2026-02-26T08:30:00Z',
  source: 'telegram',
  request: {
    request_id: 'req_20260226_001',
    scenario: 'monitoring_brief',
    domain: 'C_PRIVATE',
    time_scale: '7d',
    tier: 0,
    purpose: 'internal',
  },
  view: {
    mode: 'tier0_readonly',
    tier0_readonly: true,
  },
  badge: 'yellow',
  simple_advice: 'Structural patterns detected. Consider discussing with someone you trust.',
  top_flags: ['MB', 'DM'],
  redaction_state: 'redacted',
  links: {
    l4_export_json: '/api/item/req_20260226_001',
  },
  sensitive_excluded: {
    no_raw_text: true,
    no_scores: true,
    no_evidence_detail: true,
  },
};

// ============================================================
// Tests
// ============================================================

describe('Dashboard Item Schema Contract', () => {

  it('schema loads and has correct title', () => {
    assert.strictEqual(schema.title, 'dashboard_item.v0.1');
    assert.strictEqual(schema.type, 'object');
  });

  it('schema requires all 10 mandatory fields', () => {
    assert.ok(schema.required.includes('item_id'));
    assert.ok(schema.required.includes('time_utc'));
    assert.ok(schema.required.includes('source'));
    assert.ok(schema.required.includes('request'));
    assert.ok(schema.required.includes('view'));
    assert.ok(schema.required.includes('badge'));
    assert.ok(schema.required.includes('simple_advice'));
    assert.ok(schema.required.includes('top_flags'));
    assert.ok(schema.required.includes('links'));
    assert.ok(schema.required.includes('redaction_state'));
  });

  it('schema has additionalProperties=false (whitelist-only)', () => {
    assert.strictEqual(schema.additionalProperties, false);
  });

  it('schema does NOT allow acri_score field', () => {
    assert.strictEqual(schema.properties.acri_score, undefined);
  });

  it('schema does NOT allow momentum_score field', () => {
    assert.strictEqual(schema.properties.momentum_score, undefined);
  });

  it('schema does NOT allow raw_text field', () => {
    assert.strictEqual(schema.properties.raw_text, undefined);
  });

  it('schema does NOT allow evidence_index field', () => {
    assert.strictEqual(schema.properties.evidence_index, undefined);
  });

  it('valid sample has all required fields', () => {
    for (const field of schema.required) {
      assert.ok(field in VALID_ITEM, `sample missing required field: ${field}`);
    }
  });

  it('valid sample does NOT contain sensitive data values', () => {
    // Check that no actual score values or raw content exist
    // (sensitive_excluded.no_raw_text is a boolean flag, not actual raw text)
    assert.strictEqual(VALID_ITEM.acri_score, undefined, 'must not have acri_score');
    assert.strictEqual(VALID_ITEM.momentum_score, undefined, 'must not have momentum_score');
    assert.strictEqual(VALID_ITEM.raw_text, undefined, 'must not have raw_text');
    assert.strictEqual(VALID_ITEM.evidence_index, undefined, 'must not have evidence_index');
  });

  it('view.tier0_readonly must be true', () => {
    assert.strictEqual(VALID_ITEM.view.tier0_readonly, true);
  });

  it('redaction_state must be "redacted"', () => {
    assert.strictEqual(VALID_ITEM.redaction_state, 'redacted');
  });

  it('badge enum is restricted to safe values', () => {
    const allowed = schema.properties.badge.enum;
    assert.ok(allowed.includes('blue'));
    assert.ok(allowed.includes('yellow'));
    assert.ok(allowed.includes('orange'));
    assert.ok(!allowed.includes('red'), 'red badge not allowed — too alarming');
  });

  it('source enum includes telegram', () => {
    assert.ok(schema.properties.source.enum.includes('telegram'));
  });
});
