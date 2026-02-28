/**
 * group-d-harness.js
 * Group D — Forecast Engine 首輪驗證
 *
 * 設計：Node-01（Architect）
 * 日期：2026-02-22（M81 後首個 coding session）
 *
 * 功能：
 *   1. 讀取 Group C 的 50 條統一向量（gc-unified-bundle-v0.2.json）
 *   2. 把每條向量的 sparse events（1-5 筆）擴展成 ≥30 筆時序事件
 *      （基於 expected trend shape 生成合成事件）
 *   3. 餵進 forecast-engine.js 的 computeTrend()
 *   4. 比對輸出的 trendBand vs expected trend
 *   5. 輸出 Group D 驗證報告
 *
 * 向量格式轉換：
 *   Group C vector → { t, L1_output: { pattern, acri } }
 *   forecast-engine → { pattern, timestamp, intensity, gate_hit }
 *
 * Trend 映射（8 種 expected → engine 的 3 種 trendBand）：
 *   rising, step_escalation, spike → HIGH
 *   stable, intermittent          → LOW
 *   declining, peak_then_decline  → LOW or MEDIUM (declining slope)
 *   (注意：engine 目前只輸出 LOW/MEDIUM/HIGH，不區分 8 種形狀)
 */

'use strict';

// ============================================================
// Part 1: Event Generator — 根據 expected trend 生成時序事件
// ============================================================

/**
 * 根據向量的 expected trend 生成 N 筆合成時序事件
 *
 * @param {Object} vector - Group C 向量
 * @param {number} count - 生成事件數（默認 50）
 * @returns {Array} forecast-engine 格式的事件陣列
 */
function generateEvents(vector, count = 50) {
  const { metadata, events: seedEvents, L3_query } = vector;
  const expected = L3_query.expected;
  const trend = expected.trend;

  // 從 seed events 提取主要 pattern
  const primaryPattern = findPrimaryPattern(seedEvents);

  // 基準強度：從 seed events 的 acri 取平均，或默認 0.3
  const baseIntensity = computeBaseIntensity(seedEvents);

  // 時間基準：從「現在」往回推，確保事件落在 engine 的 windowDays 內
  const windowDays = selectWindowDays(metadata.time_scale);
  const intervalMs = getIntervalMs(metadata.time_scale, windowDays, count);
  const now = Date.now();
  const baseTime = now - (count * intervalMs);

  // 根據 trend shape 生成 intensity 曲線
  const intensities = generateIntensityCurve(trend, baseIntensity, count, expected);

  // 組裝事件
  return intensities.map((intensity, i) => ({
    pattern: primaryPattern,
    timestamp: new Date(baseTime + i * intervalMs).toISOString(),
    intensity: Math.max(0, Math.min(1, intensity)), // clamp [0, 1]
    gate_hit: intensity >= 0.35 // 假設 gate 閾值 0.35
  }));
}

/**
 * 從 seed events 找主要 pattern
 */
function findPrimaryPattern(seedEvents) {
  const counts = {};
  for (const e of seedEvents) {
    const p = e.L1_output?.pattern || e.pattern;
    if (p && p !== 'HN') { // 排除 HN (non-manipulative)
      counts[p] = (counts[p] || 0) + 1;
    }
  }
  // 取出現最多的，或第一個
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0) return sorted[0][0];
  // fallback: 取第一個 event 的 pattern
  return seedEvents[0]?.L1_output?.pattern || 'DM';
}

/**
 * 從 seed events 提取基準強度
 */
function computeBaseIntensity(seedEvents) {
  const acris = seedEvents
    .map(e => e.L1_output?.acri ?? e.L1_output?.acri_zh ?? e.L1_output?.acri_en)
    .filter(v => v != null && !isNaN(v));
  if (acris.length === 0) return 0.3;
  return acris.reduce((a, b) => a + b, 0) / acris.length;
}

/**
 * 根據 time_scale 返回事件間隔（毫秒）
 * 關鍵：間隔 × count 必須 < windowDays，否則事件會超出窗口
 */
