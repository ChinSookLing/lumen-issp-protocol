/**
 * Lumen ISSP — Emotional-Provocation (Push Channel)
 * PDD v0.1 — three-party process:
 *   Node-05 (WS1):    structural design + component definitions + differential diagnosis
 *   Node-03 (CI): math verification + threshold analysis + boundary testing
 *   Node-01 (GK):   red-line compliance + Schema/IR alignment + rulings
 *
 * PURPOSE: Detect escalation-to-response manipulation — not "anger" or "rudeness"
 * but a structural chain: bait/taunt → escalation → forced response frame.
 * The pattern forces the target into a conflict/stance/reaction framework.
 *
 * Components (3 core + 1 booster):
 *   C1: bait_or_taunt        — Provocation/mockery to ignite emotion (0.35)
 *   C2: escalation_pressure  — Intensify confrontation / introduce shame threat (0.30)
 *   C3: forced_response_frame — Force stance / silence=loss=admission (0.25)
 *   B1: label_or_shame_hook  — Label/shame booster: adds score, never triggers alone (0.10)
 *
 * Score: final = base(C1+C2+C3) + 0.10 × B1
 *
 * Hard constraint (OR gate — Node-05 design, Node-03 verified):
 *   forced_response_frame ≥ 0.50  OR  escalation_pressure ≥ 0.60
 *   Without forced-response or strong escalation = not EP, just rudeness
 *
 * Differential diagnosis (Node-05 §3):
 *   EP vs FC: FC = conditional choice closure; EP = escalation chain forcing reaction
 *   EP vs MB: MB needs moral_consequence; EP doesn't need moral framework
 *   EP vs DM: DM = dependency/exclusivity/debt; EP = provocation/escalation/forced response
 *   EP vs EA: EA = emotional lock/attachment; EP = confrontational escalation/shame pressure
 *   EP vs GC: GC = savior/exclusive authority; EP = interactive escalation framework
 *   EP vs IP: IP = identity extraction; EP = forced stance, no personal data
 *
 * Retreat protocol (locked in PDD):
 *   Cultural false positive >10% → reduce scope (raise thresholds)
 *   Still unstable → move EP context details to Route C experiment branch
 *
 * Gate: Shared Push Gate (M47 Node-05 argument, Part 6 §6.3 satisfied)
 *
 * Red-line compliance:
 *   §2.1: No action advice
 *   §2.2: Detects "EP structural signal", NOT "you are provoking"
 *   §2.3: evidence_hash only, no raw text
 *   §2.5: extraction_method = "rule"
 */

"use strict";

const EP_PATTERN_ID = "emotional_provocation";
const EP_PATTERN_NAME = "emotional-provocation";
const EP_PATTERN_VERSION = "0.1.0";

/**
 * Weights (Node-05 design, Node-03 verified, Node-01 GK approved):
 * 3+1 structure: 3 core components + 1 booster
 * base = C1(0.35) + C2(0.30) + C3(0.25) = 0.90
 * final = base + 0.10 × B1
 */
const EP_WEIGHTS = Object.freeze({
  bait_or_taunt:         0.35,
  escalation_pressure:   0.30,
  forced_response_frame: 0.25,
});
const EP_BOOSTER_WEIGHT = 0.10;

/** Unified gate_mult */
const EP_GATE_MULTIPLIERS = Object.freeze([0.30, 0.65, 1.00, 1.20]);

/** Trigger thresholds */
const EP_TRIGGER = Object.freeze({
  SUM_THRESHOLD: 0.60,
  FORCED_RESPONSE_HARD_MIN: 0.50,
  ESCALATION_HARD_MIN: 0.60,
  COMPONENT_THRESHOLD: 0.25,
  MIN_ACTIVE_COMPONENTS: 2,   // of 3 core components
  GATE_MIN: 2,
});

// ─── Feature Patterns ───────────────────────────────────────────────

