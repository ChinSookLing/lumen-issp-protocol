/**
 * forecast-engine.js
 * Layer 3 — Forecast MVP
 *
 * 設計：Node-03（M67 草案）
 * 審查修改：Node-01（閾值常數化 + TODO 拆分 + examples 鎖 3）
 * 日期：2026-02-17
 *
 * 功能：接收 Layer 2 事件流，計算指定 Pattern 在給定時間窗口的趨勢。
 * 輸出：趨勢帶（trendBand）、機率（probability）、置信度（confidence）、
 *       斜率（slope）、平均強度（avg_intensity）、對齊案例（aligned_examples）
 *
 * 限制：
 *   - 不輸出因果解釋（僅描述「什麼在變」）
 *   - 不輸出個人或群體身份
 *   - 歷史數據不足 30 筆 → 擲出明確錯誤（不靜默回空）
 */

  'use strict';

// ============================================================
// 常數定義（Node-01 審查建議 #2：閾值抽成常數物件）
// ============================================================

const VALID_PATTERNS = [
  'DM', // Deliberate Misdirection
  'FC', // Forced Choice
  'MB', // Moral Blackmail
  'EA', // Emotional Attachment
  'IP', // Identity Probing
  'GC', // God Complex
  'EP', // Emotional Provocation
  'CN', // Conspiracy Narrative
  'VS'  // Vacuum Signal (Class-0 related)
];

const VALID_WINDOWS = [7, 30, 90];

const MIN_DATA_POINTS = 30;

const MAX_ALIGNED_EXAMPLES = 3; // Node-01 審查建議 #3

const THRESHOLDS = {
  SLOPE_LOW: 0.02,
  SLOPE_HIGH: 0.05,
  INTENSITY_LOW: 0.2,
  INTENSITY_HIGH: 0.6,
  AVG_INTENSITY_HIGH_WITH_POSITIVE_SLOPE: 0.6,
  POSITIVE_SLOPE_FOR_HIGH: 0.03
};

// TODO: Split probability vs confidence when R² calculation is available (Sprint 8)
// 目前 confidence = probability，未來應基於擬合優度（R²）獨立計算
const PROBABILITY_TIERS = {
  LOW: { min: MIN_DATA_POINTS, max: 50, value: 0.6 },
  MEDIUM: { min: 50, max: 100, value: 0.8 },
  HIGH: { min: 100, max: Infinity, value: 0.95 }
};

// ============================================================
// 核心函數
// ============================================================

/**
 * 最小平方法線性迴歸
 * @param {number[]} x - 標準化時間軸 [0, 1]
 * @param {number[]} y - intensity 值
 * @returns {{ slope: number, intercept: number }}
 */
