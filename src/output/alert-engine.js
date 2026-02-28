/**
 * alert-engine.js
 * Layer 4 — 三層響應機制（Three-Level Response Mechanism）
 *
 * 來源：Charter §6.4（Node-03 提案，M31 全員認可，M32 鎖定）
 * 設計：Node-01（Architect）
 * 日期：2026-02-17
 *
 * 功能：根據 ACRI（Push）和 VRI（Vacuum）的分數，決定響應層級。
 *
 * 三層響應：
 *   Level 1 (score < 0.3): Silent Audit Trail Only — 記錄，無警報
 *   Level 2 (0.3 ≤ score < 0.7): Protocol Integrity Alert — 發送報告
 *   Level 3 (score ≥ 0.7): Structured Hand-off Protocol Activation — 嵌入移交模板
 *
 * 原則：
 *   - 這是協議行為，不是 AI 的「建議」或「勸告」
 *   - response_policy_threshold 屬 Layer 4，節點可配置
 *   - VRI_global_threshold 屬 Layer 1，不可覆蓋
 */

'use strict';

// ============================================================
// 常數
// ============================================================

const RESPONSE_LEVELS = {
  SILENT: 1,
  ALERT: 2,
  HANDOFF: 3
};

const DEFAULT_THRESHOLDS = {
  // Layer 1 全球閾值（不可覆蓋）
  VRI_GLOBAL_ALERT: 0.3,
  VRI_GLOBAL_HANDOFF: 0.7,
  // Layer 4 響應策略閾值（可配置）
  RESPONSE_POLICY_ALERT: 0.3,
  RESPONSE_POLICY_HANDOFF: 0.7
};

const VALID_CHANNELS = ['push', 'vacuum'];

// ============================================================
// Guards (Charter §4.3.2(d): error loudly on invalid config)
// ============================================================

/**
 * 驗證節點配置的閾值：必須為 0.0~1.0 的有限數字，否則 throw
 * @param {*} val - 傳入值
 * @param {string} name - 參數名稱（用於錯誤訊息）
 * @returns {number|undefined} 驗證後的值，或 undefined（未提供）
 */
function validateThreshold(val, name) {
  if (val === undefined || val === null) return undefined;
  const n = Number(val);
  if (!Number.isFinite(n) || n < 0 || n > 1) {
    throw new Error(`alert-engine: invalid ${name} (must be finite number 0..1, got ${val})`);
  }
  return n;
}


// ============================================================
// 核心函數
// ============================================================

/**
 * 判定單一通道的響應層級
 * @param {number} score - ACRI 或 VRI 分數（0.0 ~ 1.0）
 * @param {Object} thresholds - 閾值配置
 * @param {number} thresholds.alert - Alert 觸發閾值
 * @param {number} thresholds.handoff - Hand-off 觸發閾值
 * @returns {number} 響應層級（1/2/3）
 */
function classifyLevel(score, thresholds) {
  if (score >= thresholds.handoff) return RESPONSE_LEVELS.HANDOFF;
  if (score >= thresholds.alert) return RESPONSE_LEVELS.ALERT;
  return RESPONSE_LEVELS.SILENT;
}

/**
 * 生成響應描述
 * @param {number} level - 響應層級
 * @param {string} channel - 通道名稱
 * @returns {string}
 */
function describeLevel(level, channel) {
  const channelLabel = channel === 'push' ? 'Push-Risk' : 'Pull-Vacuum';
  switch (level) {
    case RESPONSE_LEVELS.SILENT:
      return `[${channelLabel}] Level 1: Silent Audit Trail`;
    case RESPONSE_LEVELS.ALERT:
      return `[${channelLabel}] Level 2: Protocol Integrity Alert`;
    case RESPONSE_LEVELS.HANDOFF:
      return `[${channelLabel}] Level 3: Structured Hand-off Activation`;
    default:
      return `[${channelLabel}] Unknown Level`;
  }
}

/**
 * 評估偵測結果，產生響應決策
 *
 * @param {Object} detection - 偵測結果
 * @param {number} detection.acri - ACRI 分數（Push 通道）
 * @param {number} detection.vri - VRI 分數（Vacuum 通道），可為 null
 * @param {string} detection.pattern - 觸發的 Pattern
 * @param {string} detection.timestamp - 偵測時間戳
 * @param {Object} [nodeConfig] - 節點配置（Layer 4 可自訂）
 * @param {number} [nodeConfig.responsePolicyAlert] - 本地 Alert 閾值
 * @param {number} [nodeConfig.responsePolicyHandoff] - 本地 Hand-off 閾值
 * @returns {Object} 響應決策
 */
function evaluate(detection, nodeConfig = {}) {
  // ---- 輸入驗證 ----

  if (!detection || typeof detection !== 'object') {
    throw new TypeError('detection must be a non-null object');
  }

  if (typeof detection.acri !== 'number' || detection.acri < 0 || detection.acri > 1) {
    throw new Error(`Invalid ACRI score: ${detection.acri}. Must be 0.0 ~ 1.0`);
  }

  if (detection.vri !== null && detection.vri !== undefined) {
    if (typeof detection.vri !== 'number' || detection.vri < 0 || detection.vri > 1) {
      throw new Error(`Invalid VRI score: ${detection.vri}. Must be 0.0 ~ 1.0 or null`);
    }
  }

  // ---- 閾值合併（Layer 4 節點配置覆蓋預設）----

    const thresholds = {
    alert: validateThreshold(nodeConfig.responsePolicyAlert, 'responsePolicyAlert')
      ?? DEFAULT_THRESHOLDS.RESPONSE_POLICY_ALERT,
    handoff: validateThreshold(nodeConfig.responsePolicyHandoff, 'responsePolicyHandoff')
      ?? DEFAULT_THRESHOLDS.RESPONSE_POLICY_HANDOFF
  };

  // ---- Push 通道評估 ----

  const pushLevel = classifyLevel(detection.acri, thresholds);

  // ---- Vacuum 通道評估（若有 VRI）----

  let vacuumLevel = null;
  if (detection.vri !== null && detection.vri !== undefined) {
    // VRI 使用全球閾值（Layer 1，不可覆蓋）+ 本地響應閾值取較高者
    const vriThresholds = {
      alert: Math.max(DEFAULT_THRESHOLDS.VRI_GLOBAL_ALERT, thresholds.alert),
      handoff: Math.max(DEFAULT_THRESHOLDS.VRI_GLOBAL_HANDOFF, thresholds.handoff)
    };
    vacuumLevel = classifyLevel(detection.vri, vriThresholds);
  }

  // ---- 最終響應層級 = 兩通道取最高 ----

  const effectiveLevel = Math.max(pushLevel, vacuumLevel || 0);

  // ---- 構建輸出 ----

  const response = {
    timestamp: detection.timestamp || new Date().toISOString(),
    pattern: detection.pattern,
    channels: {
      push: {
        score: detection.acri,
        level: pushLevel,
        description: describeLevel(pushLevel, 'push')
      }
    },
    effective_level: effectiveLevel,
    requires_handoff: effectiveLevel === RESPONSE_LEVELS.HANDOFF,
    requires_alert: effectiveLevel >= RESPONSE_LEVELS.ALERT
  };

  if (detection.vri !== null && detection.vri !== undefined) {
    response.channels.vacuum = {
      score: detection.vri,
      level: vacuumLevel,
      description: describeLevel(vacuumLevel, 'vacuum')
    };
  }

  return response;
}

// ============================================================
// 匯出
// ============================================================

module.exports = {
  evaluate,
  classifyLevel,
  RESPONSE_LEVELS,
  DEFAULT_THRESHOLDS
};
