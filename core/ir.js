/**
 * Lumen ISSP — Internal Representation (IR) v0.1
 *
 * In-memory data structures for Lumen detection pipeline.
 * Conforms to: schema.json v0.1 + Charter draft4
 *
 * Design notes:
 *   - IR is a plain-JS value object layer (no class inheritance, no side effects).
 *   - Evaluator reads input → builds IR → serialises to schema.json.
 *   - "Detect structure, not vocabulary" — IR never stores raw text.
 */

"use strict";

// ─── Constants ───────────────────────────────────────────────────────

/** Schema version this IR targets */
const IR_VERSION = "0.1.0";

/**
 * VRI response level thresholds (Charter §6.4)
 * Level 1: silent audit | Level 2: integrity alert | Level 3: hand-off
 */
const VRI_THRESHOLDS = Object.freeze({
  SILENT_AUDIT:    0.3,
  INTEGRITY_ALERT: 0.7,
});

/**
 * Three-Question Gate trigger threshold (Charter §5.1)
 * Pattern evaluation fires when hit_count >= GATE_TRIGGER
 */
const GATE_TRIGGER = 2;

// ─── Factory Functions ───────────────────────────────────────────────

/**
 * Create a Three-Question Gate result (Push channel).
 * @param {Object} opts
 * @param {boolean} opts.restricts_choice  - Q1
 * @param {boolean} opts.builds_pressure   - Q2
 * @param {boolean} opts.closes_opposition - Q3
 * @returns {Object} gate
 */
function createGate({ restricts_choice = false, builds_pressure = false, closes_opposition = false } = {}) {
  const flags = [restricts_choice, builds_pressure, closes_opposition];
  return Object.freeze({
    restricts_choice,
    builds_pressure,
    closes_opposition,
    hit_count: flags.filter(Boolean).length,
  });
}

/**
 * Create a Vacuum Detection Gate result (Vacuum channel, Charter §5.2).
 * @param {Object} opts
 * @param {boolean} opts.escalation_signal     - distress escalating?
 * @param {boolean} opts.support_withdrawal    - support being withdrawn?
 * @param {boolean} opts.no_alternate_handoff  - no path to external support?
 * @returns {Object} vacuumGate
 */
function createVacuumGate({ escalation_signal = false, support_withdrawal = false, no_alternate_handoff = false } = {}) {
  const flags = [escalation_signal, support_withdrawal, no_alternate_handoff];
  return Object.freeze({
    escalation_signal,
    support_withdrawal,
    no_alternate_handoff,
    hit_count: flags.filter(Boolean).length,
  });
}

/**
 * Create a pattern hit entry.
 * @param {string} id          - P1–P8
 * @param {string} name        - Pattern name
 * @param {number} confidence  - [0, 1]
 * @returns {Object} patternHit
 */
function createPatternHit(id, name, confidence) {
  if (confidence < 0 || confidence > 1) throw new RangeError(`confidence must be [0,1], got ${confidence}`);
  return Object.freeze({ id, name, confidence });
}

/**
 * Create a dual-layer evidence object (Charter §7.2).
 * @param {Object} opts
 * @param {string} opts.summary       - desensitized summary (public)
 * @param {string[]} opts.pattern_ids - detected pattern IDs (public)
 * @param {string} opts.input_hash    - SHA-256 of input (local audit)
 * @param {string} opts.trace_pointer - pointer to full trace (local audit)
 * @returns {Object} evidence
 */
function createEvidence({ summary = "", pattern_ids = [], input_hash = "", trace_pointer = "" } = {}) {
  return Object.freeze({
    public: Object.freeze({ summary, pattern_ids: Object.freeze([...pattern_ids]) }),
    local_audit: Object.freeze({ input_hash, trace_pointer }),
  });
}

/**
 * Derive response level from both ACRI and VRI scores (Charter §6.4).
 *
 * Level 0: No detection (both scores = 0)
 * Level 1: Silent Audit Trail (low signal, score < 0.3)
 * Level 2: Protocol Integrity Alert (moderate signal, 0.3 ≤ score < 0.7)
 * Level 3: Structured Hand-off Activation (high signal, score ≥ 0.7)
 *
 * Uses the HIGHER of the two scores to determine level.
 * Push and Vacuum are independent channels but response level
 * reflects the worst-case signal from either channel.
 *
 * @param {number} vri  - Vacuum Risk Index [0, 1]
 * @param {number} acri - Aggregate Cognitive Risk Index [0, 1] (default 0)
 * @returns {number} 0 | 1 | 2 | 3
 */
function deriveResponseLevel(vri, acri = 0) {
  const peak = Math.max(vri, acri);
  if (peak <= 0) return 0;
  if (peak < VRI_THRESHOLDS.SILENT_AUDIT)    return 1;
  if (peak < VRI_THRESHOLDS.INTEGRITY_ALERT) return 2;
  return 3;
}

/**
 * Build a complete LumenDetectionResult (the top-level IR object).
 * This is what gets serialised to match schema.json.
 *
 * @param {Object} opts
 * @param {string}   opts.input_ref      - opaque input reference (never raw text)
 * @param {Object}   opts.gate           - from createGate()
 * @param {Object[]} opts.patterns       - from createPatternHit()
 * @param {number}   opts.acri           - Push channel ACRI [0, 1]
 * @param {Object}   opts.vacuumGate     - from createVacuumGate()
 * @param {number}   opts.vri            - Vacuum Risk Index [0, 1]
 * @param {Object}   [opts.evidence]     - from createEvidence()
 * @param {string}   opts.node_id        - Lumen node identifier
 * @param {string}   [opts.engine_version] - engine semver
 * @returns {Object} LumenDetectionResult conforming to schema.json v0.1
 */
function createDetectionResult({
  input_ref,
  gate,
  patterns = [],
  acri = 0,
  vacuumGate,
  vri = 0,
  evidence,
  node_id,
  snapshot = null,
  engine_version = IR_VERSION,
} = {}) {
  return Object.freeze({
    version: IR_VERSION,
    timestamp: new Date().toISOString(),
    input_ref,
    channels: Object.freeze({
      push: Object.freeze({
        gate,
        patterns: Object.freeze([...patterns]),
        acri,
      }),
      vacuum: Object.freeze({
        gate: vacuumGate,
        vri,
      }),
    }),
    evidence: evidence || createEvidence(),
    response_level: deriveResponseLevel(vri, acri),
    snapshot: snapshot || Object.freeze({
      turn_index: 0,
      active_signals: Object.freeze({}),
      decay_state: Object.freeze({}),
      topic_segment_id: null,
    }),
    meta: Object.freeze({
      node_id,
      engine_version,
      charter_ref: "draft4",
    }),
  });
}

// ─── Exports ─────────────────────────────────────────────────────────

module.exports = {
  IR_VERSION,
  VRI_THRESHOLDS,
  GATE_TRIGGER,
  createGate,
  createVacuumGate,
  createPatternHit,
  createEvidence,
  deriveResponseLevel,
  createDetectionResult,
};
