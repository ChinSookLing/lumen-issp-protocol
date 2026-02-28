/**
 * dispatcher.js
 * Sprint 8 — Minimal Pipeline Dispatcher
 *
 * 純路由模組，不含業務邏輯。依序呼叫各層，傳遞標準化 Event/Aggregate。
 * Pure routing module, no business logic. Calls each layer in sequence.
 *
 * 設計：Node-01 (Architect)，基於 M69 Council 共識
 * 日期：2026-02-17
 *
 * 數據流：
 *   Input → L1 (evaluate) → L2 (mapper) → Event
 *   Event[] → L3 (forecast) → Aggregate
 *   Aggregate → L4 (alert + format + handoff)
 */

"use strict";

const crypto = require("crypto");

// === Layer 1: Protocol Core ===
const { evaluate: l1Evaluate } = require("../../core/evaluator");

// === Layer 2: Mapping ===
const MapperLoader = require("../mapper/MapperLoader");

// === Layer 3: Forecast ===
const { computeTrend } = require("../forecast/forecast-engine");

// === Layer 4: Output ===
const { evaluate: l4Evaluate } = require("../output/alert-engine");
const { format: l4Format } = require("../output/output-formatter");
const { generate: l4Handoff } = require("../output/handoff-template");
// === Explanation SAFE Mode ===
const { generateSafeExplanation } = require("../explanation/safe-mode");

// ============================================================
// Helper: Adapt L1 raw output to flat detection format
// L1 outputs { channels: { push: {...}, vacuum: {...} } }
// L4 expects { acri, vri, response_level, patterns, ... }
// ============================================================

function adaptL1toFlat(raw) {
  const pushCh = raw.channels?.push || {};
  const vacuumCh = raw.channels?.vacuum || {};
  return {
    acri: pushCh.acri ?? 0,
    vri: vacuumCh.vri ?? 0,
    response_level: raw.response_level ?? 0,
    patterns: [...(pushCh.patterns || []), ...(vacuumCh.patterns || [])],
    pattern: (pushCh.patterns?.[0]?.id) || null,
    channel: (pushCh.acri ?? 0) > 0 ? "push" : "vacuum",
    gate_hits: {
      push: pushCh.gate || {},
      vacuum: vacuumCh.gate || {}
    },
    evidence: raw.evidence || null
  };
}

// ============================================================
// 1. Event Builder — L1 + L2 → Event schema
// ============================================================

/**
 * Process a single message through Layer 1 + Layer 2
 * @param {string} input - Raw text input
 * @param {object} options
 * @param {string} options.source - Source identifier (e.g. 'telegram')
 * @param {string} options.nodeId - Node identifier
 * @param {string} options.lang - Language code ('en' | 'zh-TW' | 'zh-CN')
 * @returns {object} Event schema object
 */
function processMessage(input, options = {}) {
  const { source = "unknown", nodeId = "default", lang = "en" } = options;

  // --- Layer 1: Detection ---
  const raw = l1Evaluate(input);
  const det = adaptL1toFlat(raw);

  // --- Layer 2: Component Mapping ---
  const components = {};
  for (const p of det.patterns) {
    const pid = p.id || p.pattern;
    if (!pid) continue;
    try {
      const loader = new MapperLoader(pid, lang);
      const mappings = loader.patternMapping?.mappings || {};
      const patternComp = {};
      for (const [, rule] of Object.entries(mappings)) {
        if (rule && rule.component) {
          const score = loader.getComponentScore(input, rule.component);
          if (score > 0) patternComp[rule.component] = score;
        }
      }
      if (Object.keys(patternComp).length > 0) {
        components[pid] = patternComp;
      }
    } catch (_) {
      // Mapping not available for this pattern/lang — skip
    }
  }

  // --- Build Event ---
  const inputHash = crypto
    .createHash("sha256")
    .update(input)
    .digest("hex")
    .slice(0, 16);

  return {
    event_id: `evt_${Date.now()}_${inputHash.slice(0, 8)}`,
    timestamp: new Date().toISOString(),
    source,
    node_id: nodeId,
    lang,
    input_hash: inputHash,
    layers: {
      layer1: {
        patterns: det.patterns,
        acri: det.acri,
        vri: det.vri,
        response_level: det.response_level,
        gate_hits: det.gate_hits
      },
      layer2: {
        components,
        mapping_version: "v0.1.0"
      }
    },
    _detection: det // Internal: flat detection for L4 passthrough
  };
}