function linearRegression(x, y) {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
  const sumX2 = x.reduce((a, b) => a + b * b, 0);
  const denominator = n * sumX2 - sumX * sumX;

  if (denominator === 0) {
    return { slope: 0, intercept: sumY / n };
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

/**
 * 根據數據量計算 probability
 * @param {number} count - 數據筆數
 * @returns {number}
 */
function computeProbability(count) {
  if (count >= PROBABILITY_TIERS.HIGH.min) return PROBABILITY_TIERS.HIGH.value;
  if (count >= PROBABILITY_TIERS.MEDIUM.min) return PROBABILITY_TIERS.MEDIUM.value;
  return PROBABILITY_TIERS.LOW.value;
}

/**
 * 根據斜率和平均強度判定趨勢帶
 * @param {number} slope - 線性迴歸斜率
 * @param {number} avgIntensity - 窗口內平均強度
 * @returns {'LOW'|'MEDIUM'|'HIGH'}
 */
function classifyTrendBand(slope, avgIntensity) {
  const absSlope = Math.abs(slope);

  // 低強度 + 低斜率 → LOW
  if (avgIntensity < THRESHOLDS.INTENSITY_LOW && absSlope < THRESHOLDS.SLOPE_LOW) {
    return 'LOW';
  }

  // 高強度 + 正斜率 → HIGH
  if (avgIntensity >= THRESHOLDS.AVG_INTENSITY_HIGH_WITH_POSITIVE_SLOPE &&
      slope > THRESHOLDS.POSITIVE_SLOPE_FOR_HIGH) {
    return 'HIGH';
  }

  // 其餘按斜率絕對值分級
  if (absSlope < THRESHOLDS.SLOPE_LOW) return 'LOW';
  if (absSlope < THRESHOLDS.SLOPE_HIGH) return 'MEDIUM';
  return 'HIGH';
}

/**
 * 選取窗口內 intensity 最高的事件作為對齊案例
 * @param {Array} events - 篩選後的事件陣列
 * @returns {Array} 最多 MAX_ALIGNED_EXAMPLES 個案例
 */
function selectAlignedExamples(events) {
  return events
    .slice() // 不修改原陣列
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, MAX_ALIGNED_EXAMPLES)
    .map(({ timestamp, intensity, gate_hit }) => ({ timestamp, intensity, gate_hit }));
}

// ============================================================
// 主函數
// ============================================================

/**
 * 計算指定 pattern 在給定窗口的趨勢
 * @param {Array} events - 事件陣列（可包含多種 pattern）
 * @param {string} targetPattern - 要計算的 pattern 名稱
 * @param {Object} options - 配置選項
 * @param {number} options.windowDays - 窗口天數（7/30/90）
 * @returns {Object} 趨勢結果
 * @throws {TypeError} 若 events 不是陣列
 * @throws {Error} 若 pattern 無效、窗口無效、或數據不足 30 筆
 */
function computeTrend(events, targetPattern, { windowDays }) {
  // ---- 輸入驗證 ----

  if (!Array.isArray(events) || events.length === 0) {
    throw new TypeError(
      'events must be a non-empty array'
    );
  }

  if (!VALID_PATTERNS.includes(targetPattern)) {
    throw new Error(
      `Invalid pattern "${targetPattern}". Valid patterns: ${VALID_PATTERNS.join(', ')}`
    );
  }

  if (!VALID_WINDOWS.includes(windowDays)) {
    throw new Error(
      `Invalid window ${windowDays}. Valid windows: ${VALID_WINDOWS.join(', ')}`
    );
  }

  // ---- 篩選事件 ----

  const now = new Date();
  const cutoff = new Date(now.getTime() - windowDays * 86400000);

  const filtered = events.filter(e =>
    e.pattern === targetPattern &&
    new Date(e.timestamp) >= cutoff
  );

  if (filtered.length < MIN_DATA_POINTS) {
    throw new Error(
      `Insufficient data for pattern ${targetPattern} in ${windowDays}-day window: only ${filtered.length} events (minimum ${MIN_DATA_POINTS})`
    );
  }

  // ---- 排序（由舊到新）----

  filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // ---- 數據準備：時間標準化到 [0, 1] ----

  const timestamps = filtered.map(e => new Date(e.timestamp).getTime());
  const minT = Math.min(...timestamps);
  const maxT = Math.max(...timestamps);
  const timeRange = maxT - minT || 1; // 避免除以零

  const x = timestamps.map(t => (t - minT) / timeRange);
  const y = filtered.map(e => e.intensity);

  // ---- 線性迴歸 ----

  const { slope, intercept } = linearRegression(x, y);

  // ---- 統計量 ----

  const avgIntensity = y.reduce((a, b) => a + b, 0) / y.length;

  // ---- 分類 ----

  const trendBand = classifyTrendBand(slope, avgIntensity);
  const probability = computeProbability(filtered.length);
  const confidence = probability; // TODO: Sprint 8 拆分

  // ---- 對齊案例 ----

  const aligned_examples = selectAlignedExamples(filtered);

  // ---- 輸出（對齊 Node-05 三欄鎖定）----

  return {
    pattern: targetPattern,
    window_days: windowDays,
    data_points: filtered.length,
    trendBand,
    probability,
    confidence,
    slope: parseFloat(slope.toFixed(6)),
    avg_intensity: parseFloat(avgIntensity.toFixed(4)),
    aligned_examples
  };
}

// ============================================================
// 匯出
// ============================================================

module.exports = { computeTrend };
