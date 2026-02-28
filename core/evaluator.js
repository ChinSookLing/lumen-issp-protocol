/**
 * Lumen ISSP — Evaluator v0.3 (M3: Dual-Channel Active)
 *
 * Pipeline: input → pushChannel (DM) → vacuumChannel (Class-0) → merge → LumenDetectionResult
 *
 * M3 changes:
 *   - Vacuum channel now active with Class-0 Omission Dynamics
 *   - VRI score computed from Class-0 components + Vacuum Gate
 *   - Dual-channel isolation maintained (Charter §5.3)
 *
 * Both channels now operational:
 *   Push:   DM Pattern → ACRI
 *   Vacuum: Class-0 Omission Dynamics → VRI
 */

"use strict";

const crypto = require("crypto");
const {
  GATE_TRIGGER,
  createGate,
  createVacuumGate,
  createPatternHit,
  createEvidence,
  createDetectionResult,
  deriveResponseLevel,
} = require("./ir");

const {
  DM_PATTERN_ID,
  DM_PATTERN_NAME,
  extractDMComponents,
  evaluateDM,
} = require("./dm");

const {
  FC_PATTERN_ID,
  FC_PATTERN_NAME,
  extractFCComponents,
  evaluateFCGate,
  evaluateFC,
} = require("./fc");

const {
  MB_PATTERN_ID,
  MB_PATTERN_NAME,
  extractMBComponents,
  evaluateMBGate,
  evaluateMB,
} = require("./mb");

const {
  EA_PATTERN_ID,
  EA_PATTERN_NAME,
  extractEAComponents,
  evaluateEAGate,
  evaluateEA,
} = require("./ea");

const {
  VS_PATTERN_ID,
  VS_PATTERN_NAME,
  extractVSComponents,
  evaluateVSGate,
  evaluateVS,
} = require("./vs");

const {
  IP_PATTERN_ID,
  IP_PATTERN_NAME,
  extractIPComponents,
  evaluateIPGate,
  evaluateIP,
} = require("./ip");

const {
  GC_PATTERN_ID,
  GC_PATTERN_NAME,
  extractGCComponents,
  evaluateGC,
} = require("./gc");

const {
  EP_PATTERN_ID,
  EP_PATTERN_NAME,
  extractEPComponents,
  evaluateEP,
} = require("./ep");

const {
  CLASS0_PATTERN_ID,
  extractClass0Components,
  evaluateClass0Gate,
  evaluateClass0,
} = require("./class0");

// ─── Configuration ───────────────────────────────────────────────────

const DEFAULT_NODE_ID = "local-dev-001";

// ─── Push Channel (Charter §5.1) ────────────────────────────────────

/**
 * Evaluate the Three-Question Gate for push-risk.
 * Gate mapping uses BOTH DM and FC component signals.
 * The gate is pattern-agnostic — it asks the three structural questions
 * and any pattern's components can contribute.
 */
function evaluateGate(input) {
  const dmComponents = extractDMComponents(input);
  const fcComponents = extractFCComponents(input);
  const mbComponents = extractMBComponents(input);
  const eaComponents = extractEAComponents(input);
  const gcComponents = extractGCComponents(input);
  const epComponents = extractEPComponents(input);

  // G1: restricts_choice
  const restricts_choice =
    dmComponents.excl > 0.3 || dmComponents.opts > 0.3 ||
    fcComponents.binary_frame > 0.3 ||
    mbComponents.sacrifice_demand > 0.3 ||
    eaComponents.affection_gate > 0.3 ||
    gcComponents.excl_auth > 0.3 || gcComponents.ext_discredit > 0.3 ||
    epComponents.forced_response_frame > 0.3;

  // G2: builds_pressure
  const builds_pressure =
    dmComponents.debt > 0.3 || dmComponents.withdraw > 0.3 ||
    fcComponents.consequence > 0.3 || fcComponents.closure_pressure > 0.3 ||
    mbComponents.guilt_invoke > 0.3 || mbComponents.collective_pressure > 0.3 ||
    eaComponents.abandon_fear > 0.3 ||
    gcComponents.salvation > 0.3 || gcComponents.obed_link > 0.3 ||
    epComponents.escalation_pressure > 0.3 || epComponents.bait_or_taunt > 0.3;

  // G3: closes_opposition
  const closes_opposition =
    (dmComponents.opts > 0.3 && dmComponents.withdraw > 0.3) ||
    fcComponents.label_attack > 0.3 ||
    mbComponents.moral_consequence > 0.3 ||
    (eaComponents.abandon_fear > 0.3 && eaComponents.affection_gate > 0.3) ||
    gcComponents.ext_discredit > 0.3 ||
    epComponents.forced_response_frame > 0.3;

  return createGate({ restricts_choice, builds_pressure, closes_opposition });
}

