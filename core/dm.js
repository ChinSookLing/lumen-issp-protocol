/**
 * Lumen ISSP — DM Pattern Detection (Dependency Manipulation)
 * PDD v0.1 — designed by Node-05, math verified by Node-03, gatekeeper approved by Node-01
 *
 * Detection method: rule-based structural feature extraction
 * Channel: Push (Channel A)
 *
 * Components (M2 active):
 *   C1: Exclusivity / Uniqueness (excl)
 *   C2: Indebtedness / Obligation (debt)
 *   C3: Withdrawal / Abandonment Threat (withdraw)
 *   C6: Option Suppression (opts)
 *
 * Components (reserved, M2 = 0):
 *   C4: Guilt / Shame Lever (guilt)
 *   C5: Resource Gatekeeping (gate_res)
 *
 * Red-line compliance (Charter §2):
 *   - No action recommendations
 *   - No identity attribution
 *   - Output = structural scores only
 */

"use strict";

const { applyNegationGuard } = require("./negation-guard");
// ─── DM Constants (PDD v0.1 — Node-05 + Node-03 verified) ─────────────

const DM_PATTERN_ID = "DM";
const DM_PATTERN_NAME = "Dependency Manipulation";
const DM_PATTERN_VERSION = "0.1.0";

/** Component weights (sum = 1.0, Node-03 verified) */
const DM_WEIGHTS = Object.freeze({
  excl:     0.20,  // C1: Exclusivity
  debt:     0.20,  // C2: Indebtedness
  withdraw: 0.35,  // C3: Withdrawal threat (highest — most coercive)
  opts:     0.25,  // C6: Option suppression
  // C4 (guilt) and C5 (gate_res) reserved — weight 0 in M2
});

/** Trigger thresholds (PDD §3.1) */
const DM_TRIGGER = Object.freeze({
  SUM_THRESHOLD: 1.20,           // component sum must reach this
  COMPONENT_THRESHOLD: 0.35,     // individual component min for "active"
  MIN_ACTIVE_COMPONENTS: 2,      // at least N components above threshold
  GATE_MIN: 2,                   // Three-Question Gate hit_count minimum
});

/** Gate multiplier lookup (PDD §5.1 — Node-05 original) */
const GATE_MULTIPLIERS = Object.freeze([0.3, 0.65, 1.0, 1.2]);

// ─── Feature Extraction (Rule-based, M2) ────────────────────────────
//
// IMPORTANT: This is structural pattern matching, NOT keyword scanning.
// We look for COMBINATIONS of signals, not individual words.
// A single word never equals manipulation (Charter principle).

/**
 * Exclusivity / Uniqueness signals (C1)
 * Detects: positioning self/other as sole or irreplaceable resource
 */
const EXCL_PATTERNS = [
  // Chinese
  /只有我/, /除了我[^\w]*沒有/, /沒有人.*比我/, /離開我.*[^\w]*(不行|完蛋|活不了)/,
  /唯一/, /你只能靠我/, /別人.*不(會|能|懂)/, /我是.*唯一/,
  // English
  /only\s+(i|me)\b/i, /nobody\s+else/i, /no\s*one\s+(but|except)\s+me/i,
  /can'?t\s+trust\s+anyone/i, /i'?m\s+the\s+only/i, /without\s+me.*nothing/i,
];

/**
 * Indebtedness / Obligation signals (C2)
 * Detects: framing interaction as debt/obligation
 */
