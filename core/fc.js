/**
 * Lumen ISSP — FC: Forced-Choice (Push Channel)
 * PDD v0.2 — revised per M37 Council Review
 *   Node-05 (WS1): label_attack→optional booster, urgency→closure_pressure
 *   Node-03 (CI): unified gate_mult, balanced weights, threshold adjust
 *
 * Components (v0.2):
 *   C1: binary_frame      — explicit A-or-B structure (core)
 *   C2: consequence        — punishment/loss for not choosing (core)
 *   C3: closure_pressure   — closing decision window, NOT just deadline (core)
 *   C4: label_attack       — OPTIONAL BOOSTER (intensity only)
 *
 * Differential diagnosis vs DM (Node-05 §2.1):
 *   FC.binary_frame = explicit "A or B" structure
 *   DM.exclusivity = relationship-based "only I" claims
 */

"use strict";

const FC_PATTERN_ID = "FC";
const FC_PATTERN_NAME = "Forced-Choice";
const FC_PATTERN_VERSION = "0.2.0";

/** Core weights (sum = 1.0). label_attack is separate booster. */
const FC_WEIGHTS = Object.freeze({
  binary_frame:     0.35,
  consequence:      0.35,
  closure_pressure: 0.30,
});
const FC_LABEL_BOOST = 0.10;

/** Unified gate_mult (Node-03 CI — all Patterns) */
const FC_GATE_MULTIPLIERS = Object.freeze([0.30, 0.65, 1.00, 1.20]);

/** Trigger thresholds (v0.2 — Node-03 adjusted) */
const FC_TRIGGER = Object.freeze({
  SUM_THRESHOLD: 0.70,
  COMPONENT_THRESHOLD: 0.25,
  MIN_ACTIVE_COMPONENTS: 2,
  GATE_MIN: 2,
});

// ─── Feature Patterns ───────────────────────────────────────────────

const BINARY_FRAME_PATTERNS = [
  /還是/, /二選一/, /選一個/, /選邊站/, /只能選/, /A.*B.*選/,
  /你選.*還是/, /要嘛.*要嘛/, /只有兩(條|個|種)路/,
  // TR-003 expansion: 不X就是Y / 只有...才 / 沒有中間
  /不.*就是.*(?:站|對|敵|錯|壞)/, /沒有中間/, /沒有第三/,
  /只有.*才/, /不是.*就是/, /非.*即/,
  /\bor\s+(get|be|face|lose|die|leave|else|suffer|find)/i,
  /choose\s+(one|your\s+side)/i, /pick\s+one/i,
  /either\s+.+\s+or\s+/i, /which\s+(one|would|do)\s/i,
  /A\s*\.?\s*OR\s*\.?\s*B/i, /this\s+or\s+that/i,
];

const CONSEQUENCE_PATTERNS = [
  /不選就/, /不然/, /否則/, /後悔/, /你會.*後悔/, /不.*就是.*懦/,
  /不.*就.*叛/, /不.*就.*死/, /不.*就.*完/, /不選.*代價/,
  /regret/i, /or\s+else/i, /if\s+you\s+don'?t/i, /you'?ll\s+be\s+sorry/i,
  /suffer/i, /consequences/i, /pay\s+the\s+price/i, /too\s+late/i,
  /miss\s+out/i, /lose\s+(everything|it\s+all)/i,
  // M75 1A expansion: deadline consequence
  /let\s+you\s+go/i, /fire[d]?\s+you/i, /terminate[d]?/i,
  /banned/i, /kicked\s+out/i, /removed/i,
  /unless\s+(you|we|I)/i, /or\s+you\s+will/i,
  // M75 1A-2 expansion: implicit consequence
  /find\s+(another|somewhere\s+else|your\s+own)/i,
  /good\s+luck\s+(with|finding|getting)/i,
  /on\s+your\s+own/i,
  /not\s+my\s+problem/i,
  /deal\s+with\s+it/i,
  /take\s+it\s+or\s+leave\s+it/i,
  /walk\s+away/i, /move\s+on/i,
];