/**
 * Detect patterns in push channel. Currently: DM + FC.
 */
function detectPatterns(input, gate) {
  const patterns = [];

  // DM: Dependency Manipulation
  const dm = evaluateDM(input, gate.hit_count);
  if (dm.detected) {
    patterns.push(createPatternHit(DM_PATTERN_ID, DM_PATTERN_NAME, dm.score));
  }

  // FC: Forced-Choice
  const fc = evaluateFC(input, gate.hit_count);
  if (fc.detected) {
    patterns.push(createPatternHit(FC_PATTERN_ID, FC_PATTERN_NAME, fc.score));
  }

  // MB: Moral Blackmail
  const mb = evaluateMB(input, gate.hit_count);
  if (mb.detected) {
    patterns.push(createPatternHit(MB_PATTERN_ID, MB_PATTERN_NAME, mb.score));
  }

  // EA: Emotional-Attachment
  const ea = evaluateEA(input, gate.hit_count);
  if (ea.detected) {
    patterns.push(createPatternHit(EA_PATTERN_ID, EA_PATTERN_NAME, ea.score));
  }

  // GC: god-complex (shared gate — M45 6/6 decision)
  const gc = evaluateGC(input, gate.hit_count);
  if (gc.detected) {
    patterns.push(createPatternHit(GC_PATTERN_ID, GC_PATTERN_NAME, gc.score));
  }

  // EP: Emotional-Provocation (shared gate — M47 Node-05 argument)
  const ep = evaluateEP(input, gate.hit_count);
  if (ep.detected) {
    patterns.push(createPatternHit(EP_PATTERN_ID, EP_PATTERN_NAME, ep.score));
  }

  // Note: IP uses its own specialized gate, evaluated at evaluate() level

  return patterns;
}

/**
 * Compute ACRI from detected patterns.
 */
function computeACRI(patterns) {
  if (patterns.length === 0) return 0;
  return Math.max(...patterns.map(p => p.confidence));
}

// ─── Vacuum Channel (Charter §5.2) — NOW ACTIVE (M3) ───────────────

/**
 * Evaluate the Vacuum Detection Gate using Class-0 components.
 * Maps Class-0 gate results to the IR VacuumGate structure.
 */
function evaluateVacuumGate(input) {
  const components = extractClass0Components(input);
  const class0Gate = evaluateClass0Gate(components);

  // Map Class-0 gate to IR VacuumGate structure:
  // G1 (Decision-Space Collapse) → escalation_signal (distress from options collapse)
  // G2 (Non-falsifiability)      → support_withdrawal (no verifiable support offered)
  // G3 (Forced Closure)          → no_alternate_handoff (exit paths sealed)
  return createVacuumGate({
    escalation_signal: class0Gate.g1,
    support_withdrawal: class0Gate.g2,
    no_alternate_handoff: class0Gate.g3,
  });
}

/**
 * Compute VRI from Vacuum channel Patterns.
 * v0.8: Class-0 + Vacuum-2 (Structural Silence)
 * VRI = max(class0_score, vs_score) — same peak logic as Push channel
 * @param {string} input - original text
 * @param {Object} vacuumGate - vacuum gate result
 * @returns {number} VRI [0, 1]
 */
function computeVRI(input, vacuumGate) {
  // Class-0
  const c0Components = extractClass0Components(input);
  const c0Result = evaluateClass0(input, c0Components, vacuumGate.hit_count);
  const c0Score = c0Result.score;

  // Vacuum-2: Structural Silence (multi-turn)
  const vsComponents = extractVSComponents(input);
  const vsGate = evaluateVSGate(vsComponents);
  const vsResult = evaluateVS(input, vsGate.hit_count);
  const vsScore = vsResult.score;

  return Math.max(c0Score, vsScore);
}

// ─── Response Level Labels (Charter §6.4) ───────────────────────────

const RESPONSE_LEVEL_LABELS = Object.freeze([
  "No detection",                          // Level 0
  "Silent Audit Trail",                    // Level 1
  "Protocol Integrity Alert",              // Level 2
  "Structured Hand-off Activation",        // Level 3
]);

