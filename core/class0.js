/**
 * Lumen ISSP — Class-0: Omission Dynamics (Vacuum Channel)
 * PDD v0.1 — designed by Node-05, math verified by Node-03, gatekeeper approved by Node-01
 *
 * Detection method: rule-based structural feature extraction
 * Channel: Vacuum (Channel B)
 *
 * Purpose: Detect "observable absence mechanics" — not silence itself,
 * but systematic removal of expected information/options/clarification
 * that causes decision-space collapse.
 *
 * Components:
 *   C1: ctx_gap     — Context Gap (critical context absent)
 *   C2: alt_abs     — Alternatives Absent (single path presented)
 *   C3: counter_miss — Counterevidence Missing (no exceptions/limits)
 *   C4: clarity_skip — Clarification Skipped (ambiguity unresolved)
 *
 * Non-goals: No motive inference, no identity attribution, no action advice.
 *
 * Red-line compliance (Charter §2):
 *   - No action recommendations
 *   - No identity attribution
 *   - Output = structural scores only
 */

"use strict";

// ─── Class-0 Constants ──────────────────────────────────────────────

const CLASS0_PATTERN_ID = "class0_omission";
const CLASS0_PATTERN_NAME = "Omission Dynamics";
const CLASS0_PATTERN_VERSION = "0.1.0";

/** Component weights (sum = 1.0, Node-03 verified) */
const CLASS0_WEIGHTS = Object.freeze({
  ctx_gap:      0.30,  // C1: Context Gap (highest — foundational absence)
  alt_abs:      0.25,  // C2: Alternatives Absent
  counter_miss: 0.25,  // C3: Counterevidence Missing
  clarity_skip: 0.20,  // C4: Clarification Skipped
});

/** Gate multiplier (Node-03 recommendation: align gate_hit=3 with DM at 1.20) */
const CLASS0_GATE_MULTIPLIERS = Object.freeze([0.30, 0.65, 1.00, 1.20]);

/** Trigger thresholds */
const CLASS0_TRIGGER = Object.freeze({
  SUM_THRESHOLD: 0.80,          // component sum must reach this
  COMPONENT_THRESHOLD: 0.30,    // individual component min for "active"
  MIN_ACTIVE_COMPONENTS: 2,     // at least N components above threshold
  GATE_MIN: 1,                  // Vacuum gate hit_count minimum (lower than Push — absence is subtler)
});

// ─── Feature Extraction (Rule-based, M3) ────────────────────────────
//
// Class-0 detects ABSENCE of expected structure, not presence of force.
// This is fundamentally different from Push detection.
// We look for: conclusions without basis, single paths without alternatives,
// assertions without exceptions, and pushed closure without clarification.

/**
 * Context Gap signals (C1: ctx_gap)
 * Detects: conclusions/assertions pushed forward without providing basis/context
 */
const CTX_GAP_PATTERNS = [
  // Chinese — conclusory language without basis
  /就是這樣/, /一定是/, /明顯/, /總之/, /不用解釋/, /不需要理由/,
  /反正/, /沒什麼好說的/, /事實就是/, /不用多說/,
  // English
  /it'?s\s+obvious/i, /clearly/i, /no\s+need\s+to\s+explain/i,
  /that'?s\s+just\s+how\s+it\s+is/i, /the\s+fact\s+is/i, /period\.?$/i,
  /bottom\s+line/i, /end\s+of\s+(story|discussion)/i,
];

/**
 * Alternatives Absent signals (C2: alt_abs)
 * Detects: only one path/option presented, alternatives denied or absent
 */
const ALT_ABS_PATTERNS = [
  // Chinese
  /唯一的?(辦法|方法|出路|選擇|可能)/, /只有這(一)?條路/, /別無選擇/,
  /沒有其他/, /只能這樣/, /除此之外.*沒/, /不可能有.*其他/,
  /就這樣做/, /照做就對/,
  // English
  /the\s+only\s+(way|option|choice|path)/i, /no\s+(other|alternative)/i,
  /there'?s\s+no\s+choice/i, /just\s+do\s+(it|this|what)/i,
  /take\s+it\s+or\s+leave\s+it/i, /no\s+room\s+for/i,
];