const CLOSURE_PRESSURE_PATTERNS = [
  /現在.*選/, /馬上.*決定/, /立刻/, /再不.*就/, /來不及/,
  /最後機會/, /倒計時/, /沒有下次/, /機會.*只有.*一次/,
  /不能再等/, /時間到了/,
  /\bnow\s+or\s+never\b/i, /last\s+chance/i, /final\s+(offer|chance|decision)/i,
  /before\s+it'?s\s+too\s+late/i, /time\s+is\s+(up|running)/i,
  /no\s+more\s+(time|chances)/i, /decide\s+now/i, /act\s+(now|fast)/i,
  /closing.*window/i,
  // M75 1A expansion: time deadline pressure
  /\d+\s*(hours?|days?|weeks?|minutes?)\s*(left|remaining|to\s+go)/i,
  /in\s+\d+\s*(hours?|days?|weeks?|minutes?)/i,
  /deadline/i, /expir(e[sd]?|ing|y)/i,
  /limited\s+time/i, /offer\s+ends/i,
  /immediately/i, /right\s+now/i,
  /as\s+soon\s+as\s+possible/i, /urgent(ly)?/i,
  // M75 1A-3 expansion: have X hours/days to
  /(have|got|only)\s+\d+\s*(hours?|days?|minutes?)\s*(to|left|before)/i,
  /within\s+(that|this|the)\s+(window|period|time)/i,
  /given\s+away/i, /someone\s+else\s+(will|is)/i,
];

const LABEL_ATTACK_PATTERNS = [
  /懦夫/, /叛徒/, /膽小鬼/, /孬/, /孬种/, /沒用/, /窩囊/,
  /沒骨氣/, /縮頭烏龜/, /怕了/, /不敢/,
  /coward/i, /traitor/i, /weak/i, /pathetic/i, /gutless/i,
  /chicken/i, /spineless/i, /afraid/i, /you'?re\s+scared/i,
  /loser/i, /wimp/i,
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

// ─── FC Evaluator ───────────────────────────────────────────────────

function extractFCComponents(input) {
  return {
    binary_frame:     scoreComponent(input, BINARY_FRAME_PATTERNS),
    consequence:      scoreComponent(input, CONSEQUENCE_PATTERNS),
    closure_pressure: scoreComponent(input, CLOSURE_PRESSURE_PATTERNS),
    label_attack:     scoreComponent(input, LABEL_ATTACK_PATTERNS),
  };
}

function evaluateFCGate(components) {
  const t = FC_TRIGGER.COMPONENT_THRESHOLD;
  const g1 = components.binary_frame > t;
  const g2 = components.consequence > t || components.closure_pressure > t;
  const g3 = components.closure_pressure > t;
  return { g1, g2, g3, hit_count: [g1, g2, g3].filter(Boolean).length };
}

function isFCStructureTriggered(components) {
  const core = [components.binary_frame, components.consequence, components.closure_pressure];
  const coreSum = core.reduce((a, b) => a + b, 0);
  const active = core.filter(s => s > FC_TRIGGER.COMPONENT_THRESHOLD).length;
  return coreSum >= FC_TRIGGER.SUM_THRESHOLD && active >= FC_TRIGGER.MIN_ACTIVE_COMPONENTS;
}

function evaluateFC(input, gateHit) {
  const components = extractFCComponents(input);
  const detected = isFCStructureTriggered(components) && gateHit >= FC_TRIGGER.GATE_MIN;
  if (!detected) return { detected: false, score: 0, components };

  const coreBase =
    FC_WEIGHTS.binary_frame     * components.binary_frame +
    FC_WEIGHTS.consequence      * components.consequence +
    FC_WEIGHTS.closure_pressure * components.closure_pressure;
  const labelBoost = FC_LABEL_BOOST * components.label_attack;
  const gateMult = FC_GATE_MULTIPLIERS[Math.min(gateHit, 3)];
  const score = Math.min(1.0, (coreBase + labelBoost) * gateMult);
  return { detected, score, components };
}

module.exports = {
  FC_PATTERN_ID, FC_PATTERN_NAME, FC_PATTERN_VERSION,
  FC_WEIGHTS, FC_LABEL_BOOST, FC_GATE_MULTIPLIERS, FC_TRIGGER,
  extractFCComponents, evaluateFCGate, isFCStructureTriggered, evaluateFC,
  BINARY_FRAME_PATTERNS, CONSEQUENCE_PATTERNS, CLOSURE_PRESSURE_PATTERNS, LABEL_ATTACK_PATTERNS,
};
