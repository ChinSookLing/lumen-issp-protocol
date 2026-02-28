/**
 * output-formatter.js
 * Layer 4 — 輸出格式化引擎
 *
 * 功能：消費 Layer 1/2 偵測結果 + Layer 3 趨勢預測，
 *       產出三種輸出格式：Dashboard / Alert / Report
 *
 * 來源：Charter §4.4（Output Layer 定義）
 * 原則：
 *   - 語義脫敏：只輸出 Pattern 類型 + 強度，不輸出原始內容
 *   - response_policy_threshold 可配置（節點自決）
 *   - 文化因子在此層適配
 *   - Hand-off 模板必須符合「僅信息、非勸告」
 *
 * 設計：Node-01（Architect）
 * 日期：2026-02-17
 */

'use strict';

const alertEngine = require('./alert-engine');
const handoffTemplate = require('./handoff-template');

// ============================================================
// Guard: prevent raw-content leakage at Layer 4 (Charter §7.3)
// ============================================================

const DISALLOWED_KEYS = new Set([
  'raw', 'raw_text', 'text', 'transcript',
  'prompt', 'snippet', 'original', 'source_text'
]);

function assertNoRawLeak(obj, label = 'payload') {
  if (!obj || typeof obj !== 'object') return;
  const stack = [{ path: label, value: obj }];
  while (stack.length) {
    const { path, value } = stack.pop();
    if (!value || typeof value !== 'object') continue;
    const entries = Array.isArray(value)
      ? value.map((v, i) => [`[${i}]`, v])
      : Object.entries(value);
    for (const [k, v] of entries) {
      const p = `${path}.${k}`;
      if (DISALLOWED_KEYS.has(k)) {
        throw new Error(`Layer4 raw-leak guard: forbidden key "${k}" at ${p}`);
      }
      if (v && typeof v === 'object') stack.push({ path: p, value: v });
    }
  }
}


// ============================================================
// 常數
// ============================================================

const OUTPUT_FORMATS = ['dashboard', 'alert', 'report', 'api'];

// ============================================================
// Dashboard 格式
// ============================================================

/**
 * 格式化 Dashboard 輸出
 * 用途：即時顯示面板，快速概覽
 *
 * @param {Object} detection - 偵測結果
 * @param {Object} [forecast] - Layer 3 趨勢結果（可選）
 * @param {Object} [nodeConfig] - 節點配置
 * @returns {Object}
 */
function formatDashboard(detection, forecast = null, nodeConfig = {}) {
  assertNoRawLeak(detection, 'dashboard.detection');
  const alertResult = alertEngine.evaluate(detection, nodeConfig);

  const dashboard = {
    format: 'dashboard',
    generated_at: new Date().toISOString(),
    status: {
      effective_level: alertResult.effective_level,
      requires_attention: alertResult.requires_alert,
      requires_handoff: alertResult.requires_handoff
    },
    channels: alertResult.channels,
    pattern: detection.pattern,
    scores: {
      acri: detection.acri
    }
  };

  if (detection.vri !== null && detection.vri !== undefined) {
    dashboard.scores.vri = detection.vri;
  }

  // 附加 Layer 3 趨勢
  if (forecast) {
    dashboard.forecast = {
      trendBand: forecast.trendBand,
      slope: forecast.slope,
      window_days: forecast.window_days,
      probability: forecast.probability
    };
  }

  return dashboard;
}

// ============================================================
// Alert 格式
// ============================================================

/**
 * 格式化 Alert 輸出
 * 用途：即時警報推送
 *
 * @param {Object} detection - 偵測結果
 * @param {Object} [nodeConfig] - 節點配置
 * @returns {Object|null} 若為 Silent 層級則返回 null（不發送警報）
 */
function formatAlert(detection, nodeConfig = {}) {
  assertNoRawLeak(detection, 'alert.detection');
  const alertResult = alertEngine.evaluate(detection, nodeConfig);

  // Level 1 = Silent，不產生 Alert 輸出
  if (alertResult.effective_level === alertEngine.RESPONSE_LEVELS.SILENT) {
    return null;
  }

  const alert = {
    format: 'alert',
    generated_at: alertResult.timestamp,
    level: alertResult.effective_level,
    pattern: detection.pattern,
    channels: alertResult.channels,
    message: buildAlertMessage(alertResult, nodeConfig.locale || 'en')
  };

  // Level 3 附加 Hand-off 通知
  if (alertResult.requires_handoff) {
    const handoffChannel = detection.vri !== null && detection.vri !== undefined &&
      detection.vri >= detection.acri ? 'vacuum' : 'push';
    const handoffScore = handoffChannel === 'vacuum' ? detection.vri : detection.acri;

    alert.handoff = handoffTemplate.generate({
      pattern: detection.pattern,
      score: handoffScore,
      channel: handoffChannel,
      locale: nodeConfig.locale || 'en',
      resources: nodeConfig.resources || []
    });
  }

  return alert;
}

/**
 * 構建警報訊息文字
 * @param {Object} alertResult - evaluate() 的輸出
 * @param {string} locale - 語言
 * @returns {string}
 */
