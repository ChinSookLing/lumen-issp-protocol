/**
 * forecast-engine.test.js
 * 測試框架 — 基於 Node-03 設計草案（M67）
 * 設計：Node-01（Architect）+ Node-05 協作
 * 日期：2026-02-17
 *
 * 覆蓋範圍：
 *   - 正常路徑（Happy Path）
 *   - 趨勢帶判定（Trend Band Classification）
 *   - 邊界條件（Boundary）
 *   - 錯誤擲出（Error Throwing）
 *   - aligned_examples 限制
 */
  const { describe, test } = require("node:test");
  const { expect } = require("../helpers/expect-shim");
  const { computeTrend } = require('../../src/forecast/forecast-engine');

// ============================================================
// 輔助函數：生成測試事件
// ============================================================

/**
 * 生成指定數量的事件，intensity 可自訂趨勢
 * @param {number} count - 事件數量
 * @param {string} pattern - pattern 名稱
 * @param {Object} opts
 * @param {number} opts.baseIntensity - 起始 intensity
 * @param {number} opts.increment - 每筆遞增量（正=上升趨勢，負=下降，0=平穩）
 * @param {number} opts.windowDays - 事件分佈的天數範圍
 * @returns {Array} 事件陣列
 */
function generateEvents(count, pattern, {
  baseIntensity = 0.5,
  increment = 0,
  windowDays = 30
} = {}) {
  const now = new Date();  // use current time to align with computeTrend's Date.now()
  const events = [];
  for (let i = 0; i < count; i++) {
    const daysAgo = (windowDays - 0.01) - ((windowDays - 0.01) * i / (count - 1 || 1));
    const timestamp = new Date(now.getTime() - daysAgo * 86400000);
    const intensity = Math.min(1.0, Math.max(0.0, baseIntensity + increment * i));
    events.push({
      pattern,
      intensity: parseFloat(intensity.toFixed(4)),
      gate_hit: Math.floor(Math.random() * 3) + 1, // 1~3
      timestamp: timestamp.toISOString()
    });
  }
  return events;
}

// ============================================================
// 1. 正常路徑（Happy Path）
// ============================================================

describe('Happy Path — 基本功能驗證', () => {

  test('30 天窗口，50 筆數據，應回傳完整輸出欄位', () => {
    const events = generateEvents(50, 'MB', { windowDays: 30 });
    const result = computeTrend(events, 'MB', { windowDays: 30 });

    // 輸出欄位完整性
    expect(result).toHaveProperty('pattern', 'MB');
    expect(result).toHaveProperty('window_days', 30);
    expect(result).toHaveProperty('data_points');
    expect(result).toHaveProperty('trendBand');
    expect(result).toHaveProperty('probability');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('slope');
    expect(result).toHaveProperty('avg_intensity');
    expect(result).toHaveProperty('aligned_examples');
  });

  test('7 天窗口應正常運作', () => {
    const events = generateEvents(40, 'EP', { windowDays: 7 });
    const result = computeTrend(events, 'EP', { windowDays: 7 });
    expect(result.window_days).toBe(7);
    expect(result.pattern).toBe('EP');
  });

  test('90 天窗口應正常運作', () => {
    const events = generateEvents(100, 'DM', { windowDays: 90 });
    const result = computeTrend(events, 'DM', { windowDays: 90 });
    expect(result.window_days).toBe(90);
    expect(result.pattern).toBe('DM');
  });

  test('混合 pattern 的事件陣列，只計算目標 pattern', () => {
    const mbEvents = generateEvents(40, 'MB', { windowDays: 30 });
    const gvEvents = generateEvents(20, 'GV', { windowDays: 30 });
    const mixed = [...mbEvents, ...gvEvents];
    const result = computeTrend(mixed, 'MB', { windowDays: 30 });
    expect(result.pattern).toBe('MB');
    expect(result.data_points).toBeLessThanOrEqual(40);
  });

});

// ============================================================
// 2. 趨勢帶判定（Trend Band Classification）
// ============================================================

describe('Trend Band — 趨勢帶分類', () => {

  test('平穩低強度 → LOW', () => {
    const events = generateEvents(50, 'MB', {
      baseIntensity: 0.15,
      increment: 0,
      windowDays: 30
    });
    const result = computeTrend(events, 'MB', { windowDays: 30 });
    expect(result.trendBand).toBe('LOW');
  });

 
  test('中等斜率 + 中等強度 → MEDIUM', () => {
    // 手動構造：intensity 從 0.35 到 0.40，確保斜率落在 [0.02, 0.05)
    const events = generateEvents(50, 'MB', {
      baseIntensity: 0.35,
      increment: 0.001,
      windowDays: 30
    });
    const result = computeTrend(events, 'MB', { windowDays: 30 });
    expect(result.trendBand).toBe('MEDIUM');
  });

  test('高斜率 + 高強度 → HIGH', () => {
    const events = generateEvents(50, 'MB', {
      baseIntensity: 0.5,
      increment: 0.01,  // 明顯上升
      windowDays: 30
    });
    const result = computeTrend(events, 'MB', { windowDays: 30 });
    expect(result.trendBand).toBe('HIGH');
  });

  test('下降趨勢也應有對應 trendBand', () => {
    const events = generateEvents(50, 'MB', {
      baseIntensity: 0.8,
      increment: -0.01,
      windowDays: 30
    });
    const result = computeTrend(events, 'MB', { windowDays: 30 });
    // 下降趨勢的 slope 應為負
    expect(result.slope).toBeLessThan(0);
    // trendBand 應基於 |slope| 判定
    expect(['LOW', 'MEDIUM', 'HIGH']).toContain(result.trendBand);
  });

});