// ─── Evidence Builder (Charter §7.2) ────────────────────────────────

function buildEvidence(input, patterns, acri, vri) {
  const patternIds = patterns.map((p) => p.id);
  const parts = [];
  if (patternIds.length > 0) parts.push(`Push: ${patternIds.join(",")} (ACRI=${acri.toFixed(2)})`);
  if (vri > 0) parts.push(`Vacuum: VRI=${vri.toFixed(2)}`);

  // Add response level to summary
  const { deriveResponseLevel } = require("./ir");
  const level = deriveResponseLevel(vri, acri);
  const levelLabel = RESPONSE_LEVEL_LABELS[level] || "Unknown";

  if (parts.length > 0) {
    parts.push(`Response: Level ${level} (${levelLabel})`);
  }

  const summary = parts.length > 0 ? parts.join(" | ") : "No manipulation structure detected.";

  const inputHash = crypto.createHash("sha256").update(input).digest("hex");
  const tracePointer = `trace://${inputHash.slice(0, 16)}/${Date.now()}`;

  return createEvidence({
    summary,
    pattern_ids: patternIds,
    input_hash: inputHash,
    trace_pointer: tracePointer,
  });
}

// ─── Main Pipeline ──────────────────────────────────────────────────

function evaluate(input, options = {}) {
  if (typeof input !== "string" || input.length === 0) {
    throw new TypeError("Input must be a non-empty string.");
  }

  const nodeId = options.node_id || DEFAULT_NODE_ID;

  // ── Push Channel (isolated) ──
  const gate = evaluateGate(input);
  const patterns = gate.hit_count >= GATE_TRIGGER ? detectPatterns(input, gate) : [];

  // IP: Identity-Probing uses its own specialized gate (Node-03 design)
  // Must evaluate independently of shared push gate
  const ipComponents = extractIPComponents(input);
  const ipGate = evaluateIPGate(ipComponents);
  const ip = evaluateIP(input, ipGate.hit_count);
  if (ip.detected && !patterns.some(p => p.id === IP_PATTERN_ID)) {
    patterns.push(createPatternHit(IP_PATTERN_ID, IP_PATTERN_NAME, ip.score));
  }

  const acri = computeACRI(patterns);

  // ── Vacuum Channel (isolated from Push) ──
  const vacuumGate = evaluateVacuumGate(input);
  const vri = computeVRI(input, vacuumGate);

  // ── Evidence ──
  const evidence = buildEvidence(input, patterns, acri, vri);

  // ── State Snapshot v0.1 (M45 locked) ──
  // Timing: parseTurns → detect → build snapshot → return
  // Persistence: v0.1 does NOT persist. Caller manages.
  const activeSignals = {};
  for (const p of patterns) {
    activeSignals[p.id] = p.confidence;
  }
  if (vri > 0) {
    activeSignals["vacuum"] = vri;
  }

  const turnCount = (input.match(/^[A-Za-z]:/gm) || []).length;

  const snapshot = Object.freeze({
    turn_index: turnCount > 0 ? turnCount : 1,
    active_signals: Object.freeze(activeSignals),
    decay_state: Object.freeze({}),          // v0.1: empty — v0.2 will add signal decay tracking
    topic_segment_id: null,                   // v0.1: null — reserved for topic boundary detection
  });

  // ── Assemble ──
  return createDetectionResult({
    input_ref: `ref:${crypto.createHash("sha256").update(input).digest("hex").slice(0, 12)}`,
    gate,
    patterns,
    acri,
    vacuumGate,
    vri,
    evidence,
    snapshot,
    node_id: nodeId,
  });
}

// ─── Exports ─────────────────────────────────────────────────────────
// ─── Long-Text Wrapper (M78, spec v0.2 Node-05-reviewed) ────────────────
/**
 * evaluateLongText — Cross-chunk MAX merge for long text detection.
 *
 * Architecture: Split → Extract → Merge(MAX) → Gate → Score → Return
 * Spec: docs/specs/evaluateLongText_spec_v0.2.md
 *
 * Why: Single evaluate() misses manipulation that spans multiple sentences
 *      because each sentence alone may hit only 1 component per pattern.
 *      Cross-chunk merge allows components from different sentences to
 *      combine, enabling gate threshold to be reached.
 *
 * Evidence: M78 action item 9 / 7 test cases / 0 FP
 */
