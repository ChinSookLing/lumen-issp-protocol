// src/output/view-engine.js
// L4 View Integration — stripFields + applyView
// Based on: Node-04 dashboard-views-v0.1.json (c152)
// Implements: L4-close-02
//
// Three views:
//   auditor    — Compliance Officer (full audit, PII redacted)
//   user_guard — End User (no scores, no internals, strict PII)
//   hitl_review — HITL Moderator (redacted PII, decision support)
//
// Author: Node-01 (Architect), spec by Node-04 (Visionary)
// Date: 2026-02-25

'use strict';

// View definitions from dashboard-views-v0.1.json
const VIEW_DEFINITIONS = {
  auditor: {
    visible: new Set([
      'turn_id', 'timestamp', 'acri_score', 'momentum_score',
      'motif_id', 'evidence_chain_hash', 'l1_keywords', 'l2_vector_id'
    ]),
    hidden: new Set(['user_real_name', 'plain_text_payload']),
    pii_policy: 'redacted',
  },
  user_guard: {
    visible: new Set([
      'risk_level_color', 'threat_type_label', 'simple_advice', 'contextual_warning'
    ]),
    hidden: new Set([
      'acri_score', 'momentum_score', 'l2_vector_id', 'internal_logs'
    ]),
    pii_policy: 'strict',
  },
  hitl_review: {
    visible: new Set([
      'risk_label', 'motif_description', 'context_summary', 'decision_support_flag'
    ]),
    hidden: new Set(['user_identity_metadata', 'cross_platform_links']),
    pii_policy: 'redacted',
  },
};

// Fields that must ALWAYS be stripped regardless of view (§2.2 compliance)
const ALWAYS_STRIP = new Set([
  'raw_text', 'plain_text_payload', 'user_real_name',
  'input_text', 'original_message', 'user_identity_metadata',
]);

/**
 * Strip fields from a data object based on a deny list.
 * Returns a shallow copy with denied fields removed.
 *
 * @param {object} data - Source data object
 * @param {Set|string[]} denyList - Fields to remove
 * @returns {object} Filtered copy
 */
function stripFields(data, denyList) {
  if (!data || typeof data !== 'object') return data;

  const deny = denyList instanceof Set ? denyList : new Set(denyList);
  const result = {};

  for (const [key, value] of Object.entries(data)) {
    if (!deny.has(key) && !ALWAYS_STRIP.has(key)) {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Apply a named view to pipeline output.
 * Filters output to only include fields appropriate for the role.
 *
 * @param {string} viewId - 'auditor' | 'user_guard' | 'hitl_review'
 * @param {object} pipelineOutput - Output from pipeline (output.alert, output.output, etc.)
 * @returns {object} View-filtered output
 */
function applyView(viewId, pipelineOutput) {
  const viewDef = VIEW_DEFINITIONS[viewId];
  if (!viewDef) {
    throw new Error(`Unknown view: ${viewId}. Valid views: ${Object.keys(VIEW_DEFINITIONS).join(', ')}`);
  }

  if (!pipelineOutput) return null;

  const alert = pipelineOutput.alert || {};

  // Base output — always included
  const result = {
    view: viewId,
    pii_policy: viewDef.pii_policy,
    timestamp: new Date().toISOString(),
  };

  // === user_guard view: minimal, no scores ===
  if (viewId === 'user_guard') {
    const levelColors = {
      1: null,       // Silent — no output
      2: 'blue',     // 🔵
      3: 'yellow',   // 🟡
      4: 'orange',   // 🟠
      5: 'red',      // 🔴
    };

    const levelLabels = {
      2: 'Low signal detected',
      3: 'Moderate signal detected',
      4: 'Elevated signal detected',
      5: 'Attention recommended',
    };

    const level = alert.effective_level || 1;
    if (level <= 1) return null; // Silent

    result.risk_level_color = levelColors[level] || 'blue';
    result.threat_type_label = alert.pattern || 'unknown';
    result.simple_advice = 'This is an automated observation, not a diagnosis.';
    result.contextual_warning = levelLabels[level] || 'Signal detected';
    return result;
  }

  // === auditor view: full audit, PII redacted ===
  if (viewId === 'auditor') {
    result.acri_score = alert.channels?.push?.score || 0;
    result.momentum_score = pipelineOutput.explanation?.explanation || null;
    result.evidence_chain_hash = null; // TODO: implement evidence hashing
    result.effective_level = alert.effective_level;
    result.pattern = alert.pattern;
    result.requires_handoff = alert.requires_handoff || false;

    // Strip PII
    return stripFields(result, viewDef.hidden);
  }

  // === hitl_review view: decision support ===
  if (viewId === 'hitl_review') {
    result.risk_label = `Level ${alert.effective_level || 1}`;
    result.pattern = alert.pattern || 'none';
    result.motif_description = null; // TODO: link to motif engine
    result.context_summary = pipelineOutput.explanation?.explanation || 'No explanation available';
    result.decision_support_flag = alert.requires_handoff ? 'HANDOFF_RECOMMENDED' : 'MONITOR';
    result.effective_level = alert.effective_level;

    // Strip PII
    return stripFields(result, viewDef.hidden);
  }

  return result;
}

/**
 * Get list of available view IDs.
 * @returns {string[]}
 */
function getAvailableViews() {
  return Object.keys(VIEW_DEFINITIONS);
}

/**
 * Validate that a view definition exists.
 * @param {string} viewId
 * @returns {boolean}
 */
function isValidView(viewId) {
  return viewId in VIEW_DEFINITIONS;
}

module.exports = {
  stripFields,
  applyView,
  getAvailableViews,
  isValidView,
  VIEW_DEFINITIONS,
  ALWAYS_STRIP,
};