/**
 * Counterevidence Missing signals (C3: counter_miss)
 * Detects: absolute assertions without exceptions, limits, or falsifiability
 */
const COUNTER_MISS_PATTERNS = [
  // Chinese — absolute language without hedging
  /總是/, /從不/, /必然/, /絕對/, /一定會/, /不可能.*錯/,
  /永遠/, /百分之百/, /毫無疑問/, /沒有例外/,
  // English
  /always/i, /never/i, /absolutely/i, /certainly/i, /without\s+(a\s+)?doubt/i,
  /no\s+exceptions?/i, /100\s*%/i, /guaranteed/i, /impossible.*wrong/i,
  /there'?s\s+no\s+way/i,
];

/**
 * Clarification Skipped signals (C4: clarity_skip)
 * Detects: ambiguity pushed through without resolution, closure forced
 */
const CLARITY_SKIP_PATTERNS = [
  // Chinese — closure without clarification
  /不用問了/, /別再問/, /已經說完了/, /不需要.*解釋/, /別.*多想/,
  /到此為止/, /我說了算/, /沒什麼好討論/, /不接受.*質疑/, /閉嘴/,
  // English
  /stop\s+asking/i, /don'?t\s+question/i, /i'?ve\s+(already\s+)?said\s+enough/i,
  /no\s+more\s+(questions|discussion)/i, /that'?s\s+final/i,
  /i\s+said\s+what\s+i\s+said/i, /shut\s+up/i, /enough\s+said/i,
  /case\s+closed/i, /not\s+up\s+for\s+(debate|discussion)/i,
];

/**
 * Score a single component by counting structural signal matches.
 * Same scoring curve as DM (consistency across patterns).
 * @param {string} input
 * @param {RegExp[]} patterns
 * @returns {number} score [0, 1]
 */
function scoreComponent(input, patterns) {
  let matchCount = 0;
  for (const pattern of patterns) {
    if (pattern.test(input)) {
      matchCount++;
    }
  }
  if (matchCount === 0) return 0;
  if (matchCount === 1) return 0.4;
  if (matchCount === 2) return 0.65;
  if (matchCount === 3) return 0.8;
  return Math.min(1.0, 0.8 + matchCount * 0.05);
}

// ─── Must-NOT-Trigger Guards ────────────────────────────────────────
//
// PDD §3 defines 6 cases where Class-0 must NOT trigger.
// These patterns indicate legitimate reasons for brevity/omission.

const SAFE_PATTERNS = [
  // Acknowledges uncertainty / unknown
  /不確定/, /可能/, /也許/, /待確認/, /我不知道/, /還需要/, /有待/,
  /not\s+sure/i, /maybe/i, /perhaps/i, /uncertain/i, /i\s+don'?t\s+know/i, /to\s+be\s+confirmed/i,

  // Promises follow-up
  /後續.*補充/, /之後.*詳/, /先.*要點.*後/, /稍後/, /待會/,
  /i'?ll\s+(follow|get\s+back)/i, /more\s+details?\s+(later|soon)/i, /to\s+be\s+continued/i,
];

/**
 * Check if input contains safe/legitimate omission patterns.
 * If detected, reduces the overall score significantly.
 * @param {string} input
 * @returns {number} dampening factor [0.0, 1.0] — lower = more dampening
 */
function safeDampener(input) {
  let safeCount = 0;
  for (const pattern of SAFE_PATTERNS) {
    if (pattern.test(input)) safeCount++;
  }
  if (safeCount >= 2) return 0.1;  // strong dampening
  if (safeCount === 1) return 0.4; // moderate dampening
  return 1.0; // no dampening
}

// ─── Class-0 Evaluator ─────────────────────────────────────────────

/**
 * Extract Class-0 component scores from input text.
 * @param {string} input
 * @returns {Object} { ctx_gap, alt_abs, counter_miss, clarity_skip }
 */
