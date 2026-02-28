// test/explanation/safe-mode.test.js
// Explanation-engine SAFE mode tests — M88 V1 6/6
// Tests for all 5 Hard Limits (HL-1 through HL-5)

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  SAFE_MODE,
  generateSafeExplanation,
  extractAuditableSignals,
  buildSignalExplanation,
  buildMinimalExplanation,
  deidentifyExplanation,
  containsSurveillanceGuidance,
  validateSafeCompliance,
  AUDITABLE_FIELDS,
} = require('../../src/explanation/safe-mode');

// --- Test fixtures ---

const MOCK_DETECTION = {
  pattern: 'DM',
  acri: 0.72,
  vri: 0.65,
  confidence: 0.68,
  gate_result: 2,
  window: { turns: 5, span_ms: 30000 },
  vectors: ['v1', 'v2', 'v3'],
  momentum: 0.45,
  trend: 'rising',
  // Non-auditable fields (should be excluded)
  raw_text: 'This is raw user text that should NEVER appear',
  user_id: 'user_12345',
  group_name: 'Private Family Chat',
};

const MOCK_DETECTION_LOW = {
  pattern: 'VS',
  confidence: 0.25,
  gate_result: 1,
};

// === SAFE MODE STATUS ===

describe('SAFE mode status', () => {
  it('SAFE mode is ON (M88 V1 6/6)', () => {
    assert.strictEqual(SAFE_MODE, true);
  });
});

// === HL-1: Only auditable signals ===

describe('HL-1: Only auditable signals', () => {
  it('extracts only AUDITABLE_FIELDS from detection', () => {
    const signals = extractAuditableSignals(MOCK_DETECTION);
    assert.ok(signals.pattern);
    assert.ok(signals.acri !== undefined);
    assert.ok(signals.confidence !== undefined);
    // Must NOT contain raw text or PII
    assert.strictEqual(signals.raw_text, undefined);
    assert.strictEqual(signals.user_id, undefined);
    assert.strictEqual(signals.group_name, undefined);
  });

  it('explanation does not contain raw user text', () => {
    const result = generateSafeExplanation(MOCK_DETECTION);
    assert.ok(!result.explanation.includes('This is raw user text'));
    assert.ok(!result.explanation.includes('user_12345'));
    assert.ok(!result.explanation.includes('Private Family Chat'));
  });

  it('explanation references only signal fields', () => {
    const result = generateSafeExplanation(MOCK_DETECTION);
    // Should contain pattern type and scores
    assert.ok(result.explanation.includes('DM') || result.explanation.includes('Pattern'));
  });

  it('AUDITABLE_FIELDS list is comprehensive', () => {
    assert.ok(AUDITABLE_FIELDS.includes('pattern'));
    assert.ok(AUDITABLE_FIELDS.includes('acri'));
    assert.ok(AUDITABLE_FIELDS.includes('confidence'));
    assert.ok(AUDITABLE_FIELDS.includes('gate_result'));
    assert.ok(AUDITABLE_FIELDS.includes('vectors'));
    assert.ok(AUDITABLE_FIELDS.includes('momentum'));
    // Must NOT include PII-adjacent fields
    assert.ok(!AUDITABLE_FIELDS.includes('raw_text'));
    assert.ok(!AUDITABLE_FIELDS.includes('user_id'));
    assert.ok(!AUDITABLE_FIELDS.includes('group_name'));
  });
});

// === HL-2: Hypothesis marker ===

describe('HL-2: Hypothesis marker [假設生成 — 低信心]', () => {
  it('always attaches hypothesis marker', () => {
    const result = generateSafeExplanation(MOCK_DETECTION);
    assert.ok(result.markers.includes('[假設生成 — 低信心]'));
  });

  it('attaches marker even for high-confidence detection', () => {
    const highConf = { ...MOCK_DETECTION, confidence: 0.95 };
    const result = generateSafeExplanation(highConf);
    assert.ok(result.markers.includes('[假設生成 — 低信心]'));
  });

  it('attaches marker for minimal detection', () => {
    const result = generateSafeExplanation(MOCK_DETECTION_LOW);
    assert.ok(result.markers.includes('[假設生成 — 低信心]'));
  });

  it('compliance check fails without marker', () => {
    const fakeResult = { explanation: 'test', markers: [], purpose: 'internal' };
    const check = validateSafeCompliance(fakeResult);
    assert.strictEqual(check.valid, false);
    assert.ok(check.violations.some((v) => v.rule === 'HL-2'));
  });
});

// === HL-3: Lint violations → HITL/downgrade ===

describe('HL-3: Lint violations → HITL or downgrade', () => {
  it('result includes lint violations array', () => {
    const result = generateSafeExplanation(MOCK_DETECTION);
    assert.ok(Array.isArray(result.violations));
  });

  it('downgraded flag is boolean', () => {
    const result = generateSafeExplanation(MOCK_DETECTION);
    assert.strictEqual(typeof result.downgraded, 'boolean');
  });

  it('minimal explanation is safe when downgraded', () => {
    const minimal = buildMinimalExplanation({ pattern: 'MB', confidence: 0.5 });
    assert.ok(minimal.includes('MB'));
    assert.ok(minimal.includes('HITL'));
    assert.ok(!minimal.includes('raw'));
  });
});

