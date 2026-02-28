/**
 * output-formatter.test.js
 * Layer 4 — 輸出格式化引擎測試
 * 設計：Node-01（Architect）
 * 日期：2026-02-17
 */
  const { describe, test } = require("node:test");
  const { expect } = require("../helpers/expect-shim");

const {
  format,
  formatDashboard,
  formatAlert,
  formatReport,
  formatAPI,
  OUTPUT_FORMATS
} = require('../../src/output/output-formatter');

// ============================================================
// 測試用偵測結果
// ============================================================

const mockDetection = {
  acri: 0.55,
  vri: null,
  pattern: 'MB',
  timestamp: '2026-02-17T12:00:00Z'
};

const mockDetectionDual = {
  acri: 0.45,
  vri: 0.75,
  pattern: 'VS',
  timestamp: '2026-02-17T12:00:00Z'
};

const mockForecast = {
  pattern: 'MB',
  window_days: 30,
  data_points: 85,
  trendBand: 'HIGH',
  probability: 0.8,
  confidence: 0.8,
  slope: 0.067,
  avg_intensity: 0.62,
  aligned_examples: [
    { timestamp: '2026-02-15T10:23:00Z', intensity: 0.78, gate_hit: 3 }
  ]
};

// ============================================================
// 1. format 統一入口
// ============================================================

describe('format — 統一入口', () => {

  test('無效格式 → Error', () => {
    expect(() => format('invalid', mockDetection)).toThrow(/Invalid format/);
  });

  test('四種格式都能正常生成', () => {
    OUTPUT_FORMATS.forEach(fmt => {
      const result = format(fmt, mockDetection, mockForecast);
      if (fmt === 'alert' && result === null) return; // Silent 層級可能回傳 null
      expect(result.format).toBe(fmt);
    });
  });

});

// ============================================================
// 2. Dashboard 格式
// ============================================================

describe('formatDashboard', () => {

  test('基本輸出結構', () => {
    const result = formatDashboard(mockDetection);
    expect(result.format).toBe('dashboard');
    expect(result.status).toHaveProperty('effective_level');
    expect(result.status).toHaveProperty('requires_attention');
    expect(result.status).toHaveProperty('requires_handoff');
    expect(result.scores.acri).toBe(0.55);
    expect(result.pattern).toBe('MB');
  });

  test('附加 Forecast 資訊', () => {
    const result = formatDashboard(mockDetection, mockForecast);
    expect(result.forecast).toBeTruthy();
    expect(result.forecast.trendBand).toBe('HIGH');
    expect(result.forecast.slope).toBe(0.067);
  });

  test('雙通道偵測', () => {
    const result = formatDashboard(mockDetectionDual);
    expect(result.scores.acri).toBe(0.45);
    expect(result.scores.vri).toBe(0.75);
    expect(result.channels.vacuum).toBeTruthy();
  });

});

// ============================================================
// 3. Alert 格式
// ============================================================

describe('formatAlert', () => {

  test('低 ACRI → 回傳 null（Silent）', () => {
    const result = formatAlert({ acri: 0.1, vri: null, pattern: 'MB' });
    expect(result).toBeNull();
  });

  test('中 ACRI → Level 2 Alert', () => {
    const result = formatAlert(mockDetection);
    expect(result).not.toBeNull();
    expect(result.format).toBe('alert');
    expect(result.level).toBe(2);
    expect(result.message).toBeTruthy();
  });

  test('高 VRI → Level 3 + Hand-off 附件', () => {
    const result = formatAlert(mockDetectionDual);
    expect(result.level).toBe(3);
    expect(result.handoff).toBeTruthy();
    expect(result.handoff.type).toBe('structured_handoff');
    expect(result.handoff.desensitized).toBe(true);
  });

  test('中文語言配置', () => {
    const result = formatAlert(
      { acri: 0.5, vri: null, pattern: 'FC', timestamp: '2026-02-17T12:00:00Z' },
      { locale: 'zh-trad' }
    );
    expect(result.message).toContain('偵測到');
  });

});

// ============================================================
// 4. Report 格式
// ============================================================

describe('formatReport', () => {

  test('基本輸出結構', () => {
    const result = formatReport(mockDetection);
    expect(result.format).toBe('report');
    expect(result.summary.pattern).toBe('MB');
    expect(result.summary.acri).toBe(0.55);
    expect(result.desensitized).toBe(true);
    expect(result.contains_raw_content).toBe(false);
  });

  test('附加 Forecast 趨勢', () => {
    const result = formatReport(mockDetection, mockForecast);
    expect(result.trend).toBeTruthy();
    expect(result.trend.trendBand).toBe('HIGH');
    expect(result.trend.aligned_examples).toHaveLength(1);
  });

});

// ============================================================
// 5. API 格式
// ============================================================

describe('formatAPI', () => {

  test('基本輸出結構', () => {
    const result = formatAPI(mockDetection);
    expect(result.format).toBe('api');
    expect(result.version).toBe('1.0.0');
    expect(result.meta.desensitized).toBe(true);
    expect(result.meta.protocol).toBe('ISSP');
    expect(result.meta.layer).toBe(4);
  });

  test('附加 Forecast', () => {
    const result = formatAPI(mockDetection, mockForecast);
    expect(result.forecast).toBeTruthy();
    expect(result.forecast.trendBand).toBe('HIGH');
  });

  test('無 Forecast → forecast 為 null', () => {
    const result = formatAPI(mockDetection);
    expect(result.forecast).toBeNull();
  });

});

// ============================================================
// 6. 語義脫敏合規
// ============================================================

describe('Semantic Desensitization Compliance', () => {

  test('Report 標記 desensitized + 不含原始內容', () => {
    const result = formatReport(mockDetection);
    expect(result.desensitized).toBe(true);
    expect(result.contains_raw_content).toBe(false);
  });

  test('API 標記 desensitized', () => {
    const result = formatAPI(mockDetection);
    expect(result.meta.desensitized).toBe(true);
    expect(result.meta.contains_raw_content).toBe(false);
  });

});