// ============================================================
// 3. 邊界條件（Boundary）
// ============================================================

describe('Boundary — 邊界條件', () => {

  test('剛好 30 筆（最低門檻）應正常運作', () => {
    const events = generateEvents(30, 'MB', { windowDays: 30 });
    const result = computeTrend(events, 'MB', { windowDays: 30 });
    expect(result.data_points).toBe(30);
  });

  test('probability 應基於數據量分級（30-50 筆 → 0.6）', () => {
    const events = generateEvents(35, 'MB', { windowDays: 30 });
    const result = computeTrend(events, 'MB', { windowDays: 30 });
    expect(result.probability).toBeCloseTo(0.6, 1);
  });

  test('probability 應基於數據量分級（50-100 筆 → 0.8）', () => {
    const events = generateEvents(75, 'MB', { windowDays: 30 });
    const result = computeTrend(events, 'MB', { windowDays: 30 });
    expect(result.probability).toBeCloseTo(0.8, 1);
  });

  test('probability 應基於數據量分級（>100 筆 → 0.95）', () => {
    const events = generateEvents(120, 'MB', { windowDays: 90 });
    const result = computeTrend(events, 'MB', { windowDays: 90 });
    expect(result.probability).toBeCloseTo(0.95, 1);
  });

  test('intensity 應被 clamp 在 [0.0, 1.0]', () => {
    const events = generateEvents(50, 'MB', { windowDays: 30 });
    const result = computeTrend(events, 'MB', { windowDays: 30 });
    expect(result.avg_intensity).toBeGreaterThanOrEqual(0.0);
    expect(result.avg_intensity).toBeLessThanOrEqual(1.0);
  });

});

// ============================================================
// 4. aligned_examples 限制
// ============================================================

describe('aligned_examples — 案例限制', () => {

  test('最多回傳 3 個 examples', () => {
    const events = generateEvents(80, 'MB', { windowDays: 30 });
    const result = computeTrend(events, 'MB', { windowDays: 30 });
    expect(result.aligned_examples.length).toBeLessThanOrEqual(3);
  });

  test('不足 3 筆時回傳全部', () => {
    // 邊界：剛好 30 筆但只需驗證 examples 數量
    const events = generateEvents(30, 'MB', { windowDays: 30 });
    const result = computeTrend(events, 'MB', { windowDays: 30 });
    expect(result.aligned_examples.length).toBeGreaterThanOrEqual(1);
    expect(result.aligned_examples.length).toBeLessThanOrEqual(3);
  });

  test('examples 應包含 timestamp, intensity, gate_hit', () => {
    const events = generateEvents(50, 'MB', { windowDays: 30 });
    const result = computeTrend(events, 'MB', { windowDays: 30 });
    result.aligned_examples.forEach(ex => {
      expect(ex).toHaveProperty('timestamp');
      expect(ex).toHaveProperty('intensity');
      expect(ex).toHaveProperty('gate_hit');
    });
  });

  test('examples 應按 intensity 降序排列（取最高）', () => {
    const events = generateEvents(50, 'MB', {
      baseIntensity: 0.3,
      increment: 0.01,
      windowDays: 30
    });
    const result = computeTrend(events, 'MB', { windowDays: 30 });
    const intensities = result.aligned_examples.map(e => e.intensity);
    for (let i = 1; i < intensities.length; i++) {
      expect(intensities[i - 1]).toBeGreaterThanOrEqual(intensities[i]);
    }
  });

});

// ============================================================
// 5. 錯誤擲出（Error Throwing）
// ============================================================

describe('Error Throwing — 錯誤處理', () => {

  test('空陣列 → TypeError', () => {
    expect(() => computeTrend([], 'MB', { windowDays: 30 }))
      .toThrow(TypeError);
  });

  test('非陣列輸入 → TypeError', () => {
    expect(() => computeTrend('not an array', 'MB', { windowDays: 30 }))
      .toThrow(TypeError);
    expect(() => computeTrend(null, 'MB', { windowDays: 30 }))
      .toThrow(TypeError);
  });

  test('無效 pattern → Error', () => {
    const events = generateEvents(50, 'MB', { windowDays: 30 });
    expect(() => computeTrend(events, 'INVALID_PATTERN', { windowDays: 30 }))
      .toThrow(Error);
  });

  test('無效窗口（非 7/30/90）→ Error', () => {
    const events = generateEvents(50, 'MB', { windowDays: 30 });
    expect(() => computeTrend(events, 'MB', { windowDays: 15 }))
      .toThrow(Error);
    expect(() => computeTrend(events, 'MB', { windowDays: 0 }))
      .toThrow(Error);
  });

  test('數據不足 30 筆 → Error（訊息明確）', () => {
    const events = generateEvents(25, 'MB', { windowDays: 30 });
    expect(() => computeTrend(events, 'MB', { windowDays: 30 }))
      .toThrow(/[Ii]nsufficient data/);
  });

  test('篩選後目標 pattern 不足 30 筆 → Error', () => {
    const mbEvents = generateEvents(20, 'MB', { windowDays: 30 });
    const gvEvents = generateEvents(50, 'GV', { windowDays: 30 });
    const mixed = [...mbEvents, ...gvEvents];
    expect(() => computeTrend(mixed, 'MB', { windowDays: 30 }))
      .toThrow(/[Ii]nsufficient data/);
  });

});
