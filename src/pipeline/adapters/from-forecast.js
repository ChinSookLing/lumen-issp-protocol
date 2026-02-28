/**
 * from-forecast.js
 * Adapter: L3 forecast aggregate → L4 alert-engine input
 *
 * 設計：Node-05（Sprint 8 提案）
 * 實作：Node-01（Architect）
 * 日期：2026-02-18
 *
 * 職責：
 *   - 將 runForecast() 的 aggregate 轉換為 forecast-to-alert.v1 contract
 *   - 將 contract 轉換為 alert-engine 期待的 flat detection 格式
 *   - 不做道德化、不做外部動作
 */
'use strict';

const crypto = require('crypto');

// ============================================================
// 1. Aggregate → Contract (forecast-to-alert.v1)
// ============================================================

/**
 * Convert dispatcher's runForecast aggregate to contract payload
 * @param {object} aggregate - From dispatcher.runForecast()
 * @param {object} options
 * @param {string} options.chatId - Chat/group identifier
 * @param {string} options.commitHash - Current git commit
 * @param {string} options.operatorMode - 'live' | 'test' | 'audit'
 * @returns {object} forecast-to-alert.v1 contract payload
 */
function aggregateToContract(aggregate, options = {}) {
  const {
    chatId = 'unknown',
    commitHash = 'unknown',
    operatorMode = 'test'
  } = options;

  if (!aggregate) {
    throw new Error('from-forecast: aggregate is null or undefined');
  }

  const forecast = aggregate.forecast || {};
  const now = new Date().toISOString();
  const windowDays = aggregate.window_days || 7;

  // Calculate window boundaries
  const toDate = new Date(aggregate.timestamp || now);
  const fromDate = new Date(toDate);
  fromDate.setDate(fromDate.getDate() - windowDays);

  return {
    time_utc: now,
    chat_id: chatId,
    window: {
      from_utc: fromDate.toISOString(),
      to_utc: toDate.toISOString(),
      size: windowDays
    },
    forecast: {
      trend: forecast.trendBand || forecast.trend || 'stable',
      intensity: forecast.avg_intensity ?? 0,
      gate_hit: forecast.gate_hit ?? 0,
      top_patterns: aggregate.target_pattern
        ? [aggregate.target_pattern]
        : []
    },
    evidence_ids: aggregate.event_refs || [],
    build_fingerprint: {
      build_id: `build_${crypto.randomBytes(4).toString('hex')}`,
      commit_hash: commitHash,
      operator_mode: operatorMode
    }
  };
}

// ============================================================
// 2. Contract → AlertCandidate (flat detection for alert-engine)
// ============================================================

/**
 * Convert contract payload to alert-engine's expected flat format
 * @param {object} contract - forecast-to-alert.v1 payload
 * @returns {object} Flat detection object for l4Evaluate()
 */
function contractToAlertInput(contract) {
  if (!contract || !contract.forecast) {
    throw new Error('from-forecast: contract missing forecast field');
  }

  const f = contract.forecast;

  // Map trend intensity to ACRI-like score for alert classification
  const score = f.intensity ?? 0;

  return {
    acri: score,
    vri: 0,
    response_level: score >= 0.7 ? 3 : score >= 0.3 ? 2 : 1,
    patterns: f.top_patterns.map(p => ({
      id: p,
      confidence: score
    })),
    pattern: f.top_patterns[0] || null,
    channel: 'push',
    gate_hits: {
      push: { gate_hit: f.gate_hit },
      vacuum: {}
    },
    // Traceability fields (pass-through)
    _forecast_contract: contract
  };
}

module.exports = {
  aggregateToContract,
  contractToAlertInput
};
