// test/contracts/integrity_hash.test.js
// Audit Log integrity_hash Contract Test — R2-02-v0.2c (Node-02 review)
// Owner: Node-04 (design) + Node-01 (test) + Node-02 (review)
//
// Validates that integrity_hash is correctly computed as
// SHA-256(audit_id + decision_code) and can be verified.

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const schema = require('../../schemas/audit-log-minimal.json');

// ============================================================
// Helper: compute integrity_hash per spec
// ============================================================
function computeIntegrityHash(audit_id, decision_code) {
  return crypto
    .createHash('sha256')
    .update(audit_id + decision_code)
    .digest('hex');
}

// ============================================================
// Sample data
// ============================================================
const SAMPLE_AUDIT_ID = '550e8400-e29b-41d4-a716-446655440000';
const SAMPLE_DECISION_CODE = 'REFUSE-SPEG-A';
const EXPECTED_HASH = computeIntegrityHash(SAMPLE_AUDIT_ID, SAMPLE_DECISION_CODE);

function buildValidAuditEntry(overrides = {}) {
  return {
    audit_id: SAMPLE_AUDIT_ID,
    timestamp: '2026-02-26T12:00:00Z',
    request_context: {
      requester_type: 'USER',
      verification_status: true,
      decision_code: SAMPLE_DECISION_CODE,
    },
    observation_snapshot: {
      acri_ref: 0.72,
      pattern_mask: 'A5',
      is_anonymized: true,
    },
    compliance: {
      retention_period: '90d',
      speg_gate_hit: true,
    },
    integrity_hash: EXPECTED_HASH,
    ...overrides,
  };
}

// ============================================================
// Tests
// ============================================================
describe('Audit Log integrity_hash contract', () => {

  // --- §1: Schema presence ---
  describe('§1: Schema requires integrity_hash', () => {
    it('integrity_hash is a required field', () => {
      assert.ok(schema.required.includes('integrity_hash'));
    });

    it('integrity_hash property is type string', () => {
      assert.strictEqual(schema.properties.integrity_hash.type, 'string');
    });
  });

  // --- §2: Computation correctness ---
  describe('§2: Hash computation', () => {
    it('SHA-256(audit_id + decision_code) is deterministic', () => {
      const h1 = computeIntegrityHash(SAMPLE_AUDIT_ID, SAMPLE_DECISION_CODE);
      const h2 = computeIntegrityHash(SAMPLE_AUDIT_ID, SAMPLE_DECISION_CODE);
      assert.strictEqual(h1, h2);
    });

    it('hash is 64-char hex (SHA-256)', () => {
      assert.strictEqual(EXPECTED_HASH.length, 64);
      assert.ok(/^[a-f0-9]{64}$/.test(EXPECTED_HASH));
    });

    it('different audit_id → different hash', () => {
      const hA = computeIntegrityHash('aaa-111', SAMPLE_DECISION_CODE);
      const hB = computeIntegrityHash('bbb-222', SAMPLE_DECISION_CODE);
      assert.notStrictEqual(hA, hB);
    });

    it('different decision_code → different hash', () => {
      const hA = computeIntegrityHash(SAMPLE_AUDIT_ID, 'REFUSE-SPEG-A');
      const hB = computeIntegrityHash(SAMPLE_AUDIT_ID, 'ALLOW-GENINFO');
      assert.notStrictEqual(hA, hB);
    });
  });

  // --- §3: Verification (tamper detection) ---
  describe('§3: Tamper detection', () => {
    it('valid entry passes verification', () => {
      const entry = buildValidAuditEntry();
      const recomputed = computeIntegrityHash(entry.audit_id, entry.request_context.decision_code);
      assert.strictEqual(entry.integrity_hash, recomputed);
    });

    it('tampered audit_id fails verification', () => {
      const entry = buildValidAuditEntry();
      entry.audit_id = 'TAMPERED-ID-000';
      const recomputed = computeIntegrityHash(entry.audit_id, entry.request_context.decision_code);
      assert.notStrictEqual(entry.integrity_hash, recomputed);
    });

    it('tampered decision_code fails verification', () => {
      const entry = buildValidAuditEntry();
      entry.request_context.decision_code = 'ALLOW-GENINFO';
      const recomputed = computeIntegrityHash(entry.audit_id, entry.request_context.decision_code);
      assert.notStrictEqual(entry.integrity_hash, recomputed);
    });
  });

  // --- §4: DM-HARD compliance ---
  describe('§4: DM-HARD rules in audit entry', () => {
    it('DM-HARD-01: no raw_text in audit entry', () => {
      const entry = buildValidAuditEntry();
      assert.ok(!JSON.stringify(entry).includes('raw_text'));
    });

    it('DM-HARD-01: is_anonymized must be true (schema const)', () => {
      assert.strictEqual(
        schema.properties.observation_snapshot.properties.is_anonymized.const,
        true
      );
    });

    it('DM-HARD-03: retention_period must be in allowed enum', () => {
      const allowed = schema.properties.compliance.properties.retention_period.enum;
      assert.ok(allowed.includes('90d'));
      assert.ok(allowed.includes('30d'));
      assert.ok(allowed.includes('7d'));
      assert.strictEqual(allowed.length, 3);
    });

    it('schema forbids additionalProperties at root', () => {
      assert.strictEqual(schema.additionalProperties, false);
    });
  });
});