// ============================================================
// 2. Forecast Runner — Event[] → L3 → Aggregate
// ============================================================

/**
 * Run Layer 3 forecast on accumulated events
 * @param {object[]} events - Array of Event objects from processMessage
 * @param {string} targetPattern - Pattern to forecast (e.g. 'MB')
 * @param {object} options
 * @param {number} options.windowDays - Forecast window in days (default 7)
 * @returns {object} Aggregate schema object
 */
function runForecast(events, targetPattern, options = {}) {
  const { windowDays = 7 } = options;

  
      const trendInput = events
    .filter(
      (e) =>
        e.layers?.layer1?.patterns?.some(
          (p) => (p.id || p.pattern) === targetPattern
        )
    )
    .map((e) => {
      const matched = e.layers.layer1.patterns.find(
        (p) => (p.id || p.pattern) === targetPattern
      );
      return {
        timestamp: e.timestamp,
        pattern: targetPattern,
        intensity: matched?.confidence ?? matched?.score ?? 0,
        gate_hit: Object.values(e.layers?.layer1?.gate_hits?.push || {}).some(Boolean)
      };
    });

  let forecast = null;
  if (trendInput.length >= 2) {
    try {
      forecast = computeTrend(trendInput, targetPattern, { windowDays });
    } catch (_) {
      // Not enough data — forecast stays null
    }
  }

  return {
    aggregate_id: `agg_${Date.now()}`,
    timestamp: new Date().toISOString(),
    window_days: windowDays,
    target_pattern: targetPattern,
    data_points: trendInput.length,
    event_refs: events.map((e) => e.event_id),
    forecast
  };
}

// ============================================================
// 3. Output Runner — Detection + Aggregate → L4 → Final Output
// ============================================================

/**
 * Run Layer 4 output pipeline
 * @param {object} det - Flat detection object (from adaptL1toFlat)
 * @param {object} aggregate - Aggregate from runForecast (optional)
 * @param {object} nodeConfig - Node-specific configuration
 * @returns {object} Final output object
 */
function runOutput(det, aggregate = null, nodeConfig = {}) {
  const { formatType = "dashboard", lang = "en" } = nodeConfig;

  // --- Layer 4a: Alert Engine ---
  const alertResult = l4Evaluate(det, nodeConfig);

  // --- Layer 4b: Output Formatter ---
  const forecast = aggregate ? aggregate.forecast : null;
  const formatted = l4Format(formatType, det, forecast, nodeConfig);

  // --- Layer 4c: Handoff (only if Level 3) ---
  let handoff = null;
  if (alertResult.response_level >= 3 || alertResult.requires_handoff) {
    try {
      handoff = l4Handoff({
        lang: lang === "en" ? "en" : lang === "zh-CN" ? "zh-simp" : "zh-trad",
        pattern: det.pattern || "unknown",
        score: det.acri || det.vri || 0,
        channel: det.channel || "push"
      });
    } catch (_) {
      // Handoff generation failed — continue without
    }
  }

  // --- SAFE Explanation ---
  const explanation = generateSafeExplanation(det, { purpose: nodeConfig.purpose || "internal" });

  return {
    alert: alertResult,
    output: formatted,
    handoff,
    explanation,
    meta: {
      format: formatType,
      lang,
      has_forecast: forecast !== null,
      has_handoff: handoff !== null
    }
  };
}

// ============================================================
// 4. Full Pipeline — End-to-End (single message convenience)
// ============================================================

/**
 * Process a single message end-to-end through all 4 layers
 * @param {string} input - Raw text input
 * @param {object} options - Pipeline options
 * @returns {object} Complete pipeline result
 */
function pipeline(input, options = {}) {
  // L1 + L2 → Event
  const event = processMessage(input, options);

  // Use the flat detection stored in event
  const det = event._detection;

  // L4 → Output (skip L3 for single message)
  const output = runOutput(det, null, options);

  return {
    event,
    aggregate: null,
    output,
    pipeline_version: "0.1.0"
  };
}

// ============================================================
// Exports
// ============================================================

module.exports = {
  processMessage, // L1 + L2 → Event
  runForecast, // Event[] → L3 → Aggregate
  runOutput, // Detection + Aggregate → L4 → Output
  pipeline, // Single message end-to-end convenience
  adaptL1toFlat // L1 raw → flat detection (used by accumulator)
};