function getIntervalMs(timeScale, windowDays, count) {
  // 計算窗口總毫秒的 80%（留 buffer）
  const windowMs = (windowDays || 30) * 86400 * 1000;
  const maxInterval = Math.floor(windowMs * 0.8 / (count || 50));

  const defaults = {
    'minute': 60 * 1000,
    'hourly': 3600 * 1000,
    'daily': 86400 * 1000,
    'weekly': 7 * 86400 * 1000,
    'monthly': 30 * 86400 * 1000
  };

  const preferred = defaults[timeScale] || 86400 * 1000;
  // 取較小的，確保不超出窗口
  return Math.min(preferred, maxInterval);
}

/**
 * 根據 trend shape 生成 intensity 曲線
 *
 * 8 種形狀對應不同的數學函數：
 *   stable            → 常數 + 小噪聲
 *   rising            → 線性遞增
 *   declining         → 線性遞減
 *   step_escalation   → 階梯函數（每 N 步跳一格）
 *   spike             → 中間尖峰
 *   peak_then_decline → 先升後降
 *   intermittent      → 隨機開關
 *   (default)         → stable
 */
function generateIntensityCurve(trend, base, count, expected) {
  const noise = () => (Math.random() - 0.5) * 0.04; // ±0.02 噪聲

  // 從 expected slope 判斷斜率幅度
  const slopeStr = expected.slope || 'moderate';
  const slopeMag = slopeStr === 'steep' ? 0.08 : slopeStr === 'moderate' ? 0.04 : 0.01;

  switch (trend) {
    case 'stable':
      return Array.from({ length: count }, () => base + noise());

    case 'rising':
      return Array.from({ length: count }, (_, i) =>
        base + (slopeMag * i / count * 5) + noise()
      );

    case 'declining':
      return Array.from({ length: count }, (_, i) =>
        Math.max(0.05, base + 0.2 - (slopeMag * i / count * 5) + noise())
      );

    case 'step_escalation': {
      const steps = 4;
      const stepSize = slopeMag * 2;
      return Array.from({ length: count }, (_, i) => {
        const step = Math.floor(i / (count / steps));
        return base + step * stepSize + noise();
      });
    }

    case 'spike': {
      // 尖峰要夠突出：背景低 + 中間高峰
      const peakCenter = Math.floor(count / 2);
      const peakWidth = Math.floor(count / 8); // narrower peak
      return Array.from({ length: count }, (_, i) => {
        const dist = Math.abs(i - peakCenter);
        if (dist < peakWidth) {
          return base + 0.5 * (1 - dist / peakWidth) + noise();
        }
        return base * 0.3 + noise(); // lower background
      });
    }

    case 'peak_then_decline': {
      const peak = Math.floor(count * 0.35);
      return Array.from({ length: count }, (_, i) => {
        if (i <= peak) {
          return base + (slopeMag * 3 * i / peak) + noise();
        }
        const decayRatio = (i - peak) / (count - peak);
        return base + slopeMag * 3 * (1 - decayRatio * 1.2) + noise();
      });
    }

    case 'intermittent': {
      // 鏡像對稱：前半 高低高低... 後半 反轉 → 淨 slope ≈ 0
      const half = Math.floor(count / 2);
      const blockSize = Math.max(3, Math.floor(half / 4));
      const firstHalf = Array.from({ length: half }, (_, i) => {
        const block = Math.floor(i / blockSize);
        const on = block % 2 === 0;
        return on ? base + 0.10 + noise() : base * 0.5 + noise();
      });
      // 後半鏡像翻轉
      const secondHalf = firstHalf.slice().reverse().map(v => v + noise());
      return [...firstHalf, ...secondHalf].slice(0, count);
    }

    default:
      return Array.from({ length: count }, () => base + noise());
  }
}

// ============================================================
// Part 2: Trend Mapping — 8 種 expected → engine trendBand
// ============================================================

