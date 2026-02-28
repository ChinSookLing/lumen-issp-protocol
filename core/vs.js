/**
 * Lumen ISSP — Vacuum-2: Structural Silence (Vacuum Channel)
 * PDD v0.1 — three-party process complete:
 *   Node-05 (WS1):    structural design + component definitions + multi-turn architecture
 *   Node-03 (CI): math verification + weight adjustment + gate simplification
 *   Node-01 (GK):   red-line §2.3 compliance + Schema/IR alignment
 *
 * PURPOSE: Detect structural silence — not single non-response, but repeated
 * avoidance of critical prompts creating pressure through absence.
 *
 * KEY INNOVATION: First multi-turn Pattern. Analyzes conversation structure
 * across turns, not single sentences.
 *
 * Components:
 *   C1: ucp    — Unclosed Critical Prompt (hard anchor, REQUIRED ≥ 0.60)
 *   C2: avoid  — Avoidance/Deflection (low weight 0.10 — hardest to rule-base)
 *   C3: rnr    — Repeated Non-Response (persistence indicator)
 *   C4: pba    — Pressure-by-Absence (withdrawal + silence as leverage)
 *
 * Differential diagnosis vs Class-0 (Node-05 §3):
 *   Class-0 = "I'm done, figure it out yourself" (active withdrawal + responsibility shift)
 *   Vacuum-2 = [question] → [deflect] → [silence] → [pressure] (structural lockout)
 *   One sentence: Class-0 is omission; Vacuum-2 is using omission to trap you.
 *
 * Red-line §2.3 compliance:
 *   - No raw text stored — only structural feature summaries (7 booleans/values)
 *   - Node-local buffer, ~320 bytes per conversation
 *   - evidence_hash = hash(features + timestamps + pattern_id), non-reversible
 *   - Decaying window: features decay at 0.85/turn
 */

"use strict";

const VS_PATTERN_ID = "vacuum_structural_silence";
const VS_PATTERN_NAME = "Structural Silence";
const VS_PATTERN_VERSION = "0.1.0";

/**
 * Weights (Node-03 adjusted):
 * ucp is hard anchor (0.40) — no critical prompt = no detection
 * rnr is persistence (0.30) — repeated non-response is core harm
 * pba is pressure (0.20) — absence as leverage
 * avoid is auxiliary (0.10) — hardest to rule-base, low weight is protection
 */
const VS_WEIGHTS = Object.freeze({
  ucp:   0.40,
  avoid: 0.10,
  rnr:   0.30,
  pba:   0.20,
});

/** Unified gate_mult (all Patterns) */
const VS_GATE_MULTIPLIERS = Object.freeze([0.30, 0.65, 1.00, 1.20]);

/** Trigger thresholds */
const VS_TRIGGER = Object.freeze({
  BASE_THRESHOLD: 0.50,         // Node-03 adjusted from 0.60
  UCP_HARD_MIN: 0.60,           // Hard constraint: ucp must be ≥ 0.60
  COMPONENT_THRESHOLD: 0.25,
  MIN_ACTIVE_COMPONENTS: 2,
  GATE_MIN: 2,
});

// ─── Multi-turn Parsing (from harness module) ───────────────────────

const { parseTurns } = require("./harness");

// ─── Feature Patterns ───────────────────────────────────────────────

/** Critical Prompt signals — questions/requests that need response */
const CRITICAL_PROMPT_PATTERNS = [
  // Chinese
  /？/, /嗎/, /能不能/, /可不可以/, /是否/, /請回答/, /請告訴/,
  /需要你/, /給我/, /你能/, /麻煩/, /我問你/, /回覆我/,
  /你願不願/, /答覆/, /明確/, /是或否/,
  // English
  /\?/, /can\s+you/i, /could\s+you/i, /will\s+you/i, /would\s+you/i,
  /please\s+(tell|answer|respond|reply)/i, /i\s+need\s+you\s+to/i,
  /yes\s+or\s+no/i, /give\s+me/i, /let\s+me\s+know/i,
  /do\s+you\s+agree/i, /what\s+do\s+you\s+think/i,
];

