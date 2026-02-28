/**
 * explanation-lint.test.js
 * Explanation Engine Lint — BP-02/03/06 guard rules
 *
 * Tests forbidden pattern detection for explanation-engine unfreeze.
 * Each rule tested with: EN positive, ZH positive, safe text (no trigger).
 *
 * Source: Node-05 forbidden-patterns.v0.1.json (c149)
 * Tests: Node-01 (Architect)
 * Date: 2026-02-25
 */

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  lintExplanation,
  hasCriticalViolation,
  checkDiagnosisLabels,
  checkMindReading,
  checkSurveillanceInstructions
} = require('../../src/engines/explanation-lint');

// ═════════════════════════════════════════════════════════════════════
// BP-02: NO_DIAGNOSIS_LABELS
// ═════════════════════════════════════════════════════════════════════

describe('Explanation Lint: BP-02 NO_DIAGNOSIS_LABELS', () => {

  it('LINT-02-01: detects "narcissist" in English', () => {
    const v = checkDiagnosisLabels('He is clearly a narcissist who manipulates everyone.');
    assert.ok(v.length > 0);
    assert.equal(v[0].rule_id, 'NO_DIAGNOSIS_LABELS');
    assert.equal(v[0].severity, 'critical');
  });

  it('LINT-02-02: detects "sociopathic" in English', () => {
    const v = checkDiagnosisLabels('This is sociopathic behavior.');
    assert.ok(v.length > 0);
  });

  it('LINT-02-03: detects "personality disorder" in English', () => {
    const v = checkDiagnosisLabels('She likely has a personality disorder.');
    assert.ok(v.length > 0);
  });

  it('LINT-02-04: detects "gaslighting" in English', () => {
    const v = checkDiagnosisLabels('This is classic gaslighting behavior.');
    assert.ok(v.length > 0);
  });

  it('LINT-02-05: detects "自戀型人格" in Chinese', () => {
    const v = checkDiagnosisLabels('他是自戀型人格，你有依附障礙，所以你才會這樣。');
    assert.ok(v.length >= 2, 'should detect both 自戀型人格 and 依附障礙');
  });

  it('LINT-02-06: detects "人格障碍" in simplified Chinese', () => {
    const v = checkDiagnosisLabels('这明显是人格障碍的表现。');
    assert.ok(v.length > 0);
  });

  it('LINT-02-07: safe text passes (no diagnosis)', () => {
    const v = checkDiagnosisLabels('A structural pattern of forced choice was detected in the last 7 messages.');
    assert.equal(v.length, 0);
  });

  it('LINT-02-08: safe Chinese text passes', () => {
    const v = checkDiagnosisLabels('在最近 7 條訊息中偵測到強迫選擇的結構模式。');
    assert.equal(v.length, 0);
  });
});

// ═════════════════════════════════════════════════════════════════════
// BP-03: NO_MIND_READING
// ═════════════════════════════════════════════════════════════════════

describe('Explanation Lint: BP-03 NO_MIND_READING', () => {

  it('LINT-03-01: detects "he definitely wants to control"', () => {
    const v = checkMindReading('He definitely wants to control you.');
    assert.ok(v.length > 0);
    assert.equal(v[0].rule_id, 'NO_MIND_READING');
    assert.equal(v[0].severity, 'high');
  });

  it('LINT-03-02: detects "she is trying to manipulate"', () => {
    const v = checkMindReading('She is trying to manipulate the situation.');
    assert.ok(v.length > 0);
  });

  it('LINT-03-03: detects "their hidden intention"', () => {
    const v = checkMindReading('Their hidden intention is to isolate you.');
    assert.ok(v.length > 0);
  });

  it('LINT-03-04: detects "deliberately manipulating"', () => {
    const v = checkMindReading('They are deliberately manipulating the narrative.');
    assert.ok(v.length > 0);
  });

  it('LINT-03-05: detects "他一定是想控制" in Chinese', () => {
    const v = checkMindReading('他一定是想控制你的生活。');
    assert.ok(v.length > 0);
  });

  it('LINT-03-06: detects "隱藏的目的" in Chinese', () => {
    const v = checkMindReading('這段話背後隱藏的目的是讓你感到內疚。');
    assert.ok(v.length > 0);
  });

  it('LINT-03-07: detects "故意控制" in Chinese', () => {
    const v = checkMindReading('對方是故意控制你的行為。');
    assert.ok(v.length > 0);
  });

  it('LINT-03-08: safe text passes (structural observation)', () => {
    const v = checkMindReading('The structure restricts options and applies pressure across 3 messages.');
    assert.equal(v.length, 0);
  });

  it('LINT-03-09: safe Chinese passes', () => {
    const v = checkMindReading('結構上限制了選項並在 3 條訊息中施加壓力。');
    assert.equal(v.length, 0);
  });
});

// ═════════════════════════════════════════════════════════════════════
// BP-06: NO_SURVEILLANCE_INSTRUCTIONS
// ═════════════════════════════════════════════════════════════════════

