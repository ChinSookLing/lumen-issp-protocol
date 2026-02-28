/**
 * Lumen ISSP — EA: Emotional-Attachment (Push Channel)
 * PDD v0.1 — three-party process complete:
 *   Node-05 (WS1):    structural design + component definitions
 *   Node-03 (CI): math verification + weight adjustment + isolate cap
 *   Node-01 (GK):   red-line compliance + Schema/IR alignment
 *
 * Components:
 *   C1: bond_claim      — emphasizing special relationship / connection
 *   C2: abandon_fear    — framing departure/non-response as harm/betrayal
 *   C3: affection_gate  — love/care as conditional exchange ("if you care...")
 *   C4: isolation_hint  — suggesting other relationships are lesser (CAPPED 0.25)
 *
 * Differential diagnosis vs DM (Node-05 §1):
 *   DM = "only I can help you" (resource/survival dependency)
 *   EA = "if you care about me, then..." (bond/love dependency)
 *   DM threatens support capability; EA threatens the connection itself.
 *
 * Hard constraint (Node-01 GK decision, Sprint 1):
 *   If affection_gate == 0 AND abandon_fear == 0 → no detection.
 *   Pure bond_claim + isolation without gate/leverage = not manipulation.
 *
 * Red-line compliance (Charter §2): no action advice, no identity attribution.
 */

"use strict";

const EA_PATTERN_ID = "EA";
const EA_PATTERN_NAME = "Emotional-Attachment";
const EA_PATTERN_VERSION = "0.1.0";

/**
 * Weights (Node-03 adjusted):
 * Core levers: abandon_fear + affection_gate = 0.70 (dominant)
 * Supporting: bond_claim + isolation_hint = 0.30 (amplifiers only)
 */
const EA_WEIGHTS = Object.freeze({
  bond_claim:     0.15,
  abandon_fear:   0.35,
  affection_gate: 0.35,
  isolation_hint: 0.15,
});

/** Isolation hint cap (Node-03 CI) — prevents "I like being alone with you" false positives */
const EA_ISOLATE_CAP = 0.25;

/** Unified gate_mult (all Patterns) */
const EA_GATE_MULTIPLIERS = Object.freeze([0.30, 0.65, 1.00, 1.20]);

/** Trigger thresholds (aligned with FC/MB v0.2) */
const EA_TRIGGER = Object.freeze({
  SUM_THRESHOLD: 0.70,
  COMPONENT_THRESHOLD: 0.25,
  MIN_ACTIVE_COMPONENTS: 2,
  GATE_MIN: 2,
});

// ─── Feature Patterns ───────────────────────────────────────────────

/**
 * Bond Claim (C1) — emphasizing special relationship
 * "我們不是一般關係" / "you're special to me" / "you should understand me"
 */
const BOND_CLAIM_PATTERNS = [
  // Chinese
  /你對我.*特別/, /我們.*不是一般/, /我們.*特殊/, /你應該懂我/,
  /我們之間/, /你是我的/, /我.*只有你/, /我們的感情/,
  /你最懂我/, /我們.*不一樣/, /我倆/,
  // English
  /you'?re\s+special/i, /we'?re\s+not\s+like/i, /our\s+bond/i,
  /you\s+should\s+(understand|know)\s+me/i, /what\s+we\s+have/i,
  /you\s+mean\s+everything/i, /no\s+one.*like\s+you/i,
  /you'?re\s+the\s+only/i, /we\s+have\s+something\s+special/i,
];

/**
 * Abandon Fear (C2) — framing departure as harm/betrayal
 * "你不要丟下我" / "if you leave I'll break down" / "you're abandoning me"
 */
const ABANDON_FEAR_PATTERNS = [
  // Chinese
  /不要丟下我/, /你要離開我/, /你不回.*崩潰/, /你.*拋棄/,
  /你走了.*怎麼辦/, /沒有你.*活不下去/, /你不要我了/,
  /你離開.*就是.*背叛/, /你不在.*我會.*死/, /你不理我/,
  // English
  /don'?t\s+leave\s+me/i, /you'?re\s+abandon/i, /if\s+you\s+leave/i,
  /i'?ll\s+(die|break|fall\s+apart)/i, /can'?t\s+live\s+without/i,
  /you'?re\s+walking\s+away/i, /don'?t\s+give\s+up\s+on/i,
  /you'?re\s+leaving\s+me/i, /i\s+need\s+you/i,
  /without\s+you.*nothing/i,
];

/**
 * Affection Gate (C3) — love/care as conditional exchange
 * "如果你在乎我就..." / "prove you love me" / "if you cared..."
 * This is the CORE manipulation structure: love as gate.
 */
