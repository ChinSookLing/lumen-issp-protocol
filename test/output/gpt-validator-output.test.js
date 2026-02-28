/**
 * gpt-validator-output.test.js
 * test:output — l4-export sample validation
 *
 * Validates the 3 existing l4-export samples (tier 0/1/2) against
 * the l4-export-v0.1 contract requirements.
 *
 * Original design: Node-05 (PDD Designer / Gatekeeper)
 * Implementation: Node-01 (Architect)
 * Date: 2026-02-25
 */

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

// Base required fields for all tiers (from l4-export-v0.1 schema)
const BASE_FIELDS = [
  'schema_version', 'export_id', 'created_at_utc', 'tier', 'scenario',
  'time_scale', 'engine_version', 'policy_version', 'schema_set',
  'evidence_refs', 'signals', 'contains_raw_text', 'disclaimer'
];

const SAMPLES = [
  { file: 'tests/fixtures/l4-export-tier0.sample.json', tier: 'TIER_0' },
  { file: 'tests/fixtures/l4-export-tier1.sample.json', tier: 'TIER_1' },
  { file: 'tests/fixtures/l4-export-tier2.sample.json', tier: 'TIER_2' }
];

describe('Node-05 Validator: test:output — l4-export samples', () => {

  it('V-O01: all 3 l4-export samples exist and are valid JSON', () => {
    for (const s of SAMPLES) {
      const fullPath = path.join(process.cwd(), s.file);
      assert.ok(fs.existsSync(fullPath), `${s.file} must exist`);
      const doc = readJson(fullPath);
      assert.equal(doc.schema_version, 'l4-export-v0.1');
    }
  });

  it('V-O02: all samples have base required fields', () => {
    for (const s of SAMPLES) {
      const doc = readJson(path.join(process.cwd(), s.file));
      for (const field of BASE_FIELDS) {
        assert.ok(field in doc, `${s.file} missing field: ${field}`);
      }
    }
  });

  it('V-O03: evidence_refs is non-empty array of strings', () => {
    for (const s of SAMPLES) {
      const doc = readJson(path.join(process.cwd(), s.file));
      assert.ok(Array.isArray(doc.evidence_refs), `${s.file}: evidence_refs must be array`);
      assert.ok(doc.evidence_refs.length > 0, `${s.file}: evidence_refs must not be empty`);
      for (const ref of doc.evidence_refs) {
        assert.equal(typeof ref, 'string', `${s.file}: each evidence_ref must be string`);
      }
    }
  });

  it('V-O04: TIER_0 must not contain raw text', () => {
    const doc = readJson(path.join(process.cwd(), SAMPLES[0].file));
    assert.equal(doc.tier, 'TIER_0');
    assert.equal(doc.contains_raw_text, false, 'TIER_0 must not contain raw text');
  });

  it('V-O05: TIER_1 has hitl_trigger + redaction + access_log_ref', () => {
    const doc = readJson(path.join(process.cwd(), SAMPLES[1].file));
    assert.equal(doc.tier, 'TIER_1');
    assert.equal(doc.hitl_trigger, true);
    assert.equal(doc.redaction_passed, true);
    assert.equal(doc.pii_redaction_applied, true);
    assert.ok(doc.access_log_ref, 'TIER_1 must have access_log_ref');
  });

  it('V-O06: TIER_2 has encryption + ttl_days + council_authorization_ref', () => {
    const doc = readJson(path.join(process.cwd(), SAMPLES[2].file));
    assert.equal(doc.tier, 'TIER_2');
    assert.ok(doc.encryption?.enabled === true, 'TIER_2 must have encryption.enabled=true');
    assert.ok(Number.isInteger(doc.ttl_days) && doc.ttl_days >= 1, 'TIER_2 must have ttl_days >= 1');
    assert.ok(doc.access_log_ref, 'TIER_2 must have access_log_ref');
    assert.ok(doc.council_authorization_ref, 'TIER_2 must have council_authorization_ref');
  });

  it('V-O07: signals structure is consistent across tiers', () => {
    for (const s of SAMPLES) {
      const doc = readJson(path.join(process.cwd(), s.file));
      const sig = doc.signals;
      assert.ok(sig, `${s.file}: signals must exist`);
      assert.ok('acri_band' in sig, `${s.file}: signals must have acri_band`);
      assert.ok('acri_value' in sig, `${s.file}: signals must have acri_value`);
      assert.equal(typeof sig.acri_value, 'number', `${s.file}: acri_value must be number`);
    }
  });
});
