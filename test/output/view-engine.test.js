// test/output/view-engine.test.js
// L4-close-02: View Integration Tests
// Tests stripFields + applyView for all 3 views

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  stripFields,
  applyView,
  getAvailableViews,
  isValidView,
  ALWAYS_STRIP,
} = require('../../src/output/view-engine');

// Mock pipeline output (resembles real pipeline().output)
const mockOutput = {
  alert: {
    effective_level: 3,
    pattern: 'MB',
    channels: {
      push: { score: 0.65, level: 3 },
      vacuum: { score: 0, level: 1 },
    },
    requires_handoff: false,
    requires_alert: true,
  },
  explanation: {
    explanation: 'Pattern: MB | ACRI: 0.65',
    markers: ['[假設生成 — 低信心]'],
    safe_mode: true,
  },
};

const silentOutput = {
  alert: {
    effective_level: 1,
    pattern: null,
    channels: {
      push: { score: 0, level: 1 },
      vacuum: { score: 0, level: 1 },
    },
    requires_handoff: false,
  },
};

// ============================================================
// stripFields
// ============================================================
describe('stripFields', () => {
  it('removes denied fields', () => {
    const data = { a: 1, b: 2, c: 3 };
    const result = stripFields(data, ['b']);
    assert.deepStrictEqual(result, { a: 1, c: 3 });
  });

  it('accepts Set as deny list', () => {
    const data = { a: 1, b: 2, c: 3 };
    const result = stripFields(data, new Set(['a', 'c']));
    assert.deepStrictEqual(result, { b: 2 });
  });

  it('always strips ALWAYS_STRIP fields', () => {
    const data = { a: 1, raw_text: 'secret', plain_text_payload: 'also secret' };
    const result = stripFields(data, []);
    assert.strictEqual(result.a, 1);
    assert.strictEqual(result.raw_text, undefined);
    assert.strictEqual(result.plain_text_payload, undefined);
  });

  it('handles null/undefined gracefully', () => {
    assert.strictEqual(stripFields(null, []), null);
    assert.strictEqual(stripFields(undefined, []), undefined);
  });

  it('returns empty object for all-denied', () => {
    const data = { a: 1, b: 2 };
    const result = stripFields(data, ['a', 'b']);
    assert.deepStrictEqual(result, {});
  });
});

// ============================================================
// applyView — user_guard
// ============================================================
describe('applyView — user_guard', () => {
  it('returns filtered output for Level 3', () => {
    const result = applyView('user_guard', mockOutput);
    assert.ok(result);
    assert.strictEqual(result.view, 'user_guard');
    assert.strictEqual(result.pii_policy, 'strict');
    assert.strictEqual(result.risk_level_color, 'yellow');
    assert.strictEqual(result.threat_type_label, 'MB');
    assert.ok(result.simple_advice);
    assert.ok(result.contextual_warning);
  });

  it('returns null for Silent (Level 1)', () => {
    const result = applyView('user_guard', silentOutput);
    assert.strictEqual(result, null);
  });

  it('does NOT expose acri_score', () => {
    const result = applyView('user_guard', mockOutput);
    assert.strictEqual(result.acri_score, undefined);
  });

  it('does NOT expose momentum_score', () => {
    const result = applyView('user_guard', mockOutput);
    assert.strictEqual(result.momentum_score, undefined);
  });

  it('does NOT expose internal_logs', () => {
    const result = applyView('user_guard', mockOutput);
    assert.strictEqual(result.internal_logs, undefined);
  });
});

// ============================================================
// applyView — auditor
// ============================================================
describe('applyView — auditor', () => {
  it('returns full audit data', () => {
    const result = applyView('auditor', mockOutput);
    assert.ok(result);
    assert.strictEqual(result.view, 'auditor');
    assert.strictEqual(result.pii_policy, 'redacted');
    assert.strictEqual(result.acri_score, 0.65);
    assert.strictEqual(result.pattern, 'MB');
    assert.strictEqual(result.effective_level, 3);
  });

  it('does NOT expose user_real_name', () => {
    const augmented = { ...mockOutput, user_real_name: 'John' };
    const result = applyView('auditor', augmented);
    assert.strictEqual(result.user_real_name, undefined);
  });
});

// ============================================================
// applyView — hitl_review
// ============================================================
describe('applyView — hitl_review', () => {
  it('returns decision support data', () => {
    const result = applyView('hitl_review', mockOutput);
    assert.ok(result);
    assert.strictEqual(result.view, 'hitl_review');
    assert.strictEqual(result.risk_label, 'Level 3');
    assert.strictEqual(result.decision_support_flag, 'MONITOR');
    assert.ok(result.context_summary);
  });

  it('flags HANDOFF_RECOMMENDED when requires_handoff', () => {
    const handoffOutput = JSON.parse(JSON.stringify(mockOutput));
    handoffOutput.alert.requires_handoff = true;
    const result = applyView('hitl_review', handoffOutput);
    assert.strictEqual(result.decision_support_flag, 'HANDOFF_RECOMMENDED');
  });

  it('does NOT expose user_identity_metadata', () => {
    const result = applyView('hitl_review', mockOutput);
    assert.strictEqual(result.user_identity_metadata, undefined);
  });
});

// ============================================================
// Edge cases
// ============================================================
describe('applyView — edge cases', () => {
  it('throws for unknown view', () => {
    assert.throws(() => applyView('unknown_view', mockOutput), /Unknown view/);
  });

  it('returns null for null output', () => {
    assert.strictEqual(applyView('user_guard', null), null);
  });

  it('getAvailableViews returns 3 views', () => {
    const views = getAvailableViews();
    assert.strictEqual(views.length, 3);
    assert.ok(views.includes('auditor'));
    assert.ok(views.includes('user_guard'));
    assert.ok(views.includes('hitl_review'));
  });

  it('isValidView works correctly', () => {
    assert.strictEqual(isValidView('auditor'), true);
    assert.strictEqual(isValidView('user_guard'), true);
    assert.strictEqual(isValidView('fake'), false);
  });
});