function buildAlertMessage(alertResult, locale) {
  const isZh = locale.startsWith('zh');

  if (alertResult.effective_level === alertEngine.RESPONSE_LEVELS.HANDOFF) {
    return isZh
      ? `偵測到高強度結構性壓力模式（${alertResult.pattern}），Structured Hand-off 協議已啟動。`
      : `High-intensity structural pressure pattern detected (${alertResult.pattern}). Structured Hand-off protocol activated.`;
  }

  return isZh
    ? `偵測到結構性壓力模式（${alertResult.pattern}），請注意觀察趨勢變化。`
    : `Structural pressure pattern detected (${alertResult.pattern}). Monitor trend changes.`;
}

// ============================================================
// Report 格式
// ============================================================

/**
 * 格式化 Report 輸出
 * 用途：定期報告、回顧分析
 *
 * @param {Object} detection - 偵測結果
 * @param {Object} [forecast] - Layer 3 趨勢結果
 * @param {Object} [nodeConfig] - 節點配置
 * @returns {Object}
 */
function formatReport(detection, forecast = null, nodeConfig = {}) {
  assertNoRawLeak(detection, 'report.detection');
  const alertResult = alertEngine.evaluate(detection, nodeConfig);

  const report = {
    format: 'report',
    generated_at: new Date().toISOString(),
    summary: {
      pattern: detection.pattern,
      acri: detection.acri,
      vri: detection.vri || null,
      effective_level: alertResult.effective_level,
      level_description: getLevelDescription(alertResult.effective_level, nodeConfig.locale || 'en')
    },
    channels: alertResult.channels,
    // 語義脫敏標記
    desensitized: true,
    contains_raw_content: false
  };

  if (forecast) {
    report.trend = {
      trendBand: forecast.trendBand,
      slope: forecast.slope,
      avg_intensity: forecast.avg_intensity,
      window_days: forecast.window_days,
      data_points: forecast.data_points,
      probability: forecast.probability,
      aligned_examples: forecast.aligned_examples
    };
  }

  return report;
}

/**
 * 層級文字描述
 */
function getLevelDescription(level, locale) {
  const isZh = locale.startsWith('zh');
  switch (level) {
    case 1: return isZh ? '靜默記錄' : 'Silent Audit Trail';
    case 2: return isZh ? '協議完整性警報' : 'Protocol Integrity Alert';
    case 3: return isZh ? 'Structured Hand-off 啟動' : 'Structured Hand-off Activation';
    default: return isZh ? '未知' : 'Unknown';
  }
}

// ============================================================
// API 格式（機器可讀）
// ============================================================

/**
 * 格式化 API 輸出
 * 用途：供外部系統消費的標準化 JSON
 *
 * @param {Object} detection - 偵測結果
 * @param {Object} [forecast] - Layer 3 趨勢結果
 * @param {Object} [nodeConfig] - 節點配置
 * @returns {Object}
 */
function formatAPI(detection, forecast = null, nodeConfig = {}) {
  assertNoRawLeak(detection, 'api.detection');
  const alertResult = alertEngine.evaluate(detection, nodeConfig);

  return {
    format: 'api',
    version: '1.0.0',
    generated_at: new Date().toISOString(),
    detection: {
      pattern: detection.pattern,
      acri: detection.acri,
      vri: detection.vri || null,
      timestamp: detection.timestamp
    },
    response: {
      effective_level: alertResult.effective_level,
      requires_handoff: alertResult.requires_handoff,
      requires_alert: alertResult.requires_alert,
      channels: alertResult.channels
    },
    forecast: forecast ? {
      trendBand: forecast.trendBand,
      slope: forecast.slope,
      probability: forecast.probability,
      window_days: forecast.window_days
    } : null,
    meta: {
      desensitized: true,
      contains_raw_content: false,
      protocol: 'ISSP',
      layer: 4
    }
  };
}

// ============================================================
// 統一入口
// ============================================================

/**
 * 根據指定格式產出對應輸出
 *
 * @param {string} format - 輸出格式（'dashboard'/'alert'/'report'/'api'）
 * @param {Object} detection - 偵測結果
 * @param {Object} [forecast] - Layer 3 趨勢結果
 * @param {Object} [nodeConfig] - 節點配置
 * @returns {Object|null}
 */
function format(formatType, detection, forecast = null, nodeConfig = {}) {
  if (!OUTPUT_FORMATS.includes(formatType)) {
    throw new Error(
      `Invalid format "${formatType}". Valid formats: ${OUTPUT_FORMATS.join(', ')}`
    );
  }

  switch (formatType) {
    case 'dashboard': return formatDashboard(detection, forecast, nodeConfig);
    case 'alert': return formatAlert(detection, nodeConfig);
    case 'report': return formatReport(detection, forecast, nodeConfig);
    case 'api': return formatAPI(detection, forecast, nodeConfig);
    default: throw new Error(`Unhandled format: ${formatType}`);
  }
}

// ============================================================
// 匯出
// ============================================================

module.exports = {
  format,
  formatDashboard,
  formatAlert,
  formatReport,
  formatAPI,
  OUTPUT_FORMATS
};
