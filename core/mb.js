/**
 * Lumen ISSP — MB: Moral Blackmail (Push Channel)
 * PDD v0.2 — revised per M37 Council Review
 *   Node-05 (WS1): moral_consequence required, guilt vs debt differentiation
 *   Node-03 (CI): unified gate_mult, balanced weights, threshold adjust
 *
 * Components (v0.2):
 *   C1: guilt_invoke       — MORAL guilt (shame, moral failing)
 *   C2: collective_pressure — group/society/community as leverage
 *   C3: sacrifice_demand   — demanding sacrifice of self-interest/rights
 *   C4: moral_consequence  — REQUIRED: harm to others if you refuse
 *
 * Differential diagnosis vs DM (Node-05 §2.2):
 *   MB.guilt_invoke = moral judgment ("you're bad / you're hurting everyone")
 *   DM.debt = transactional ("I did X for you, so you owe me")
 *   MB.collective_pressure = "group/society" framing
 *   FC.binary_frame = "A or B" structure (MB doesn't use binary framing)
 *
 * v0.2 key change: moral_consequence > 0 is REQUIRED for MB detection.
 * Without moral consequence, it's not moral blackmail.
 */

"use strict";

const { applyNegationGuard } = require("./negation-guard");
const MB_PATTERN_ID = "MB";
const MB_PATTERN_NAME = "Moral Blackmail";
const MB_PATTERN_VERSION = "0.2.0";

/** Component weights (sum = 1.0) — Node-03 balanced */
const MB_WEIGHTS = Object.freeze({
  guilt_invoke:        0.30,
  collective_pressure: 0.25,
  sacrifice_demand:    0.25,
  moral_consequence:   0.20,
});

/** Unified gate_mult (Node-03 CI — same as DM/FC) */
const MB_GATE_MULTIPLIERS = Object.freeze([0.30, 0.65, 1.00, 1.20]);

/** Trigger thresholds (v0.2 — Node-03 adjusted) */
const MB_TRIGGER = Object.freeze({
  SUM_THRESHOLD: 0.70,
  COMPONENT_THRESHOLD: 0.25,
  MIN_ACTIVE_COMPONENTS: 2,
  GATE_MIN: 2,
});

// ─── Feature Patterns ───────────────────────────────────────────────

/**
 * Guilt Invoke (C1) — MORAL guilt, NOT transactional debt
 * Detects: shame, moral failing, "how could you" judgment
 * Differential from DM.debt: MB guilt uses moral judgment words,
 * DM debt uses "I did X for you" transactional framing.
 */
const GUILT_INVOKE_PATTERNS = [
  // Chinese — moral judgment guilt
  /罪惡感/, /慚愧/, /羞恥/, /良心/, /你怎麼忍心/, /你於心何忍/,
  /問心無愧嗎/, /你不覺得.*愧/, /你好意思/, /過意.*去/,
  // Simplified
  /罪恶感/, /惭愧/, /羞耻/,
  // English — moral judgment (NOT "I did X for you")
  /guilt/i, /shame/i, /ashamed/i, /conscience/i,
  /how\s+could\s+you/i, /live\s+with\s+yourself/i, /sleep\s+at\s+night/i,
  /you\s+should\s+(feel|be)\s+(bad|guilty|ashamed)/i,
  /don'?t\s+you\s+feel\s+guilty/i,
  // M75 1A-2 expansion: spiritual/religious guilt
  /god\s+(is\s+watching|will\s+judge|sees)/i,
  /judgment\s+day/i, /sin(ful|ning|ner)?/i,
  /judas/i, /betrayer/i,
  /hell\s+(awaits|is\s+waiting)/i,
  /pray\s+for\s+(your|forgiveness)/i,
];

/** Collective Pressure (C2) — group/society as moral leverage */
const COLLECTIVE_PRESSURE_PATTERNS = [
  /社群/, /社會/, /大家/, /群體/, /團隊/, /國家/, /民族/,
  /所有人/, /每個人/, /我們都/, /大家都在/, /別人都/,
  /集體/, /社區/, /全.*人/,
  /社会/, /团队/, /国家/,
  /society/i, /community/i, /everyone/i, /the\s+group/i, /the\s+team/i,
  /nation/i, /people\s+are\s+counting/i, /we\s+all/i, /others\s+are/i,
  /the\s+world/i, /your\s+family/i, /your\s+country/i,
  // M75 1A expansion: loyalty/identity test
  /not\s+(really|truly)\s+(my|our|a)\s+(friend|ally|supporter)/i,
  /real\s+(friend|supporter|patriot|ally|believer)s?/i,
  /true\s+(friend|supporter|patriot|ally|believer)s?/i,
  /prove\s+(you'?re|that\s+you'?re|your)/i,
  /if\s+you\s+(really|truly)\s+(care[d]?|love[d]?|support)/i,
  /one\s+of\s+us/i,
  /you'?re\s+(with\s+us|against\s+us)/i,
  /not\s+one\s+of\s+us/i,
  /真正.*朋友/, /自己人/, /我們這邊/, /忠誠/,
  /你是不是.*自己人/, /你到底.*站.*邊/,
];

/**
 * Sacrifice Demand (C3) — demanding sacrifice of self-interest/rights
 * NOT just "you should do X" — specifically "give up your X for Y"
 */