/** Avoidance/Deflection signals — responding without addressing the prompt */
const AVOIDANCE_PATTERNS = [
  // Chinese
  /以後再說/, /之後再/, /先這樣/, /我很忙/, /晚點/, /再說/,
  /不想談/, /不想討論/, /算了/, /隨便/,
  // English
  /later/i, /not\s+now/i, /i'?m\s+busy/i, /we'?ll\s+see/i,
  /let'?s\s+not/i, /whatever/i, /don'?t\s+want\s+to\s+talk/i,
  /i\s+don'?t\s+know/i, /maybe/i, /can'?t\s+right\s+now/i,
];

/** Closure markers — signals that the prompt WAS addressed */
const CLOSURE_PATTERNS = [
  // Chinese
  /^是$/, /^不是$/, /^好$/, /^可以$/, /^不行$/, /^不會$/, /^會$/,
  /我同意/, /我不同意/, /我拒絕/, /答案是/, /我願意/, /我不願意/,
  /下午.*點/, /明天/, /具體.*時間/,
  // English
  /^yes$/i, /^no$/i, /^ok$/i, /i\s+agree/i, /i\s+disagree/i,
  /i\s+will/i, /i\s+won'?t/i, /i\s+refuse/i, /the\s+answer\s+is/i,
  /by\s+\d/i, /at\s+\d/i, /tomorrow/i,
];

/** Pressure-by-Absence signals — withdrawal threat + silence as leverage */
const PRESSURE_ABSENCE_PATTERNS = [
  // Chinese
  /我不回了/, /別再找我/, /到此為止/, /就這樣/, /你再問.*不回/,
  /最後一次/, /我不想再/, /別逼我/, /你自己想/,
  // English
  /i'?m\s+done/i, /don'?t\s+contact/i, /that'?s\s+it/i,
  /stop\s+asking/i, /last\s+time/i, /i'?m\s+not\s+going\s+to\s+respond/i,
  /figure\s+it\s+out/i, /leave\s+me\s+alone/i,
];

/** Silence marker — empty or extremely short non-responsive turn */
const SILENCE_MARKERS = [
  /^（沉默）$/, /^\.+$/, /^…+$/, /^$/,
];

function scorePatterns(text, patterns) {
  let matchCount = 0;
  for (const pattern of patterns) {
    if (pattern.test(text)) matchCount++;
  }
  if (matchCount === 0) return 0;
  if (matchCount === 1) return 0.4;
  if (matchCount === 2) return 0.65;
  if (matchCount === 3) return 0.8;
  return Math.min(1.0, 0.8 + matchCount * 0.05);
}

function hasClosure(text) {
  for (const pattern of CLOSURE_PATTERNS) {
    if (pattern.test(text.trim())) return true;
  }
  return false;
}

function isSilence(text) {
  if (!text || text.trim().length === 0) return true;
  for (const pattern of SILENCE_MARKERS) {
    if (pattern.test(text.trim())) return true;
  }
  return false;
}

// ─── Vacuum-2 Evaluator ─────────────────────────────────────────────

/**
 * Extract Vacuum-2 components from multi-turn input.
 *
 * Analyzes conversation structure:
 *   1. Find critical prompts (from any speaker)
 *   2. Check if they were closed (by the other speaker)
 *   3. Count avoidance/deflection responses
 *   4. Count repeated non-responses / silences
 *   5. Check for pressure-by-absence signals
 */