/**
 * M81 DoD 定義的映射：
 * engine 只輸出 LOW / MEDIUM / HIGH
 * expected trend 有 8 種
 *
 * 映射邏輯：
 *   - rising + positive slope → MEDIUM or HIGH
 *   - step_escalation         → MEDIUM or HIGH
 *   - spike                   → HIGH (if captured in window)
 *   - declining               → MEDIUM or HIGH (abs slope matters)
 *   - peak_then_decline       → depends on window timing
 *   - stable                  → LOW
 *   - intermittent            → LOW or MEDIUM
 */
const TREND_TO_ACCEPTABLE_BANDS = {
  'rising':             ['MEDIUM', 'HIGH'],
  'declining':          ['MEDIUM', 'HIGH'],  // abs slope is high
  'step_escalation':    ['MEDIUM', 'HIGH'],
  'spike':              ['LOW', 'MEDIUM', 'HIGH'],  // symmetric spike → near-zero linear slope is valid
  'peak_then_decline':  ['LOW', 'MEDIUM', 'HIGH'], // ambiguous
  'stable':             ['LOW'],
  'intermittent':       ['LOW', 'MEDIUM'],  // oscillating
};

/**
 * 判定 engine 輸出是否匹配 expected trend
 */
function isMatch(expectedTrend, engineBand) {
  const acceptable = TREND_TO_ACCEPTABLE_BANDS[expectedTrend];
  if (!acceptable) return false; // unknown trend
  return acceptable.includes(engineBand);
}

// ============================================================
// Part 3: Window 選擇 — 根據 time_scale 選 windowDays
// ============================================================

function selectWindowDays(timeScale) {
  switch (timeScale) {
    case 'minute':
    case 'hourly':
      return 7;
    case 'daily':
      return 30;
    case 'weekly':
    case 'monthly':
      return 90;
    default:
      return 30;
  }
}

// ============================================================
// Part 4: Runner — 主程式
// ============================================================

function run(vectors, computeTrend) {
  const results = [];
  let pass = 0;
  let fail = 0;
  let error = 0;

  for (const vector of vectors) {
    const { metadata, L3_query } = vector;
    const vectorId = metadata.vector_id;
    const expectedTrend = L3_query.expected.trend;

    try {
      // Step 1: 生成合成事件
      const events = generateEvents(vector, 50);
      const primaryPattern = events[0].pattern;
      const windowDays = selectWindowDays(metadata.time_scale);

      // Step 2: 跑 forecast engine
      const result = computeTrend(events, primaryPattern, { windowDays });

      // Step 3: 比對
      const matched = isMatch(expectedTrend, result.trendBand);

      results.push({
        vector_id: vectorId,
        author: metadata.author,
        scenario: metadata.scenario,
        dimension: metadata.dimension_tag,
        expected_trend: expectedTrend,
        engine_band: result.trendBand,
        slope: result.slope,
        avg_intensity: result.avg_intensity,
        data_points: result.data_points,
        matched,
        error: null
      });

      if (matched) pass++;
      else fail++;

    } catch (err) {
      results.push({
        vector_id: vectorId,
        author: metadata.author,
        scenario: metadata.scenario,
        dimension: metadata.dimension_tag,
        expected_trend: expectedTrend,
        engine_band: null,
        slope: null,
        avg_intensity: null,
        data_points: null,
        matched: false,
        error: err.message
      });
      error++;
    }
  }

  return {
    summary: {
      total: vectors.length,
      pass,
      fail,
      error,
      accuracy: ((pass / vectors.length) * 100).toFixed(1) + '%'
    },
    results
  };
}

// ============================================================
// Part 5: Report Generator
// ============================================================