function extractClass0Components(input) {
  return {
    ctx_gap:      scoreComponent(input, CTX_GAP_PATTERNS),
    alt_abs:      scoreComponent(input, ALT_ABS_PATTERNS),
    counter_miss: scoreComponent(input, COUNTER_MISS_PATTERNS),
    clarity_skip: scoreComponent(input, CLARITY_SKIP_PATTERNS),
  };
}

/**
 * Evaluate Vacuum Gate (PDD §4).
 * G1: Decision-Space Collapse — options compressed to 1
 * G2: Non-falsifiability — no exceptions, no boundaries
 * G3: Forced Closure — "stop asking", "that's final"
 *
 * @param {Object} components - Class-0 component scores
 * @returns {{ g1: boolean, g2: boolean, g3: boolean, hit_count: number }}
 */
function evaluateClass0Gate(components) {
  const g1 = components.alt_abs > 0.3;       // Decision-Space Collapse
  const g2 = components.counter_miss > 0.3;   // Non-falsifiability
  const g3 = components.clarity_skip > 0.3;   // Forced Closure

  return {
    g1, g2, g3,
    hit_count: [g1, g2, g3].filter(Boolean).length,
  };
}

/**
 * Check if Class-0 structural trigger conditions are met (PDD §3).
 * @param {Object} components
 * @returns {boolean}
 */
function isClass0StructureTriggered(components) {
  const scores = [components.ctx_gap, components.alt_abs, components.counter_miss, components.clarity_skip];
  const sum = scores.reduce((a, b) => a + b, 0);
  const aboveThreshold = scores.filter(s => s > CLASS0_TRIGGER.COMPONENT_THRESHOLD).length;

  return sum >= CLASS0_TRIGGER.SUM_THRESHOLD && aboveThreshold >= CLASS0_TRIGGER.MIN_ACTIVE_COMPONENTS;
}

/**
 * Compute Class-0 VRI score (PDD §5).
 * @param {string} input - original text (for safe dampener check)
 * @param {Object} components - Class-0 component scores
 * @param {number} gateHit - Vacuum Gate hit_count (0-3)
 * @returns {{ detected: boolean, score: number, components: Object, gate: Object }}
 */
function evaluateClass0(input, components, gateHit) {
  const structureTriggered = isClass0StructureTriggered(components);
  const gateTriggered = gateHit >= CLASS0_TRIGGER.GATE_MIN;
  const detected = structureTriggered && gateTriggered;

  if (!detected) {
    return { detected: false, score: 0, components };
  }

  // Weighted base score (PDD §5.1)
  const base =
    CLASS0_WEIGHTS.ctx_gap * components.ctx_gap +
    CLASS0_WEIGHTS.alt_abs * components.alt_abs +
    CLASS0_WEIGHTS.counter_miss * components.counter_miss +
    CLASS0_WEIGHTS.clarity_skip * components.clarity_skip;

  // Gate multiplier (Node-03 recommendation: 1.20 at gate_hit=3)
  const gateMult = CLASS0_GATE_MULTIPLIERS[Math.min(gateHit, 3)];

  // Safe dampener (PDD §3 must-NOT-trigger cases)
  const dampener = safeDampener(input);

  // Final score, clamped to [0, 1]
  const score = Math.min(1.0, base * gateMult * dampener);

  return { detected, score, components };
}

// ─── Exports ─────────────────────────────────────────────────────────

module.exports = {
  CLASS0_PATTERN_ID,
  CLASS0_PATTERN_NAME,
  CLASS0_PATTERN_VERSION,
  CLASS0_WEIGHTS,
  CLASS0_GATE_MULTIPLIERS,
  CLASS0_TRIGGER,
  extractClass0Components,
  evaluateClass0Gate,
  isClass0StructureTriggered,
  evaluateClass0,
  safeDampener,
  scoreComponent,
  CTX_GAP_PATTERNS,
  ALT_ABS_PATTERNS,
  COUNTER_MISS_PATTERNS,
  CLARITY_SKIP_PATTERNS,
};