function extractVSComponents(input) {
  const turns = parseTurns(input);

  if (turns.length < 2) {
    return { ucp: 0, avoid: 0, rnr: 0, pba: 0 };
  }

  // Find critical prompts and track closure
  let criticalPromptScore = 0;
  let unclosedCount = 0;
  let avoidanceScore = 0;
  let silenceCount = 0;
  let pressureScore = 0;
  let totalCritical = 0;

  for (let i = 0; i < turns.length; i++) {
    const turn = turns[i];
    const cpScore = scorePatterns(turn.text, CRITICAL_PROMPT_PATTERNS);

    if (cpScore > 0.3) {
      totalCritical++;
      // Check if subsequent turns from OTHER speaker close this
      let closed = false;
      for (let j = i + 1; j < turns.length; j++) {
        if (turns[j].speaker !== turn.speaker) {
          if (hasClosure(turns[j].text)) {
            closed = true;
            break;
          }
          // Check for avoidance
          const avScore = scorePatterns(turns[j].text, AVOIDANCE_PATTERNS);
          if (avScore > 0.3) avoidanceScore = Math.max(avoidanceScore, avScore);
          // Check for silence
          if (isSilence(turns[j].text)) silenceCount++;
          // Check for pressure
          const pbScore = scorePatterns(turns[j].text, PRESSURE_ABSENCE_PATTERNS);
          if (pbScore > 0.3) pressureScore = Math.max(pressureScore, pbScore);
        }
      }
      if (!closed) {
        unclosedCount++;
        criticalPromptScore = Math.max(criticalPromptScore, cpScore);
      }
    }
  }

  // UCP: based on strongest unclosed critical prompt
  const ucp = unclosedCount > 0 ? Math.min(1.0, criticalPromptScore + unclosedCount * 0.1) : 0;

  // Avoid: from avoidance patterns in responses
  const avoid = avoidanceScore;

  // RNR: based on silence count + avoidance repetition
  const rnrRaw = silenceCount * 0.35 + (avoidanceScore > 0.3 ? 0.3 : 0);
  const rnr = Math.min(1.0, rnrRaw);

  // PBA: pressure-by-absence signals
  const pba = pressureScore;

  return { ucp, avoid, rnr, pba };
}

/**
 * Vacuum-2 Gate (Node-05 §4, Node-03 simplified):
 *   VG1: ucp ≥ 0.60 (critical prompt anchor)
 *   VG2: rnr ≥ 0.50 (persistence)
 *   VG3: pba ≥ 0.50 (pressure signal — simplified from Node-05's complex condition)
 */
function evaluateVSGate(components) {
  const vg1 = components.ucp >= 0.60;
  const vg2 = components.rnr >= 0.50;
  const vg3 = components.pba >= 0.50;
  return { vg1, vg2, vg3, hit_count: [vg1, vg2, vg3].filter(Boolean).length };
}

/**
 * Hard constraint (Node-03 + Node-01 GK):
 *   ucp must be ≥ 0.60 — no critical prompt = no structural silence
 *   Without an unclosed critical prompt, silence is just... silence.
 */
function isVSStructureTriggered(components) {
  // Hard constraint: must have strong critical prompt
  if (components.ucp < VS_TRIGGER.UCP_HARD_MIN) return false;

  const scores = [components.ucp, components.avoid, components.rnr, components.pba];
  const base = VS_WEIGHTS.ucp * components.ucp +
               VS_WEIGHTS.avoid * components.avoid +
               VS_WEIGHTS.rnr * components.rnr +
               VS_WEIGHTS.pba * components.pba;
  const active = scores.filter(s => s > VS_TRIGGER.COMPONENT_THRESHOLD).length;

  return base >= VS_TRIGGER.BASE_THRESHOLD && active >= VS_TRIGGER.MIN_ACTIVE_COMPONENTS;
}

function evaluateVS(input, gateHit) {
  const components = extractVSComponents(input);
  const detected = isVSStructureTriggered(components) && gateHit >= VS_TRIGGER.GATE_MIN;
  if (!detected) return { detected: false, score: 0, components };

  const base = VS_WEIGHTS.ucp * components.ucp +
               VS_WEIGHTS.avoid * components.avoid +
               VS_WEIGHTS.rnr * components.rnr +
               VS_WEIGHTS.pba * components.pba;

  const gateMult = VS_GATE_MULTIPLIERS[Math.min(gateHit, 3)];
  const score = Math.min(1.0, base * gateMult);
  return { detected, score, components };
}

module.exports = {
  VS_PATTERN_ID, VS_PATTERN_NAME, VS_PATTERN_VERSION,
  VS_WEIGHTS, VS_GATE_MULTIPLIERS, VS_TRIGGER,
  extractVSComponents, evaluateVSGate, isVSStructureTriggered, evaluateVS,
  CRITICAL_PROMPT_PATTERNS, AVOIDANCE_PATTERNS, CLOSURE_PATTERNS,
  PRESSURE_ABSENCE_PATTERNS, SILENCE_MARKERS,
};