const SACRIFICE_DEMAND_PATTERNS = [
  /道德/, /義務/, /責任/, /犧牲/, /奉獻/, /應該/,
  /你有.*責任/, /你的.*義務/, /做人.*道理/,
  /捨己/, /為了.*大局/, /顧全大局/,
  /义务/, /责任/, /牺牲/, /奉献/,
  /duty/i, /obligation/i, /responsibility/i, /sacrifice/i,
  /you\s+(must|should|have\s+to|need\s+to)/i,
  /it'?s\s+your\s+(duty|responsibility)/i, /moral\s+(duty|obligation)/i,
  /owe\s+it\s+to/i, /for\s+the\s+greater\s+good/i,
];

/**
 * Moral Consequence (C4) — REQUIRED for MB detection (Node-05 v0.2)
 * What happens to OTHERS if you don't comply
 * Must contain explicit value-judgment words (錯/壞/不應該)
 */
const MORAL_CONSEQUENCE_PATTERNS = [
  /如果你不/, /你不.*就會/, /不然.*受苦/, /否則.*後果/,
  /都是你的錯/, /你害的/, /你造成/,
  /你不做.*誰做/, /血.*手上/,
  /都是你的错/, /你害的/,
  /if\s+you\s+don'?t/i, /suffer/i, /blood\s+on\s+your\s+hands/i,
  /because\s+of\s+you/i, /your\s+fault/i, /you'?ll\s+be\s+responsible/i,
  /people\s+will\s+(suffer|die|hurt)/i, /on\s+your\s+conscience/i,
  /you'?re\s+letting.*down/i, /(you\s+are|you'?re)\s+letting.*down/i,
  /fail(ing)?\s+(them|everyone|us)/i,
  // M75 1A expansion: moral consequence
  /disappoint(ed|ing)?\s+(everyone|us|them|people)/i,
  /let(ting)?\s+(us|them|everyone|people)\s+down/i,
  /abandon(ing|ed)?\s+(us|them|everyone)/i,
  /betray(ing|ed)?/i,
  // M75 1A-2 expansion: implicit moral consequence
  /what\s+happened\s+to/i,
  /you\s+know\s+what\s+happens/i,
  /step\s+down/i, /step\s+aside/i,
  /don'?t\s+(deserve|belong)/i,
  /chas(e|ing)\s+(likes|clout|attention|fame)/i,
  /instead\s+of\s+(help|act|do)/i,
  /all\s+talk/i, /hypocrit/i,
  /selfish/i, /self-centered/i,
  // M75 1A-3 expansion: implicit moral standard
  /I\s+(never|would\s+never|always)/i,
  /I\s+would\s+have/i,
  /a\s+(real|true|good)\s+(friend|person|partner)\s+would/i,
  /you\s+should\s+have/i,
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

// ─── MB Evaluator ───────────────────────────────────────────────────

function extractMBComponents(input) {
  return {
    guilt_invoke:        applyNegationGuard(scoreComponent(input, GUILT_INVOKE_PATTERNS), input),
    collective_pressure: scoreComponent(input, COLLECTIVE_PRESSURE_PATTERNS),
    sacrifice_demand:    scoreComponent(input, SACRIFICE_DEMAND_PATTERNS),
    moral_consequence:   scoreComponent(input, MORAL_CONSEQUENCE_PATTERNS),
  };
}

function evaluateMBGate(components) {
  const t = MB_TRIGGER.COMPONENT_THRESHOLD;
  const g1 = components.sacrifice_demand > t;
  const g2 = components.guilt_invoke > t || components.collective_pressure > t;
  const g3 = components.moral_consequence > t;
  return { g1, g2, g3, hit_count: [g1, g2, g3].filter(Boolean).length };
}

/**
 * v0.2: moral_consequence > 0 is REQUIRED (Node-05 decision)
 * Without moral consequence, it's not moral blackmail.
 */
function isMBStructureTriggered(components) {
  // Node-05 v0.2: moral_consequence must be present
  if (components.moral_consequence === 0) return false;

  const scores = [components.guilt_invoke, components.collective_pressure,
                  components.sacrifice_demand, components.moral_consequence];
  const sum = scores.reduce((a, b) => a + b, 0);
  const active = scores.filter(s => s > MB_TRIGGER.COMPONENT_THRESHOLD).length;
  return sum >= MB_TRIGGER.SUM_THRESHOLD && active >= MB_TRIGGER.MIN_ACTIVE_COMPONENTS;
}

function evaluateMB(input, gateHit) {
  const components = extractMBComponents(input);
  const detected = isMBStructureTriggered(components) && gateHit >= MB_TRIGGER.GATE_MIN;
  if (!detected) return { detected: false, score: 0, components };

  const base =
    MB_WEIGHTS.guilt_invoke        * components.guilt_invoke +
    MB_WEIGHTS.collective_pressure * components.collective_pressure +
    MB_WEIGHTS.sacrifice_demand    * components.sacrifice_demand +
    MB_WEIGHTS.moral_consequence   * components.moral_consequence;

  const gateMult = MB_GATE_MULTIPLIERS[Math.min(gateHit, 3)];
  const score = Math.min(1.0, base * gateMult);
  return { detected, score, components };
}

module.exports = {
  MB_PATTERN_ID, MB_PATTERN_NAME, MB_PATTERN_VERSION,
  MB_WEIGHTS, MB_GATE_MULTIPLIERS, MB_TRIGGER,
  extractMBComponents, evaluateMBGate, isMBStructureTriggered, evaluateMB,
  GUILT_INVOKE_PATTERNS, COLLECTIVE_PRESSURE_PATTERNS,
  SACRIFICE_DEMAND_PATTERNS, MORAL_CONSEQUENCE_PATTERNS,
};
