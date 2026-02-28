const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  evaluate,
  classifyLevel,
  RESPONSE_LEVELS,
  DEFAULT_THRESHOLDS
} = require('../../src/output/alert-engine');

describe('Threshold Audit — alert-engine', () => {

  it('DEFAULT_THRESHOLDS constants should remain unchanged (regression guard)', () => {
    assert.equal(DEFAULT_THRESHOLDS.VRI_GLOBAL_ALERT, 0.3);
    assert.equal(DEFAULT_THRESHOLDS.VRI_GLOBAL_HANDOFF, 0.7);
    assert.equal(DEFAULT_THRESHOLDS.RESPONSE_POLICY_ALERT, 0.3);
    assert.equal(DEFAULT_THRESHOLDS.RESPONSE_POLICY_HANDOFF, 0.7);
  });

  it('RESPONSE_LEVELS constants should remain unchanged (regression guard)', () => {
    assert.equal(RESPONSE_LEVELS.SILENT, 1);
    assert.equal(RESPONSE_LEVELS.ALERT, 2);
    assert.equal(RESPONSE_LEVELS.HANDOFF, 3);
  });

  it('ACRI = 0.0 should produce Level 1 SILENT', () => {
    const r = evaluate({ acri: 0.0 });
    assert.equal(r.channels.push.level, RESPONSE_LEVELS.SILENT);
  });

  it('ACRI at alert boundary (0.3) is deterministic', () => {
    const r1 = evaluate({ acri: 0.3 });
    const r2 = evaluate({ acri: 0.3 });
    assert.equal(r1.channels.push.level, r2.channels.push.level);
    assert.ok([1, 2, 3].includes(r1.channels.push.level));
  });

  it('ACRI at handoff boundary (0.7) is deterministic', () => {
    const r1 = evaluate({ acri: 0.7 });
    const r2 = evaluate({ acri: 0.7 });
    assert.equal(r1.channels.push.level, r2.channels.push.level);
    assert.ok([1, 2, 3].includes(r1.channels.push.level));
  });

  it('ACRI = 1.0 should produce Level 3 HANDOFF', () => {
    const r = evaluate({ acri: 1.0 });
    assert.equal(r.channels.push.level, RESPONSE_LEVELS.HANDOFF);
    assert.equal(r.requires_handoff, true);
  });

  it('classifyLevel directly: below alert = SILENT', () => {
    const level = classifyLevel(0.1, { alert: 0.3, handoff: 0.7 });
    assert.equal(level, RESPONSE_LEVELS.SILENT);
  });

  it('classifyLevel directly: between alert and handoff = ALERT', () => {
    const level = classifyLevel(0.5, { alert: 0.3, handoff: 0.7 });
    assert.equal(level, RESPONSE_LEVELS.ALERT);
  });

  it('classifyLevel directly: at handoff = HANDOFF', () => {
    const level = classifyLevel(0.7, { alert: 0.3, handoff: 0.7 });
    assert.equal(level, RESPONSE_LEVELS.HANDOFF);
  });
});
