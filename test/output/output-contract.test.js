/**
 * output-contract.test.js
 * Node-05 設計的 UI 輸出合規測試
 *
 * 驗證：
 *   - signal_summary 必須包含 "signal"
 *   - signal 區塊不允許禁詞
 *   - HITL 時 guidance 不可 auto-execute
 *   - exit ramp 必須存在
 *   - risk band 分類正確
 */
'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  buildEnvelope,
  buildSignalSummary,
  classifyRiskBand,
  copyLint,
  copyLintExitRamp,
  FORBIDDEN_WORDS
} = require('../../src/output/output-envelope');

function makeDetection(score, pattern) {
  return {
    patterns: [{ id: pattern, confidence: score }],
    gate_hits: { push: { gate_hit: score >= 0.5 ? 2 : 1 } }
  };
}

describe('output-envelope: UI constraints (Node-05 design)', () => {

  it('signal_summary contains "signal" word', () => {
    const summary = buildSignalSummary(
      [{ id: 'EP', confidence: 0.72 }], 2, 0.72
    );
    assert.ok(summary.includes('signal'), `missing "signal" in: ${summary}`);
  });

  it('signal_summary never contains forbidden words', () => {
    const summary = buildSignalSummary(
      [{ id: 'EP', confidence: 0.72 }, { id: 'MB', confidence: 0.41 }], 2, 0.72
    );
    const errors = copyLint(summary);
    assert.deepStrictEqual(errors, [], `forbidden words found: ${errors}`);
  });

  it('envelope signal block passes copy lint', () => {
    const env = buildEnvelope(makeDetection(0.72, 'EP'));
    const errors = copyLint(env.signal.signal_summary);
    assert.deepStrictEqual(errors, []);
  });

  it('high score triggers HITL_REQUIRED mode', () => {
    const env = buildEnvelope(makeDetection(0.72, 'EP'));
    assert.equal(env.guidance.mode, 'HITL_REQUIRED');
  });

  it('low score triggers INFO_ONLY mode', () => {
    const env = buildEnvelope(makeDetection(0.2, 'EP'));
    assert.equal(env.guidance.mode, 'INFO_ONLY');
  });

  it('exit ramp is present in envelope', () => {
    const env = buildEnvelope(makeDetection(0.72, 'EP'));
    const errors = copyLintExitRamp(env.exit_ramp);
    assert.deepStrictEqual(errors, []);
  });

  it('exit ramp works for zh-trad', () => {
    const env = buildEnvelope(makeDetection(0.72, 'EP'), { lang: 'zh-trad' });
    assert.ok(env.exit_ramp.includes('不是結論'));
  });

  it('no_adjudication is always true', () => {
    const env = buildEnvelope(makeDetection(0.9, 'MB'));
    assert.equal(env.constraints.no_adjudication, true);
  });

  it('no_external_actions is always true', () => {
    const env = buildEnvelope(makeDetection(0.9, 'MB'));
    assert.equal(env.constraints.no_external_actions, true);
  });

  it('risk band classification correct', () => {
    assert.equal(classifyRiskBand(0.1), 'GREEN');
    assert.equal(classifyRiskBand(0.35), 'YELLOW');
    assert.equal(classifyRiskBand(0.55), 'ORANGE');
    assert.equal(classifyRiskBand(0.75), 'RED');
  });

  it('forbidden words list covers key terms', () => {
    assert.ok(FORBIDDEN_WORDS.includes('操控者'));
    assert.ok(FORBIDDEN_WORDS.includes('manipulator'));
    assert.ok(FORBIDDEN_WORDS.includes('你是'));
  });

  it('low confidence adds weak signal qualifier', () => {
    const summary = buildSignalSummary(
      [{ id: 'EP', confidence: 0.35 }], 1, 0.35
    );
    assert.ok(summary.includes('weak'), `missing weak qualifier: ${summary}`);
  });

});