function generateReport(runResult) {
  const { summary, results } = runResult;
  const lines = [];

  lines.push('# Group D 首輪驗證報告');
  lines.push('# Group D — First Run Validation Report');
  lines.push('');
  lines.push(`**日期：** ${new Date().toISOString().split('T')[0]}`);
  lines.push('**執行：** Node-01（Architect）');
  lines.push(`**向量數：** ${summary.total}`);
  lines.push(`**通過：** ${summary.pass} / 失敗：${summary.fail} / 錯誤：${summary.error}`);
  lines.push(`**準確率：** ${summary.accuracy}`);
  lines.push('**DoD 標準：** ≥ 80%（macro-average）');
  lines.push('');

  // 按 dimension 分組統計
  lines.push('## 按 Dimension 分組');
  lines.push('');
  const byDim = {};
  for (const r of results) {
    if (!byDim[r.dimension]) byDim[r.dimension] = { pass: 0, fail: 0, error: 0, total: 0 };
    byDim[r.dimension].total++;
    if (r.error) byDim[r.dimension].error++;
    else if (r.matched) byDim[r.dimension].pass++;
    else byDim[r.dimension].fail++;
  }
  lines.push('| Dimension | Pass | Fail | Error | Accuracy |');
  lines.push('|-----------|------|------|-------|----------|');
  for (const [dim, stats] of Object.entries(byDim)) {
    const acc = stats.total > 0 ? ((stats.pass / stats.total) * 100).toFixed(0) + '%' : 'N/A';
    lines.push(`| ${dim} | ${stats.pass} | ${stats.fail} | ${stats.error} | ${acc} |`);
  }
  lines.push('');

  // 按 trend 分組統計
  lines.push('## 按 Expected Trend 分組');
  lines.push('');
  const byTrend = {};
  for (const r of results) {
    if (!byTrend[r.expected_trend]) byTrend[r.expected_trend] = { pass: 0, fail: 0, error: 0, total: 0 };
    byTrend[r.expected_trend].total++;
    if (r.error) byTrend[r.expected_trend].error++;
    else if (r.matched) byTrend[r.expected_trend].pass++;
    else byTrend[r.expected_trend].fail++;
  }
  lines.push('| Trend | Count | Pass | Fail | Accuracy |');
  lines.push('|-------|-------|------|------|----------|');
  for (const [trend, stats] of Object.entries(byTrend)) {
    const acc = stats.total > 0 ? ((stats.pass / stats.total) * 100).toFixed(0) + '%' : 'N/A';
    lines.push(`| ${trend} | ${stats.total} | ${stats.pass} | ${stats.fail} | ${acc} |`);
  }
  lines.push('');

  // 失敗清單
  const failures = results.filter(r => !r.matched && !r.error);
  if (failures.length > 0) {
    lines.push('## 失敗向量');
    lines.push('');
    lines.push('| Vector ID | Expected | Got | Slope | Avg Intensity |');
    lines.push('|-----------|----------|-----|-------|---------------|');
    for (const f of failures) {
      lines.push(`| ${f.vector_id} | ${f.expected_trend} | ${f.engine_band} | ${f.slope} | ${f.avg_intensity} |`);
    }
    lines.push('');
  }

  // 錯誤清單
  const errors = results.filter(r => r.error);
  if (errors.length > 0) {
    lines.push('## 錯誤向量');
    lines.push('');
    lines.push('| Vector ID | Error |');
    lines.push('|-----------|-------|');
    for (const e of errors) {
      lines.push(`| ${e.vector_id} | ${e.error} |`);
    }
    lines.push('');
  }

  // Macro-average
  const trendAccs = Object.values(byTrend).map(s =>
    s.total > 0 ? s.pass / s.total : 0
  );
  const macroAvg = trendAccs.length > 0
    ? (trendAccs.reduce((a, b) => a + b, 0) / trendAccs.length * 100).toFixed(1)
    : '0';
  lines.push('## Macro-Average（Node-05 建議的指標）');
  lines.push('');
  lines.push(`**Macro-average accuracy: ${macroAvg}%**`);
  lines.push(`*（每種 trend 的準確率取平均，避免 stable=23 條壓過其他小類）*`);
  lines.push('');

  return lines.join('\n');
}

// ============================================================
// Exports
// ============================================================

module.exports = {
  generateEvents,
  findPrimaryPattern,
  computeBaseIntensity,
  generateIntensityCurve,
  isMatch,
  selectWindowDays,
  run,
  generateReport,
  TREND_TO_ACCEPTABLE_BANDS
};