// === HL-4: purpose=share → de-identified ===

describe('HL-4: purpose=share → shorter, neutral, de-identified', () => {
  it('share mode produces de-identified explanation', () => {
    const result = generateSafeExplanation(MOCK_DETECTION, { purpose: 'share' });
    assert.ok(result.markers.some((m) => m.includes('share-mode')));
    // De-identified: should NOT contain exact ACRI score
    assert.ok(!result.explanation.includes('0.72'));
    // Should contain pattern type but with neutral framing
    assert.ok(result.explanation.includes('DM'));
    assert.ok(result.explanation.includes('observation'));
  });

  it('share mode uses confidence bands not exact scores', () => {
    const result = generateSafeExplanation(MOCK_DETECTION, { purpose: 'share' });
    // 0.68 → "elevated" band
    assert.ok(
      result.explanation.includes('elevated') ||
      result.explanation.includes('moderate') ||
      result.explanation.includes('low')
    );
  });

  it('share mode adds disclaimer', () => {
    const result = generateSafeExplanation(MOCK_DETECTION, { purpose: 'share' });
    assert.ok(result.explanation.includes('not a diagnosis'));
  });

  it('internal mode keeps full signal detail', () => {
    const result = generateSafeExplanation(MOCK_DETECTION, { purpose: 'internal' });
    assert.ok(!result.markers.some((m) => m.includes('share-mode')));
    // Internal: may contain exact scores
    assert.ok(result.explanation.includes('0.72') || result.explanation.includes('ACRI'));
  });

  it('compliance check fails for share without de-id marker', () => {
    const fakeResult = {
      explanation: 'test',
      markers: ['[假設生成 — 低信心]'],
      purpose: 'share',
    };
    const check = validateSafeCompliance(fakeResult);
    assert.strictEqual(check.valid, false);
    assert.ok(check.violations.some((v) => v.rule === 'HL-4'));
  });
});

// === HL-5: No surveillance guidance ===

describe('HL-5: No operational surveillance guidance', () => {
  it('detects "monitor user" as surveillance', () => {
    assert.ok(containsSurveillanceGuidance('You should monitor this user closely'));
  });

  it('detects "track person" as surveillance', () => {
    assert.ok(containsSurveillanceGuidance('Track this person\'s messages'));
  });

  it('detects "set up alert when they say" as surveillance', () => {
    assert.ok(containsSurveillanceGuidance('Set up an alert when they say certain words'));
  });

  it('detects "flag to authority" as surveillance', () => {
    assert.ok(containsSurveillanceGuidance('Flag this to the authority for review'));
  });

  it('detects "deploy detection scanning" as surveillance', () => {
    assert.ok(containsSurveillanceGuidance('Deploy detection scanning on all channels'));
  });

  it('does NOT flag normal signal explanation', () => {
    assert.ok(!containsSurveillanceGuidance('Pattern: DM | ACRI: 0.72 | Confidence: 0.68'));
  });

  it('does NOT flag pattern description', () => {
    assert.ok(!containsSurveillanceGuidance('Communication pattern noted (DM, elevated signal)'));
  });

  it('blocks surveillance guidance in generated explanation', () => {
    // Force a detection that might generate surveillance-like text
    const result = generateSafeExplanation(MOCK_DETECTION);
    assert.ok(!containsSurveillanceGuidance(result.explanation));
  });

  it('compliance check catches surveillance in output', () => {
    const fakeResult = {
      explanation: 'Monitor this user and report to HR',
      markers: ['[假設生成 — 低信心]'],
      purpose: 'internal',
    };
    const check = validateSafeCompliance(fakeResult);
    assert.strictEqual(check.valid, false);
    assert.ok(check.violations.some((v) => v.rule === 'HL-5'));
  });
});

// === Integration: Full pipeline ===

describe('SAFE mode integration', () => {
  it('full pipeline returns complete result structure', () => {
    const result = generateSafeExplanation(MOCK_DETECTION);
    assert.ok(result.explanation);
    assert.ok(Array.isArray(result.markers));
    assert.ok(Array.isArray(result.violations));
    assert.strictEqual(typeof result.downgraded, 'boolean');
    assert.strictEqual(result.safe_mode, true);
    assert.strictEqual(result.purpose, 'internal');
  });

  it('share pipeline returns complete result structure', () => {
    const result = generateSafeExplanation(MOCK_DETECTION, { purpose: 'share' });
    assert.strictEqual(result.purpose, 'share');
    assert.strictEqual(result.safe_mode, true);
    assert.ok(result.markers.length >= 2); // hypothesis + share-mode
  });

  it('empty detection produces safe fallback', () => {
    const result = generateSafeExplanation({});
    assert.ok(result.explanation);
    assert.ok(result.markers.includes('[假設生成 — 低信心]'));
  });

  it('validates own output passes compliance', () => {
    const result = generateSafeExplanation(MOCK_DETECTION);
    const check = validateSafeCompliance(result);
    assert.strictEqual(check.valid, true);
    assert.strictEqual(check.violations.length, 0);
  });

  it('validates share output passes compliance', () => {
    const result = generateSafeExplanation(MOCK_DETECTION, { purpose: 'share' });
    const check = validateSafeCompliance(result);
    assert.strictEqual(check.valid, true);
  });
});