/** C1: Bait or Taunt — provocation/mockery to ignite emotion */
const BAIT_OR_TAUNT_PATTERNS = [
  // Chinese
  /你敢不敢/, /你有種/, /你有膽/, /你有本事/,
  /你是不是.*不敢/, /你是不是.*怕/,
  /懦夫/, /膽小鬼/, /沒用/, /沒種/, /廢物/,
  /你算什麼/, /你算老幾/, /你以為你是誰/,
  /笑死/, /可笑/, /丟臉/, /可悲/, /可憐/,
  /你連.*都不敢/, /你連.*都做不到/,
  /就這樣？/, /就這？/, /就這點本事/,
  // Simplified
  /你敢不敢/, /你有种/, /你有胆/, /懦夫/, /胆小鬼/,
  /废物/, /你算什么/, /笑死/, /可笑/, /丢脸/,
  /你连.*都不敢/, /就这样？/, /就这点本事/,
  // English
  /you\s+wouldn'?t\s+dare/i, /are\s+you\s+(scared|afraid)/i,
  /coward/i, /pathetic/i,
  // TR-007 EP Chinese shame
  /心虛/, /膽小/, /沒種/, /沒膽/, /廢物/, /窩囊/,
  /丟臉/, /丟人/, /不要臉/, /無恥/, /loser/i, /weakling/i,
  /you\s+call\s+that/i, /is\s+that\s+(all|it)/i,
  /what\s+a\s+joke/i, /laughable/i, /pitiful/i,
  /you\s+can'?t\s+even/i, /too\s+(scared|weak|afraid)\s+to/i,
  /who\s+do\s+you\s+think\s+you\s+are/i,
  /man\s+up/i, /grow\s+(a\s+)?(spine|backbone|pair)/i,
  // M74 TR-002 expansion: insult labels + ridicule
  /idiot/i, /stupid/i, /moron/i, /sheeple/i, /clown/i,
  /imagine\s+being\s+(this|so|that)/i,
  /how\s+(dumb|stupid|blind)\s+(can|are)\s+you/i,
];

