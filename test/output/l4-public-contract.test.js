/**
 * l4-public-contract.test.js
 * Layer 4 — Public Contract v0.1 驗證（V10 DoD）
 *
 * 來源：M85 V10 通過（6/6）
 * 設計：Node-01（Architect）
 * 日期：2026-02-25
 *
 * DoD tests:
 *   1. no_raw_text_tier0 — Tier 0 不含原文
 *   2. required_fields — 必備欄位齊全
 *   3. forbidden_content — 禁止定性指控/法律意見
 *   4. context_sufficiency — single-msg 不得宣稱結構偵測已確立（Node-05 M85 建議）
 *   5. contains_raw_false — meta.contains_raw_content = false
 *   6. evidence_refs_present — reason codes 有 evidence_refs
 *   7. engine_version_present — 輸出含版本號
 *   8. desensitized_flag — meta.desensitized = true
 */
'use strict';
const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const { formatAPI, formatDashboard, formatReport } = require('../../src/output/output-formatter');

// === Test fixtures ===
const singleMsgDetection = {
  pattern: 'EP',
  acri: 0.45,
  vri: null,
  timestamp: '2026-02-25T10:00:00Z',
  message_count: 1
};

const multiMsgDetection = {
  pattern: 'EP',
  acri: 0.65,
  vri: 0.4,
  timestamp: '2026-02-25T10:00:00Z',
  message_count: 12
};

const forecast = {
  trendBand: 'rising',
  slope: 0.03,
  probability: 0.72,
  window_days: 30
};

// ============================================================
// 1. no_raw_text_tier0 — Tier 0 不含原文
// ============================================================
describe('V10 DoD — no_raw_text_tier0', () => {
  test('API output 不含任何 raw text key', () => {
    const result = formatAPI(multiMsgDetection, forecast);
    const json = JSON.stringify(result);
    const forbidden = ['raw_text', 'transcript', 'snippet', 'original', 'source_text', 'prompt'];
    for (const key of forbidden) {
      assert.ok(!json.includes(`"${key}"`), `Tier 0 output must not contain "${key}"`);
    }
  });

  test('Dashboard output 不含任何 raw text key', () => {
    const result = formatDashboard(multiMsgDetection, forecast);
    const json = JSON.stringify(result);
    assert.ok(!json.includes('"raw_text"'), 'Dashboard must not contain raw_text');
    assert.ok(!json.includes('"transcript"'), 'Dashboard must not contain transcript');
  });
});

// ============================================================
// 2. required_fields — 必備欄位齊全
// ============================================================
describe('V10 DoD — required_fields', () => {
  test('API output 含 V10 必備欄位', () => {
    const result = formatAPI(multiMsgDetection, forecast);
    // detection fields
    assert.ok(result.detection.pattern, 'must have pattern');
    assert.ok(typeof result.detection.acri === 'number', 'must have acri');
    assert.ok(result.detection.timestamp, 'must have timestamp');
    // forecast fields
    assert.ok(result.forecast.trendBand, 'must have trendBand');
    assert.ok(result.forecast.window_days, 'must have window_days');
    // meta
    assert.ok(result.version, 'must have engine_version');
    assert.ok(result.meta.protocol === 'ISSP', 'must have protocol');
  });
});

// ============================================================
// 3. forbidden_content — 禁止定性指控
// ============================================================
describe('V10 DoD — forbidden_content', () => {
  test('output 不含定性指控或法律意見語言', () => {
    const result = formatAPI(multiMsgDetection, forecast);
    const json = JSON.stringify(result).toLowerCase();
    const forbidden = ['guilty', 'criminal', 'abuser', 'verdict', 'sentence', 'prosecute', 'convict'];
    for (const word of forbidden) {
      assert.ok(!json.includes(word), `Output must not contain accusatory term "${word}"`);
    }
  });
});

// ============================================================
// 4. context_sufficiency — single-msg 不得宣稱結構偵測已確立
// ============================================================
describe('V10 DoD — context_sufficiency (Node-05 M85)', () => {
  test('single-msg detection 的 API output 不宣稱 confirmed/established', () => {
    const result = formatAPI(singleMsgDetection);
    const json = JSON.stringify(result).toLowerCase();
    const overclaimWords = ['confirmed', 'established', 'definitive', 'conclusive', 'proven'];
    for (const word of overclaimWords) {
      assert.ok(!json.includes(word),
        `Single-msg output must not claim "${word}" — context_sufficiency=insufficient`);
    }
  });

  test('single-msg detection acri 不應標記為 high confidence', () => {
    const result = formatAPI(singleMsgDetection);
    const json = JSON.stringify(result).toLowerCase();
    assert.ok(!json.includes('"high"') || !json.includes('confidence'),
      'Single-msg should not claim high confidence');
  });
});

// ============================================================
// 5. contains_raw_false — meta 標記
// ============================================================
describe('V10 DoD — contains_raw_false', () => {
  test('meta.contains_raw_content === false', () => {
    const result = formatAPI(multiMsgDetection, forecast);
    assert.strictEqual(result.meta.contains_raw_content, false);
  });
});

// ============================================================
// 6. evidence_refs_present — reason codes 有依據
// ============================================================
describe('V10 DoD — evidence_refs', () => {
  test('API response 含 effective_level（可追溯 reason）', () => {
    const result = formatAPI(multiMsgDetection, forecast);
    assert.ok(result.response.effective_level, 'must have effective_level as reason reference');
  });
});

// ============================================================
// 7. engine_version_present
// ============================================================
describe('V10 DoD — engine_version', () => {
  test('output 含 version 欄位', () => {
    const result = formatAPI(multiMsgDetection, forecast);
    assert.ok(result.version, 'must have version');
    assert.match(result.version, /^\d+\.\d+\.\d+$/, 'version must be semver');
  });
});

// ============================================================
// 8. desensitized_flag
// ============================================================
describe('V10 DoD — desensitized_flag', () => {
  test('meta.desensitized === true', () => {
    const result = formatAPI(multiMsgDetection, forecast);
    assert.strictEqual(result.meta.desensitized, true);
  });
});
