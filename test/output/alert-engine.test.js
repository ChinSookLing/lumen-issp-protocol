/**
 * alert-engine.test.js
 * Layer 4 — 三層響應機制測試
 * 設計：Node-01（Architect）
 * 日期：2026-02-17
 */

const { describe, test } = require("node:test");
const { expect } = require("../helpers/expect-shim");

const {
  evaluate,
  classifyLevel,
  RESPONSE_LEVELS,
  DEFAULT_THRESHOLDS
} = require('../../src/output/alert-engine');

// ============================================================
// 1. classifyLevel 單元測試
// ============================================================

describe('classifyLevel — 層級分類', () => {

  const thresholds = { alert: 0.3, handoff: 0.7 };

  test('score < 0.3 → SILENT', () => {
    expect(classifyLevel(0.1, thresholds)).toBe(RESPONSE_LEVELS.SILENT);
    expect(classifyLevel(0.0, thresholds)).toBe(RESPONSE_LEVELS.SILENT);
    expect(classifyLevel(0.29, thresholds)).toBe(RESPONSE_LEVELS.SILENT);
  });

  test('0.3 ≤ score < 0.7 → ALERT', () => {
    expect(classifyLevel(0.3, thresholds)).toBe(RESPONSE_LEVELS.ALERT);
    expect(classifyLevel(0.5, thresholds)).toBe(RESPONSE_LEVELS.ALERT);
    expect(classifyLevel(0.69, thresholds)).toBe(RESPONSE_LEVELS.ALERT);
  });

  test('score ≥ 0.7 → HANDOFF', () => {
    expect(classifyLevel(0.7, thresholds)).toBe(RESPONSE_LEVELS.HANDOFF);
    expect(classifyLevel(0.85, thresholds)).toBe(RESPONSE_LEVELS.HANDOFF);
    expect(classifyLevel(1.0, thresholds)).toBe(RESPONSE_LEVELS.HANDOFF);
  });

});

// ============================================================
// 2. evaluate — Push 通道
// ============================================================

describe('evaluate — Push Only', () => {

  test('低 ACRI → Level 1 Silent', () => {
    const result = evaluate({
      acri: 0.15,
      vri: null,
      pattern: 'MB',
      timestamp: '2026-02-17T12:00:00Z'
    });
    expect(result.effective_level).toBe(1);
    expect(result.requires_handoff).toBe(false);
    expect(result.requires_alert).toBe(false);
  });

  test('中 ACRI → Level 2 Alert', () => {
    const result = evaluate({
      acri: 0.55,
      vri: null,
      pattern: 'FC',
      timestamp: '2026-02-17T12:00:00Z'
    });
    expect(result.effective_level).toBe(2);
    expect(result.requires_alert).toBe(true);
    expect(result.requires_handoff).toBe(false);
  });

  test('高 ACRI → Level 3 Hand-off', () => {
    const result = evaluate({
      acri: 0.85,
      vri: null,
      pattern: 'GC',
      timestamp: '2026-02-17T12:00:00Z'
    });
    expect(result.effective_level).toBe(3);
    expect(result.requires_handoff).toBe(true);
  });

});

// ============================================================
// 3. evaluate — 雙通道
// ============================================================

describe('evaluate — Dual Channel', () => {

  test('Push 低 + Vacuum 高 → 取 Vacuum 層級', () => {
    const result = evaluate({
      acri: 0.2,
      vri: 0.75,
      pattern: 'VS',
      timestamp: '2026-02-17T12:00:00Z'
    });
    expect(result.effective_level).toBe(3);
    expect(result.channels.vacuum.level).toBe(3);
    expect(result.channels.push.level).toBe(1);
  });

  test('Push 高 + Vacuum 低 → 取 Push 層級', () => {
    const result = evaluate({
      acri: 0.8,
      vri: 0.1,
      pattern: 'MB',
      timestamp: '2026-02-17T12:00:00Z'
    });
    expect(result.effective_level).toBe(3);
    expect(result.channels.push.level).toBe(3);
    expect(result.channels.vacuum.level).toBe(1);
  });

  test('兩通道都中等 → Level 2', () => {
    const result = evaluate({
      acri: 0.45,
      vri: 0.5,
      pattern: 'EA',
      timestamp: '2026-02-17T12:00:00Z'
    });
    expect(result.effective_level).toBe(2);
  });

});

// ============================================================
// 4. 節點配置覆蓋
// ============================================================

describe('evaluate — Node Config Override', () => {

  test('自訂較高閾值 → 原本 Alert 變 Silent', () => {
    const result = evaluate(
      { acri: 0.4, vri: null, pattern: 'MB', timestamp: '2026-02-17T12:00:00Z' },
      { responsePolicyAlert: 0.5, responsePolicyHandoff: 0.8 }
    );
    expect(result.effective_level).toBe(1);
  });

  test('自訂較低閾值 → 原本 Silent 變 Alert', () => {
    const result = evaluate(
      { acri: 0.2, vri: null, pattern: 'FC', timestamp: '2026-02-17T12:00:00Z' },
      { responsePolicyAlert: 0.15, responsePolicyHandoff: 0.5 }
    );
    expect(result.effective_level).toBe(2);
  });

});

// ============================================================
// 5. 錯誤處理
// ============================================================

describe('evaluate — Error Handling', () => {

  test('null detection → TypeError', () => {
    expect(() => evaluate(null)).toThrow(TypeError);
  });

  test('ACRI 超出範圍 → Error', () => {
    expect(() => evaluate({ acri: 1.5, vri: null, pattern: 'MB' })).toThrow(/Invalid ACRI/);
  });

  test('VRI 超出範圍 → Error', () => {
    expect(() => evaluate({ acri: 0.5, vri: -0.1, pattern: 'MB' })).toThrow(/Invalid VRI/);
  });

});