/** C2: Escalation Pressure — intensify confrontation / shame threat */
const ESCALATION_PRESSURE_PATTERNS = [
  // Chinese
  /大家都知道你/, /大家都看到/, /所有人都在看/,
  /你.*丟臉/, /你.*出醜/, /你.*笑話/,
  /我要讓.*知道/, /等著看/, /走著瞧/,
  /你會後悔/, /你完了/, /你等著/,
  /越來越/, /更加/, /變本加厲/,
  /你再.*試試/, /你繼續.*看看/,
  // Simplified
  /大家都知道你/, /大家都看到/, /你.*丢脸/, /你.*出丑/,
  /我要让.*知道/, /等着看/, /走着瞧/,
  /你会后悔/, /你完了/, /你等着/,
  // English
  /everyone\s+(knows?|can\s+see|sees?|will\s+see)/i,
  /you'?ll\s+(regret|be\s+sorry)/i,
  /watch\s+(what\s+happens|out)/i, /just\s+wait/i,
  /you'?re\s+(done|finished)/i, /it'?s\s+over\s+for\s+you/i,
  /humiliat/i, /embarrass/i, /expose\s+you/i,
  /I'?ll\s+(make|show)\s+(sure\s+)?everyone/i,
  /keep\s+(going|talking)\s+and\s+see/i,
  /you'?re\s+making\s+(it|this)\s+worse/i,
  // M74 TR-002 expansion: consequence threats
  /deserve/i, /you\s+(asked|brought\s+this)\s+(for|on)/i,
  /what\s+(is|'?s)\s+coming\s+(to|for)/i,
];

/** C3: Forced Response Frame — force stance / silence=loss=admission */
const FORCED_RESPONSE_PATTERNS = [
  // Chinese
  /你.*回答/, /你.*說啊/, /你.*講啊/, /你倒是說/, /你說不說/,
  /不敢回.*嗎/, /不敢說.*嗎/, /怎麼不說話/,
  /沉默.*就是.*承認/, /不說.*就是.*默認/, /不回.*就是.*認了/,
  /你不回應.*就/, /你不說.*就/,
  /有本事.*回/, /有膽.*回/, /有種.*回/,
  /是不是不敢/, /是不是心虛/, /怎麼不敢/,
  // Simplified
  /你.*回答/, /你.*说啊/, /你倒是说/, /你说不说/,
  /不敢回.*吗/, /怎么不说话/,
  /沉默.*就是.*承认/, /不说.*就是.*默认/,
  /有本事.*回/, /是不是不敢/, /是不是心虚/,
  // English
  /answer\s+me/i, /say\s+(it|something)/i, /go\s+(ahead|on)\s*,?\s*say\s+it/i,
  /silence.*means?\s+(you\s+)?(agree|admit|accept)/i,
  /if\s+you\s+don'?t\s+(respond|answer|say)/i,
  /cat\s+got\s+your\s+tongue/i, /nothing\s+to\s+say/i,
  /why\s+(won'?t|don'?t)\s+you\s+(answer|respond|say)/i,
  /afraid\s+to\s+(answer|respond|say)/i,
  // M74 TR-002 expansion: silence=guilt framing
  /silence\s+is\s+(violence|complicity|consent|approval|agreement)/i,
  /if\s+you\s+(say|do)\s+nothing/i,
  /staying\s+silent\s+(means?|is)/i,
  // M75 1A expansion: forced response + silence framing
  /silence\s+is\s+(a\s+)?(yes|no|answer|endorsement|admission)/i,
  /your\s+silence\s+(is|means|says|tells)/i,
  /not\s+speak(ing)?\s+up\s+(is|means)/i,
  /speak\s+up\s+or/i,
  /if\s+you\s+don'?t\s+speak\s+up/i,
  /you\s+(must|need\s+to|have\s+to)\s+(speak|say|respond|answer)/i,
  // TR-007 EP Chinese forced_response
  /不回答就是/, /不回[，,]就是/, /不說話就是/, /不回就是/, /不回應就是/,
  /沉默就是/, /沉默代表/, /不開口/,
  // M75 1A-3 expansion: coercion/blackmail forced response
  /cooperate/i, /comply/i, /obey/i,
  /send\s+(money|payment|cash)/i,
  /count\s*down/i, /timer/i, /ticking/i,
  /prove\s+(it|me\s+wrong)/i, /I\s+dare\s+you\s+to/i,
  // M75 1A expansion: escalation + ultimatum framing
  /before\s+it'?s\s+too\s+late/i,
  /now\s+or\s+never/i,
  /last\s+chance/i,
  /you'?ll\s+regret/i,
  /don'?t\s+say\s+(I|we)\s+didn'?t\s+warn/i,
  // TR-007 EP Chinese escalation
  /別怪我/, /自己看著辦/, /後果自負/, /你自找的/,
  /別說我沒/, /到時候別/, /你等著/,
  /you\s+(will|are\s+going\s+to)\s+(lose|regret|suffer|pay)/i,
];

/** B1: Label or Shame Hook — booster only, never triggers alone */
const LABEL_SHAME_PATTERNS = [
  // Chinese
  /你就是.*懦夫/, /你就是.*廢物/, /你就是.*沒用/,
  /果然.*不行/, /果然.*不敢/, /果然.*膽小/,
  /丟人/, /丟臉/, /去臉/, /羞恥/,
  /活該/, /自找的/, /怪不了別人/,
  /你這種人/, /你們這種/, /像你這樣/,
  // Simplified
  /你就是.*懦夫/, /你就是.*废物/, /你就是.*没用/,
  /果然.*不行/, /果然.*不敢/,
  /丢人/, /丢脸/, /羞耻/,
  /你这种人/, /像你这样/,
  // English
  /you\s+are\s+(nothing|a\s+coward|pathetic|worthless)/i,
  /just\s+as\s+I\s+(thought|expected)/i,
  /shame\s+on\s+you/i, /you\s+should\s+be\s+ashamed/i,
  /people\s+like\s+you/i, /your\s+kind/i,
  /that'?s\s+what\s+I\s+thought/i,
  /typical/i, /figures?/i,
  // M74 TR-002 expansion: guilt-by-association labels
  /part\s+of\s+the\s+problem/i,
  /you\s+are\s+(the|no)\s+(problem|different)/i,
  /enabler/i, /complicit/i, /apologist/i,
  /pathetic/i, /worthless/i, /disgrace/i,
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

// ─── EP Evaluator ───────────────────────────────────────────────────

/**
 * Extract EP components from input.
 * Returns 3 core + 1 booster.
 */
function extractEPComponents(input) {
  return {
    bait_or_taunt:         scorePatterns(input, BAIT_OR_TAUNT_PATTERNS),
    escalation_pressure:   scorePatterns(input, ESCALATION_PRESSURE_PATTERNS),
    forced_response_frame: scorePatterns(input, FORCED_RESPONSE_PATTERNS),
    label_or_shame_hook:   scorePatterns(input, LABEL_SHAME_PATTERNS),
  };
}

/**
 * Hard constraint (OR gate — Node-05 design, Node-03 verified, Node-01 approved):
 *   forced_response_frame ≥ 0.50 OR escalation_pressure ≥ 0.60
 *   Two entry points: forced-response type OR strong-escalation type
 */
function isEPStructureTriggered(components) {
  // OR hard constraint on core components only
  const hardPass = components.forced_response_frame >= EP_TRIGGER.FORCED_RESPONSE_HARD_MIN ||
                   components.escalation_pressure >= EP_TRIGGER.ESCALATION_HARD_MIN;
  if (!hardPass) return false;

  // base from 3 core components (booster excluded from base threshold check)
  const base = EP_WEIGHTS.bait_or_taunt * components.bait_or_taunt +
               EP_WEIGHTS.escalation_pressure * components.escalation_pressure +
               EP_WEIGHTS.forced_response_frame * components.forced_response_frame;

  // MIN_ACTIVE: count of 3 core components above threshold
  const coreScores = [components.bait_or_taunt, components.escalation_pressure,
                      components.forced_response_frame];
  const active = coreScores.filter(s => s > EP_TRIGGER.COMPONENT_THRESHOLD).length;

  // final = base + booster
  const final = base + EP_BOOSTER_WEIGHT * components.label_or_shame_hook;

  return final >= EP_TRIGGER.SUM_THRESHOLD && active >= EP_TRIGGER.MIN_ACTIVE_COMPONENTS;
}

function evaluateEP(input, gateHit) {
  const components = extractEPComponents(input);
  const detected = isEPStructureTriggered(components) && gateHit >= EP_TRIGGER.GATE_MIN;
  if (!detected) return { detected: false, score: 0, components };

  const base = EP_WEIGHTS.bait_or_taunt * components.bait_or_taunt +
               EP_WEIGHTS.escalation_pressure * components.escalation_pressure +
               EP_WEIGHTS.forced_response_frame * components.forced_response_frame;
  const final = base + EP_BOOSTER_WEIGHT * components.label_or_shame_hook;

  const gateMult = EP_GATE_MULTIPLIERS[Math.min(gateHit, 3)];
  const score = Math.min(1.0, final * gateMult);
  return { detected, score, components };
}

module.exports = {
  EP_PATTERN_ID, EP_PATTERN_NAME, EP_PATTERN_VERSION,
  EP_WEIGHTS, EP_BOOSTER_WEIGHT, EP_GATE_MULTIPLIERS, EP_TRIGGER,
  extractEPComponents, isEPStructureTriggered, evaluateEP,
  BAIT_OR_TAUNT_PATTERNS, ESCALATION_PRESSURE_PATTERNS,
  FORCED_RESPONSE_PATTERNS, LABEL_SHAME_PATTERNS,
};