const DEBT_PATTERNS = [
  // Chinese
  /你欠我/, /你應該/, /我為你.*做/, /你怎麼可以.*這樣對我/, /我付出.*這麼多/,
  /你.*對不起我/, /我犧牲/, /你不知感恩/,
  // English
  /you\s+owe\s+me/i, /after\s+(all|everything)\s+i('ve)?\s+(done|did)/i,
  /you\s+should\b/i, /i\s+sacrificed/i, /ungrateful/i, /how\s+dare\s+you/i,
  // M75 1A expansion: debt framing
  /after\s+all\s+i('ve)?\s+(done|been\s+through|put\s+up\s+with)/i,
  /i\s+(did|gave|spent|worked)\s+(everything|so\s+much|all)/i,
  /pay\s+(me|it)\s+back/i,
  /you\s+(don'?t|never)\s+(appreciate|value|acknowledge)/i,
  /i\s+thought\s+you\s+(cared|would)/i,
  /is\s+this\s+(how|what)\s+you\s+(repay|thank)/i,
  // M75 1A-3 expansion: debt escalation
  /throw\s+(it|that)\s+in\s+(your|my)\s+face/i,
  /can'?t\s+reject\s+me/i, /can'?t\s+say\s+no/i,
  /owe\s+me\s+(a|your|this)/i,
  /entitled/i, /deserve\s+(better|more|this)/i,
];

/**
 * Withdrawal / Abandonment threat signals (C3)
 * Detects: threatening to leave, cut off, go silent, withdraw support
 */
const WITHDRAW_PATTERNS = [
  // Chinese
  /我不會再/, /我要走了/, /你自己.*想辦法/, /我不管.*了/, /別再找我/,
  /以後.*不要.*來找我/, /你自己.*看著辦/, /我.*離開/, /不.*回應/,
  // English
  /i'?m\s+(leaving|done|out)/i, /don'?t\s+(contact|call|text)\s+me/i,
  /you'?re\s+on\s+your\s+own/i, /figure\s+it\s+out\s+yourself/i,
  /i\s+won'?t\s+(help|respond|reply)/i, /good\s*bye/i,
  // M75 1A expansion: withdrawal threat
  /don'?t\s+(come|bother)\s+(crying|asking|begging)/i,
  /you'?ll\s+(miss|need|regret\s+losing)\s+me/i,
  /see\s+how\s+(you|it)\s+(manage|go|work)\s+without/i,
];

/**
 * Option Suppression signals (C6)
 * Detects: denying, mocking, or invalidating alternatives
 */
const OPTS_PATTERNS = [
  // Chinese
  /別去找/, /他們不行/, /別人.*不(會|能|行)/, /不要.*相信.*別人/,
  /那是背叛/, /你.*沒有.*選擇/, /除了.*沒有.*別的/, /不准/,
  // English
  /don'?t\s+(go|talk)\s+to\s+(them|anyone|others)/i, /they\s+(can'?t|won'?t|don'?t)/i,
  /you\s+have\s+no\s+(choice|option)/i, /there'?s\s+no\s+(other|alternative)/i,
  /that'?s\s+(betrayal|disloyal)/i, /you\s+(can'?t|shouldn'?t)\s+leave/i,
];
const GUILT_PATTERNS = [
  // --- Bucket: impose (direct guilt imposition) ---
  // T1: direct scoring
  /you\s+should\s+(feel\s+)?guilty/i,           // G-01
  /you\s+should\s+(be\s+)?ashamed/i,            // G-03
  /you\s+have\s+no\s+conscience/i,              // L-EN1 (Node-05 new)
  /你應該(感到|覺得)?(愧疚|羞愧)/,                           // G-05
  /你怎麼對得起/,                                // G-06
  /你(還)?有沒有(良心|良知)/,                     // L-ZH1 (Node-05 new)
  // T2: conditional (medium strength in shadow mode)
  /how\s+can\s+you\s+live\s+with\s+yourself/i,  // G-02 (narrowed)
  /what\s+kind\s+of\s+person\s+does\s+that/i,   // L-EN2 (Node-05 new)
  // T3: synergy signal only (shared_with=blame)
  /this\s+is\s+(all\s+)?your\s+fault/i,         // G-04
  /這都是你的錯/,                                // G-07

  // --- Bucket: bridge (guilt as leverage to demand action) ---
  // T2: conditional triggers
  /don.?t\s+you\s+feel\s+(bad|guilty|ashamed)/i,                     // G-08
  /i\s+thought\s+you\s+cared.*(so|then).*(you|u).*(should|would)/i,  // G-09
  /you.?re\s+letting\s+me\s+down.*(so|then).*(you|u).*(should|need\s+to|have\s+to)/i, // G-10
  /if\s+you\s+really\s+cared.+you\s+would/i,                         // L-EN3 (Node-05 new)
  /你不覺得(內疚|愧疚|過意不去)嗎/,               // G-12 (narrowed)
  /我以為你會在意.*(所以|那你就).*(應該|要|得)/,   // G-13
  /如果你(真的)?在乎(我|我們).{0,8}你就(會|應該)/, // L-ZH3 (Node-05 new)

  // --- Bucket: moral_accounting (debt-guilt accumulation) ---
  // T1: direct scoring
  /you\s+owe\s+me\s+this/i,                     // G-17 (shared_with=debt)
  /我為你付出(了)?那麼多/,                        // G-19
  /你欠我/,                                      // G-21 (shared_with=debt)
  // T2: conditional (need 2nd person co-occurrence)
  /i\s+sacrificed\s+everything.*(for\s+you|because\s+of\s+you)/i,    // G-15
  /i\s+expected\s+better\s+from\s+you.*(as\s+a\s+person|from\s+someone\s+like\s+you)/i, // G-18
  /我犧牲了一切(.*(為了你|因為你))/,               // G-20
  /你讓我(太)?失望.*(你怎麼|你居然|對得起|良心)/,  // G-22
  /我(都)?(為你|替你).{0,6}做.{0,6}到這樣/,       // L-ZH2 (Node-05 new)
  // T3: synergy signal only
  /after\s+(all|everything)\s+i.?ve?\s+(done|sacrificed)/i,  // G-14 (shared_with=debt)
  /look\s+what\s+you.?ve?\s+done\s+to\s+me/i,               // G-16 (shared_with=EA)
];

/**
 * Score a single component by counting structural signal matches.
 * @param {string} input - text segment
 * @param {RegExp[]} patterns - signal patterns for this component
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
  return Math.min(1.0, 0.8 + matchCount * 0.05); // diminishing returns
}

// ─── DM Evaluator ───────────────────────────────────────────────────

/**
 * Extract DM component scores from input text.
 * @param {string} input
 * @returns {Object} component_scores { excl, debt, withdraw, guilt, gate_res, opts }
 */
function extractDMComponents(input) {
  return {
    excl:     scoreComponent(input, EXCL_PATTERNS),
    debt:     scoreComponent(input, DEBT_PATTERNS),
    withdraw: scoreComponent(input, WITHDRAW_PATTERNS),
    guilt:    applyNegationGuard(scoreComponent(input, GUILT_PATTERNS), input),
    gate_res: 0,  // C5: reserved for future
    opts:     scoreComponent(input, OPTS_PATTERNS),
  };
}

/**
 * Check if DM structural trigger conditions are met (PDD §3.1).
 * @param {Object} components - component_scores
 * @returns {boolean}
 */
function isDMStructureTriggered(components) {
  const activeScores = [components.excl, components.debt, components.withdraw, components.opts];
  const sum = activeScores.reduce((a, b) => a + b, 0);
  const aboveThreshold = activeScores.filter(s => s > DM_TRIGGER.COMPONENT_THRESHOLD).length;

  return sum >= DM_TRIGGER.SUM_THRESHOLD && aboveThreshold >= DM_TRIGGER.MIN_ACTIVE_COMPONENTS;
}

/**
 * Compute DM score using PDD §5.1 formula.
 * @param {Object} components - component_scores
 * @param {number} gateHit - Three-Question Gate hit_count (0-3)
 * @returns {{ detected: boolean, score: number, components: Object }}
 */
function evaluateDM(input, gateHit) {
  const components = extractDMComponents(input);

  const structureTriggered = isDMStructureTriggered(components);
  const gateTriggered = gateHit >= DM_TRIGGER.GATE_MIN;
  const detected = structureTriggered && gateTriggered;

  if (!detected) {
    return { detected: false, score: 0, components };
  }

  // Weighted raw score (PDD §5.1)
  const raw =
    DM_WEIGHTS.excl * components.excl +
    DM_WEIGHTS.debt * components.debt +
    DM_WEIGHTS.withdraw * components.withdraw +
    DM_WEIGHTS.opts * components.opts;

  // Gate multiplier (Node-05 original: 0.6, 0.8, 1.0, 1.2)
  const gateMult = GATE_MULTIPLIERS[Math.min(gateHit, 3)];

  // Final score, clamped to [0, 1]
  const score = Math.min(1.0, raw * gateMult);

  return { detected, score, components };
}

// ─── Exports ─────────────────────────────────────────────────────────

module.exports = {
  DM_PATTERN_ID,
  DM_PATTERN_NAME,
  DM_PATTERN_VERSION,
  DM_WEIGHTS,
  DM_TRIGGER,
  GATE_MULTIPLIERS,
  extractDMComponents,
  isDMStructureTriggered,
  evaluateDM,
  // Exposed for testing:
  scoreComponent,
  EXCL_PATTERNS,
  DEBT_PATTERNS,
  WITHDRAW_PATTERNS,
  OPTS_PATTERNS,
};
