// src/dashboard/dashboard-store.js
// S11-DASH-01: Dashboard MVP — In-memory Store + L4→dashboard_item converter
// Owner: Node-01 (Architect)
// Spec: M90-D05 (6/6 unanimous)
//
// This module:
//   1. Converts pipeline result → dashboard_item (whitelist contract)
//   2. Maintains an in-memory ring buffer of recent items
//   3. Provides getRecent() and getById() for API endpoints
//
// Red Lines (R1-R9):
//   R1: No ranking by person
//   R2: No relationship graph
//   R3: No reverse tracing (no raw_text)
//   R5: All queries by requestId, never userId
//   R9: Dashboard reads dashboard_item, not L4 export directly

'use strict';

const crypto = require('node:crypto');

// ============================================================
// Configuration
// ============================================================

const STORE_CONFIG = {
  MAX_ITEMS: 100,         // Ring buffer size
  DEFAULT_PAGE_SIZE: 20,  // GET /api/recent default
};

// ============================================================
// Ring buffer store
// ============================================================

/** @type {Map<string, Object>} item_id → dashboard_item */
const itemMap = new Map();

/** @type {string[]} ordered item_ids (newest last) */
const itemOrder = [];

// ============================================================
// L4 pipeline result → dashboard_item converter
// ============================================================

/**
 * Convert a pipeline result into a dashboard_item that conforms
 * to dashboard_item.v0.1 schema (whitelist contract).
 *
 * This is the R9 isolation layer — Dashboard never reads L4 export directly.
 *
 * @param {Object} pipelineResult - From runOutput() in webhook
 * @param {Object} meta - Additional metadata
 * @param {string} meta.chatId - Chat identifier (will be hashed)
 * @param {string} meta.source - 'telegram' | 'web' | etc.
 * @param {string} meta.trigger_reason - accumulator trigger reason
 * @param {string} [meta.request_id] - Optional explicit request_id
 * @returns {Object} dashboard_item conforming to schema
 */
function toDashboardItem(pipelineResult, meta = {}) {
  const now = new Date().toISOString();
  const requestId = meta.request_id || `req-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const itemId = `dash-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

  const alert = pipelineResult?.alert || {};
  const level = alert.effective_level || 1;
  const acri = alert.channels?.push?.score || 0;

  // Badge mapping — R1 compliant (no ranking, only categorical)
  const badgeMap = { 1: 'blue', 2: 'blue', 3: 'yellow', 4: 'orange', 5: 'orange' };
  const badge = badgeMap[level] || 'unknown';

  // Badge emoji
  const emojiMap = { blue: '🔵', yellow: '🟡', orange: '🟠' };

  // Pattern flags — top 5 (R3 compliant: no raw text, only pattern names)
  const patterns = (pipelineResult?.event?.layers?.layer1?.patterns || [])
    .map(p => p.id || p)
    .slice(0, 5);

  // Simple advice — SAFE mode compliant (no accusations, no diagnosis)
  const adviceMap = {
    1: 'No significant structural signals detected.',
    2: 'Low-level structural pattern observed. Context recommended.',
    3: 'Moderate structural signal detected. Consider discussing with someone you trust.',
    4: 'Elevated structural patterns detected. Review with a trusted person recommended.',
    5: 'Multiple structural signals detected. Seeking support is recommended.',
  };

  // Confidence levels from pipeline
  const confidence = {};
  if (pipelineResult?.event?.layers?.layer3) {
    const l3 = pipelineResult.event.layers.layer3;
    if (l3.forecast_confidence) confidence.stat = l3.forecast_confidence;
    if (l3.rule_confidence) confidence.rule = l3.rule_confidence;
  }

  return {
    item_id: itemId,
    time_utc: now,
    source: meta.source || 'telegram',
    request: {
      request_id: requestId,
      // R5: chatId is hashed, never raw — prevents individual tracking
      ...(meta.chatId ? { chat_id: hashId(String(meta.chatId)) } : {}),
      scenario: 'monitoring_brief',
      domain: pipelineResult?.domain || 'unknown',
      time_scale: 'multi_turn',
      tier: 0,
      purpose: 'internal',
    },
    view: {
      mode: 'tier0_readonly',
      tier0_readonly: true,
    },
    badge,
    ...(emojiMap[badge] ? { badge_emoji: emojiMap[badge] } : {}),
    simple_advice: adviceMap[level] || adviceMap[1],
    top_flags: patterns,
    ...(Object.keys(confidence).length > 0 ? { confidence } : {}),
    redaction_state: 'redacted',
    links: {
      l4_export_json: `/api/item/${requestId}`,
    },
    // R9: Explicit proof this item is safe for dashboard
    sensitive_excluded: {
      no_raw_text: true,
      no_scores: true,
      no_evidence_detail: true,
    },
  };
}

/**
 * Hash an ID for privacy (R5 compliance).
 * @param {string} id
 * @returns {string} First 16 chars of SHA-256
 */
function hashId(id) {
  return crypto.createHash('sha256').update(id).digest('hex').slice(0, 16);
}

// ============================================================
// Store operations
// ============================================================

/**
 * Store a new dashboard item. Evicts oldest if buffer is full.
 * @param {Object} item - dashboard_item conforming to schema
 * @returns {Object} The stored item
 */
function store(item) {
  if (!item || !item.item_id) return null;

  // Evict oldest if at capacity
  while (itemOrder.length >= STORE_CONFIG.MAX_ITEMS) {
    const oldestId = itemOrder.shift();
    itemMap.delete(oldestId);
  }

  itemMap.set(item.item_id, item);
  itemOrder.push(item.item_id);

  return item;
}

/**
 * Add a pipeline result to the store.
 * Converts to dashboard_item first, then stores.
 * @param {Object} pipelineResult
 * @param {Object} meta
 * @returns {Object} The stored dashboard_item
 */
function addResult(pipelineResult, meta = {}) {
  const item = toDashboardItem(pipelineResult, meta);
  return store(item);
}

/**
 * Get recent items (newest first).
 * @param {number} [limit=20]
 * @returns {Object[]} Array of dashboard_items
 */
function getRecent(limit = STORE_CONFIG.DEFAULT_PAGE_SIZE) {
  const n = Math.min(Math.max(1, limit), STORE_CONFIG.MAX_ITEMS);
  const ids = itemOrder.slice(-n).reverse();
  return ids.map(id => itemMap.get(id)).filter(Boolean);
}

/**
 * Get a single item by request_id.
 * @param {string} requestId
 * @returns {Object|null}
 */
function getByRequestId(requestId) {
  for (const item of itemMap.values()) {
    if (item.request?.request_id === requestId) {
      return item;
    }
  }
  return null;
}

/**
 * Get a single item by item_id.
 * @param {string} itemId
 * @returns {Object|null}
 */
function getById(itemId) {
  return itemMap.get(itemId) || null;
}

/**
 * Get store stats.
 * @returns {{ count: number, maxItems: number }}
 */
function getStats() {
  return {
    count: itemMap.size,
    maxItems: STORE_CONFIG.MAX_ITEMS,
  };
}

/**
 * Clear all items (for testing).
 */
function clearAll() {
  itemMap.clear();
  itemOrder.length = 0;
}

module.exports = {
  // Converter
  toDashboardItem,
  hashId,

  // Store
  store,
  addResult,
  getRecent,
  getByRequestId,
  getById,
  getStats,
  clearAll,

  // Config (read-only for tests)
  STORE_CONFIG,
};