const AFFECTION_GATE_PATTERNS = [
  // Chinese
  /如果你.*在乎.*就/, /如果你.*愛.*就/, /你.*在乎我.*嗎/,
  /愛我就.*證明/, /你不.*就是不愛/, /在乎我.*為什麼不/,
  /你愛我就/, /證明.*愛/, /如果你真的.*在乎/,
  // English
  /if\s+you\s+(care|love|loved)/i, /prove.*love/i, /you\s+don'?t\s+(care|love)/i,
  /if\s+you\s+really\s+(care|loved)/i, /you\s+would.*if\s+you/i,
  /show\s+me\s+you\s+(care|love)/i, /wouldn'?t\s+do\s+this\s+if/i,
  /love\s+me.*then/i, /care\s+about\s+me.*why/i,
];

/**
 * Isolation Hint (C4) — suggesting other relationships are lesser
 * "只有我懂你" / "don't listen to them" / "you don't need anyone else"
 * CAPPED at 0.25 (Node-03) — weak signal only, prevents false positives
 */
const ISOLATION_HINT_PATTERNS = [
  // Chinese
  /只有我懂/, /別聽他們/, /你不需要別人/, /他們不.*懂你/,
  /我比.*了解你/, /其他人.*不重要/, /別人.*不可信/,
  // English
  /only\s+i\s+understand/i, /don'?t\s+listen\s+to\s+them/i,
  /you\s+don'?t\s+need\s+(anyone|them)/i, /they\s+don'?t\s+(know|understand)/i,
  /no\s+one\s+else.*like\s+me/i, /i\s+know\s+you\s+better/i,
  /others.*can'?t\s+be\s+trusted/i,
];

function scoreComponent(input, patterns) {
  let matchCount = 0;
  for (const pattern of patterns) {
    if (pattern.test(input)) matchCount++;
  }
  if (matchCount === 0) return 0;
  if (matchCount === 1) return 0.4;
  if (matchCount === 2) return 0.65;
  if (matchCount === 3) return 0.8;
  return Math.min(1.0, 0.8 + matchCount * 0.05);
}

// ─── EA Evaluator ───────────────────────────────────────────────────

function extractEAComponents(input) {
  return {
    bond_claim:     scoreComponent(input, BOND_CLAIM_PATTERNS),
    abandon_fear:   scoreComponent(input, ABANDON_FEAR_PATTERNS),
    affection_gate: scoreComponent(input, AFFECTION_GATE_PATTERNS),
    isolation_hint: Math.min(scoreComponent(input, ISOLATION_HINT_PATTERNS), EA_ISOLATE_CAP),
  };
}

/**
 * EA Gate mapping (Node-05 §4):
 *   G1 (Agency Narrowing):    affection_gate > t (compresses exit with love-as-condition)
 *   G2 (Asymmetric leverage): abandon_fear > t (one-directional emotional pressure)
 *   G3 (Intentional pressure): abandon_fear > t AND affection_gate > t (combined lock)
 */
function evaluateEAGate(components) {
  const t = EA_TRIGGER.COMPONENT_THRESHOLD;
  const g1 = components.affection_gate > t;
  const g2 = components.abandon_fear > t;
  const g3 = components.abandon_fear > t && components.affection_gate > t;
  return { g1, g2, g3, hit_count: [g1, g2, g3].filter(Boolean).length };
}

/**
 * Hard constraint (Node-01 GK, Sprint 1):
 * If affection_gate == 0 AND abandon_fear == 0 → not manipulation.
 * Pure bond + isolation without gate/leverage = just being affectionate.
 */
function isEAStructureTriggered(components) {
  // Hard constraint: at least one core lever must be present
  if (components.affection_gate === 0 && components.abandon_fear === 0) return false;

  const scores = [components.bond_claim, components.abandon_fear,
                  components.affection_gate, components.isolation_hint];
  const sum = scores.reduce((a, b) => a + b, 0);
  const active = scores.filter(s => s > EA_TRIGGER.COMPONENT_THRESHOLD).length;
  return sum >= EA_TRIGGER.SUM_THRESHOLD && active >= EA_TRIGGER.MIN_ACTIVE_COMPONENTS;
}

function evaluateEA(input, gateHit) {
  const components = extractEAComponents(input);
  const detected = isEAStructureTriggered(components) && gateHit >= EA_TRIGGER.GATE_MIN;
  if (!detected) return { detected: false, score: 0, components };

  const base =
    EA_WEIGHTS.bond_claim     * components.bond_claim +
    EA_WEIGHTS.abandon_fear   * components.abandon_fear +
    EA_WEIGHTS.affection_gate * components.affection_gate +
    EA_WEIGHTS.isolation_hint * components.isolation_hint;

  const gateMult = EA_GATE_MULTIPLIERS[Math.min(gateHit, 3)];
  const score = Math.min(1.0, base * gateMult);
  return { detected, score, components };
}

module.exports = {
  EA_PATTERN_ID, EA_PATTERN_NAME, EA_PATTERN_VERSION,
  EA_WEIGHTS, EA_ISOLATE_CAP, EA_GATE_MULTIPLIERS, EA_TRIGGER,
  extractEAComponents, evaluateEAGate, isEAStructureTriggered, evaluateEA,
  BOND_CLAIM_PATTERNS, ABANDON_FEAR_PATTERNS, AFFECTION_GATE_PATTERNS, ISOLATION_HINT_PATTERNS,
};