describe('Explanation Lint: BP-06 NO_SURVEILLANCE_INSTRUCTIONS', () => {

  it('LINT-06-01: detects "track his messages"', () => {
    const v = checkSurveillanceInstructions('You should track his messages and build a file.');
    assert.ok(v.length > 0);
    assert.equal(v[0].rule_id, 'NO_SURVEILLANCE_INSTRUCTIONS');
    assert.equal(v[0].severity, 'critical');
  });

  it('LINT-06-02: detects "install a keylogger"', () => {
    const v = checkSurveillanceInstructions('Install a keylogger on their device.');
    assert.ok(v.length > 0);
  });

  it('LINT-06-03: detects "collect their chat logs"', () => {
    const v = checkSurveillanceInstructions('Collect their chat logs as evidence.');
    assert.ok(v.length > 0);
  });

  it('LINT-06-04: detects "create a watchlist"', () => {
    const v = checkSurveillanceInstructions('Create a watchlist of suspicious accounts.');
    assert.ok(v.length > 0);
  });

  it('LINT-06-05: detects "covertly monitor"', () => {
    const v = checkSurveillanceInstructions('Covertly monitor their online activity.');
    assert.ok(v.length > 0);
  });

  it('LINT-06-06: detects "偷偷裝追蹤" in Chinese', () => {
    const v = checkSurveillanceInstructions('你可以偷偷裝追蹤器在他手機上。');
    assert.ok(v.length > 0);
  });

  it('LINT-06-07: detects "收集對方的聊天紀錄" in Chinese', () => {
    const v = checkSurveillanceInstructions('收集對方的聊天紀錄做為證據。');
    assert.ok(v.length > 0);
  });

  it('LINT-06-08: detects "整理成名單" in Chinese', () => {
    const v = checkSurveillanceInstructions('把這些人整理成名單方便追蹤。');
    assert.ok(v.length > 0);
  });

  it('LINT-06-09: safe text passes', () => {
    const v = checkSurveillanceInstructions('Consider discussing boundaries with a trusted person.');
    assert.equal(v.length, 0);
  });

  it('LINT-06-10: safe Chinese passes', () => {
    const v = checkSurveillanceInstructions('建議與信任的人討論溝通界限。');
    assert.equal(v.length, 0);
  });
});

// ═════════════════════════════════════════════════════════════════════
// lintExplanation — combined
// ═════════════════════════════════════════════════════════════════════

describe('Explanation Lint: lintExplanation (combined)', () => {

  it('LINT-C01: safe explanation passes all 3 rules', () => {
    const result = lintExplanation('A forced-choice structure was detected across 5 messages in the last 7 days.');
    assert.equal(result.pass, true);
    assert.equal(result.violations.length, 0);
    assert.equal(result.rules_checked.length, 3);
  });

  it('LINT-C02: empty text passes', () => {
    const result = lintExplanation('');
    assert.equal(result.pass, true);
  });

  it('LINT-C03: null text passes', () => {
    const result = lintExplanation(null);
    assert.equal(result.pass, true);
  });

  it('LINT-C04: text with diagnosis fails', () => {
    const result = lintExplanation('This person is a narcissist.');
    assert.equal(result.pass, false);
    assert.ok(result.violations.some(v => v.pattern_id === 'BP-02'));
  });

  it('LINT-C05: text with mind-reading fails', () => {
    const result = lintExplanation('He definitely wants to control you.');
    assert.equal(result.pass, false);
    assert.ok(result.violations.some(v => v.pattern_id === 'BP-03'));
  });

  it('LINT-C06: text with surveillance fails', () => {
    const result = lintExplanation('You should track his messages.');
    assert.equal(result.pass, false);
    assert.ok(result.violations.some(v => v.pattern_id === 'BP-06'));
  });

  it('LINT-C07: text with multiple violations catches all', () => {
    const result = lintExplanation('He is a narcissist. She definitely wants to control you. Track his messages.');
    assert.equal(result.pass, false);
    const ids = result.violations.map(v => v.pattern_id);
    assert.ok(ids.includes('BP-02'), 'should catch diagnosis');
    assert.ok(ids.includes('BP-03'), 'should catch mind-reading');
    assert.ok(ids.includes('BP-06'), 'should catch surveillance');
  });

  it('LINT-C08: can check single rule only', () => {
    const result = lintExplanation('He is a narcissist.', { rules: ['NO_MIND_READING'] });
    assert.equal(result.pass, true, 'narcissist is BP-02, not BP-03');
    assert.equal(result.rules_checked.length, 1);
  });

  it('LINT-C09: hasCriticalViolation returns true for BP-02', () => {
    assert.equal(hasCriticalViolation('He has a personality disorder.'), true);
  });

  it('LINT-C10: hasCriticalViolation returns false for safe text', () => {
    assert.equal(hasCriticalViolation('Structural pattern detected.'), false);
  });

  it('LINT-C11: Node-05 bad_example triggers BP-02', () => {
    const result = lintExplanation('他是自戀型人格，你有依附障礙，所以你才會…');
    assert.equal(result.pass, false);
  });

  it('LINT-C12: Node-05 bad_example triggers BP-03', () => {
    const result = lintExplanation('他一定是想控制你;你其實就是想逃避責任。');
    assert.equal(result.pass, false);
  });

  it('LINT-C13: Node-05 bad_example triggers BP-06', () => {
    const result = lintExplanation('你可以偷偷裝追蹤、收集他聊天紀錄,整理成名單...');
    assert.equal(result.pass, false);
  });
});