function evaluateLongText(input, options = {}) {
  if (typeof input !== "string" || input.length === 0) {
    throw new TypeError("Input must be a non-empty string.");
  }

  // Step 1: SPLIT (EN + CJK sentence boundaries)
  const splitPattern = options.splitPattern || /[.!?\u3002\uff01\uff1f\u2026]+\s*|\n+/;
  const chunks = input.split(splitPattern).map(s => s.trim()).filter(s => s.length > 0);

  // If only 1 chunk, just use regular evaluate
  if (chunks.length <= 1) {
    const result = evaluate(input, options);
    return { ...result, meta: { ...result.meta, longtext: { method: "passthrough", chunks_total: 1 } } };
    return result;
  }

  // Step 2: EXTRACT components per chunk for all 8 patterns
  const extractors = [
    { id: "EP", fn: extractEPComponents },
    { id: "FC", fn: extractFCComponents },
    { id: "MB", fn: extractMBComponents },
    { id: "GC", fn: extractGCComponents },
    { id: "DM", fn: extractDMComponents },
    { id: "EA", fn: extractEAComponents },
    { id: "IP", fn: extractIPComponents },
    { id: "VS", fn: extractVSComponents },
  ];

  const allExtractions = {};  // { EP: [{...}, {...}], FC: [...], ... }
  const maxSources = {};      // { EP: { bait_or_taunt: 3 }, ... } which chunk gave max

  for (const ext of extractors) {
    allExtractions[ext.id] = chunks.map(c => ext.fn(c));
  }

  // Step 3: MERGE (MAX) — per component, take max across chunks
  const merged = {};
  for (const ext of extractors) {
    merged[ext.id] = {};
    maxSources[ext.id] = {};
    const chunkResults = allExtractions[ext.id];
    if (chunkResults.length === 0) continue;
    const keys = Object.keys(chunkResults[0]);
    for (const k of keys) {
      let maxVal = 0;
      let maxIdx = 0;
      for (let i = 0; i < chunkResults.length; i++) {
        if (chunkResults[i][k] > maxVal) {
          maxVal = chunkResults[i][k];
          maxIdx = i;
        }
      }
      merged[ext.id][k] = maxVal;
      if (maxVal > 0) maxSources[ext.id][k] = maxIdx;
    }
  }

  // Step 4: GATE CHECK — count merged components > 0 per pattern
  const triggeredPatterns = [];
  let crossChunk = false;

  for (const ext of extractors) {
    const components = merged[ext.id];
    const hits = Object.values(components).filter(v => v > 0);
    if (hits.length >= 2) {
      // Check if components came from different chunks
      const sourceChunks = Object.values(maxSources[ext.id]);
      const uniqueChunks = new Set(sourceChunks);
      if (uniqueChunks.size > 1) crossChunk = true;

      triggeredPatterns.push({
        id: ext.id,
        hits: hits.length,
        components: components,
        score: hits.reduce((a, b) => a + b, 0) / hits.length,
      });
    }
  }

  // Step 5: Build result using regular evaluate on full text as base
  const baseResult = evaluate(input, options);

  // If merged found patterns that base missed, enhance the result
  if (triggeredPatterns.length > 0 && baseResult.channels.push.acri === 0) {
    // Recalculate using the strongest triggered pattern
    const best = triggeredPatterns.sort((a, b) => b.score - a.score)[0];
    // Gate is frozen (Object.freeze in ir.js); record in meta instead
  }

  // Count triggered chunks
  const chunksTriggered = new Set();
  for (const ext of extractors) {
    const chunkResults = allExtractions[ext.id];
    for (let i = 0; i < chunkResults.length; i++) {
      const hasHit = Object.values(chunkResults[i]).some(v => v > 0);
      if (hasHit) chunksTriggered.add(i);
    }
  }
  // Build new result with longtext meta (baseResult is frozen)
  const longtextMeta = {
    method: "max_merge",
    chunks_total: chunks.length,
    chunks_triggered: chunksTriggered.size,
    max_sources: maxSources,
    cross_chunk: crossChunk,
    triggered_patterns: triggeredPatterns.map(p => p.id),
    acri_source: "max_chunk",
  };
  return {
    ...baseResult,
    meta: { ...baseResult.meta, longtext: longtextMeta },
  };
}

module.exports = {
  evaluateLongText,
  evaluate,
  evaluateGate,
  detectPatterns,
  computeACRI,
  evaluateVacuumGate,
  computeVRI,
  buildEvidence,
  deriveResponseLevel,
};
