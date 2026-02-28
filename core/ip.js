/**
 * Lumen ISSP — Identity-Probing (Push Channel)
 * PDD v0.1 — three-party process:
 *   Node-05 (WS1):    structural design + component definitions + differential diagnosis
 *   Node-03 (CI): math verification + weight/gate adjustment
 *   Node-01 (GK):   red-line compliance + Schema/IR alignment
 *
 * PURPOSE: Detect information extraction manipulation — not "asking a question"
 * but a probe sequence + resistance handling + leverage binding.
 *
 * Components:
 *   C1: id_req  — Identity Request (hard anchor, REQUIRED ≥ 0.50)
 *   C2: narrow  — Narrowing / progressive convergence (cross-turn)
 *   C3: press   — Refusal Pressure (information exchange pressure, not moral)
 *   C4: legit   — Legitimacy Frame (compliance/security/rules packaging)
 *
 * Differential diagnosis (Node-05 §3):
 *   IP vs DM: DM = relationship constraint; IP = identity surface expansion
 *   IP vs FC: FC = binary frame + close window; IP = multi-step extraction
 *   IP vs EA: EA = emotional lock; IP can be cold, "care" is just legit facade
 *   IP vs MB: MB = moral pressure; IP = procedural/rules pressure
 *   IP vs VS: VS = Vacuum (silence traps); IP = Push (pushes you to reveal)
 *
 * Red-line compliance:
 *   §2.1: No action advice
 *   §2.2: Detects "probe attempt structure", NOT "who you are"
 *   §2.3: evidence_hash only, no raw text, reuses VS buffer
 *   §2.5: extraction_method = "rule"
 */

"use strict";

const { parseTurns } = require("./harness");

const IP_PATTERN_ID = "identity_probing";
const IP_PATTERN_NAME = "Identity-Probing";
const IP_PATTERN_VERSION = "0.1.0";

/**
 * Weights (Node-03 method A, Node-01 GK approved):
 * id_req is hard anchor (0.40) — no identity request = no probe
 * narrow is convergence (0.25) — high implementation risk, lower weight is protection
 * press is refusal pressure (0.20)
 * legit is legitimacy frame (0.15) — culturally sensitive, lowest weight
 */
const IP_WEIGHTS = Object.freeze({
  id_req: 0.40,
  narrow: 0.25,
  press:  0.20,
  legit:  0.15,
});

/** Unified gate_mult */
const IP_GATE_MULTIPLIERS = Object.freeze([0.30, 0.65, 1.00, 1.20]);

/** Trigger thresholds */
const IP_TRIGGER = Object.freeze({
  BASE_THRESHOLD: 0.50,
  ID_REQ_HARD_MIN: 0.50,
  COMPONENT_THRESHOLD: 0.25,
  MIN_ACTIVE_COMPONENTS: 2,
  GATE_MIN: 2,
});

// ─── Feature Patterns ───────────────────────────────────────────────

/** Identity Request signals — asking for identifiable information */
const ID_REQUEST_PATTERNS = [
  // Chinese — identity slots
  /你叫什麼/, /你的名字/, /真名/, /姓名/, /全名/,
  /手機號/, /電話/, /聯絡方式/, /聯繫方式/, /微信/, /Line/,
  /住哪/, /住址/, /地址/, /你在哪/, /位置/, /哪個城市/, /哪一區/,
  /工作單位/, /公司/, /在哪工作/, /做什麼工作/, /職業/,
  /身份證/, /證件/, /護照/, /帳號/, /ID/,
  /生日/, /出生/, /幾歲/, /年齡/,
  /學校/, /畢業/, /哪裡讀書/,
  // English
  /what'?s?\s+your\s+name/i, /real\s+name/i, /full\s+name/i,
  /phone\s+number/i, /contact/i, /email/i, /address/i,
  /where\s+do\s+you\s+(live|work|stay)/i, /what\s+do\s+you\s+do/i,
  /how\s+old/i, /your\s+age/i, /birthday/i, /date\s+of\s+birth/i,
  /ID\s+(card|number)/i, /passport/i, /social\s+(security|media)/i,
  /which\s+(school|company|city|area)/i,
];

/** Narrowing signals — progressive convergence based on prior info */
const NARROWING_PATTERNS = [
  // Chinese
  /那.*具體/, /更詳細/, /精確一點/, /再說清楚/,
  /你剛才說.*那/, /既然.*那/, /所以你是/,
  /哪個區/, /哪條路/, /幾號/, /幾樓/, /哪一區/,
  /全名.*什麼/, /姓什麼/,
  /還需要/, /另外.*也需要/, /再提供/,
  // English
  /more\s+specific/i, /exactly\s+where/i, /which\s+(street|floor|building)/i,
  /you\s+mentioned.*so/i, /you\s+said.*then/i,
  /can\s+you\s+be\s+more\s+precise/i, /narrow\s+it\s+down/i,
  /also\s+need/i, /additionally/i, /in\s+addition/i, /what\s+else/i,
];

/** Refusal Pressure signals — pressure when info is declined */
const REFUSAL_PRESSURE_PATTERNS = [
  // Chinese
  /你不說.*就/, /不配合/, /必須/, /一定要/, /不說.*無法/,
  /為什麼不說/, /為什麼不願/, /有什麼好隱瞞/,
  /你不回答.*不行/, /沒辦法繼續/,
  // English
  /you\s+must/i, /have\s+to\s+tell/i, /required\s+to/i,
  /why\s+won'?t\s+you/i, /what\s+are\s+you\s+hiding/i,
  /can'?t\s+proceed\s+without/i, /no\s+choice\s+but/i,
  /if\s+you\s+don'?t\s+(tell|say|provide)/i,
];

/** Legitimacy Frame signals — packaging requests as rules/compliance */
const LEGITIMACY_PATTERNS = [
  // Chinese
  /規定/, /流程/, /核驗/, /驗證/, /安全考慮/, /合規/,
  /這是必要的/, /標準程序/, /需要確認/, /備案/,
  /為了你的安全/, /保護你/,
  // English
  /regulation/i, /procedure/i, /verification/i, /compliance/i,
  /for\s+your\s+(safety|security|protection)/i, /standard\s+process/i,
  /required\s+by/i, /policy/i, /we\s+need\s+to\s+verify/i,
  /on\s+file/i, /on\s+record/i,
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

// ─── IP Evaluator ───────────────────────────────────────────────────

/**
 * Extract IP components from input.
 * Supports both single-sentence and multi-turn input.
 */
function extractIPComponents(input) {
  // For multi-turn: analyze each turn, accumulate across turns
  const isMulti = input.includes("\n") && /^[A-Za-z]:/.test(input.trim());

  if (!isMulti) {
    // Single sentence analysis
    // narrow = 0 in single sentence — narrowing requires cross-turn context by definition
    return {
      id_req: scorePatterns(input, ID_REQUEST_PATTERNS),
      narrow: 0,
      press:  scorePatterns(input, REFUSAL_PRESSURE_PATTERNS),
      legit:  scorePatterns(input, LEGITIMACY_PATTERNS),
    };
  }

  // Multi-turn analysis
  const turns = parseTurns(input);
  let maxIdReq = 0;
  let maxNarrow = 0;
  let maxPress = 0;
  let maxLegit = 0;
  let idReqCount = 0;    // count of turns with id_req signals
  let priorInfoGiven = false;  // track if user has given info (for narrowing)

  for (let i = 0; i < turns.length; i++) {
    const turn = turns[i];
    const idScore = scorePatterns(turn.text, ID_REQUEST_PATTERNS);
    const nrScore = scorePatterns(turn.text, NARROWING_PATTERNS);
    const prScore = scorePatterns(turn.text, REFUSAL_PRESSURE_PATTERNS);
    const lgScore = scorePatterns(turn.text, LEGITIMACY_PATTERNS);

    if (idScore > 0.3) idReqCount++;
    maxIdReq = Math.max(maxIdReq, idScore);
    maxPress = Math.max(maxPress, prScore);
    maxLegit = Math.max(maxLegit, lgScore);

    // Narrowing: detect progressive convergence after initial info exchange
    // Either: (a) prior info was given, or (b) multiple id_req turns already happened
    if ((priorInfoGiven || idReqCount >= 2) && nrScore > 0) {
      maxNarrow = Math.max(maxNarrow, nrScore);
    }
    // Also: narrowing patterns in same turn as id_req count as convergence
    if (idScore > 0.3 && nrScore > 0 && i > 0) {
      maxNarrow = Math.max(maxNarrow, nrScore);
    }

    // Track if a non-probing turn occurred (user responding)
    if (idScore === 0 && prScore === 0 && lgScore === 0 && turn.text.length > 1) {
      priorInfoGiven = true;
    }
  }

  // Boost id_req if multiple turns request info (probe sequence)
  const idReqBoost = idReqCount >= 2 ? Math.min(1.0, maxIdReq + 0.15) : maxIdReq;

  return {
    id_req: idReqBoost,
    narrow: maxNarrow,
    press:  maxPress,
    legit:  maxLegit,
  };
}

/**
 * IP Gate (Node-03 designed, Node-01 GK approved — specialized for IP):
 *   VG1: id_req ≥ 0.60 (strong identity request)
 *   VG2: narrow ≥ 0.40 (progressive convergence)
 *   VG3: press ≥ 0.50 (refusal pressure)
 */
function evaluateIPGate(components) {
  const vg1 = components.id_req >= 0.60;
  const vg2 = components.narrow >= 0.40;
  const vg3 = components.press >= 0.50;
  return { vg1, vg2, vg3, hit_count: [vg1, vg2, vg3].filter(Boolean).length };
}

/**
 * Hard constraint (Node-05 + Node-03 + Node-01):
 *   id_req must be ≥ 0.50 — no identity request = not a probe
 */
function isIPStructureTriggered(components) {
  if (components.id_req < IP_TRIGGER.ID_REQ_HARD_MIN) return false;

  const scores = [components.id_req, components.narrow, components.press, components.legit];
  const base = IP_WEIGHTS.id_req * components.id_req +
               IP_WEIGHTS.narrow * components.narrow +
               IP_WEIGHTS.press * components.press +
               IP_WEIGHTS.legit * components.legit;
  const active = scores.filter(s => s > IP_TRIGGER.COMPONENT_THRESHOLD).length;

  return base >= IP_TRIGGER.BASE_THRESHOLD && active >= IP_TRIGGER.MIN_ACTIVE_COMPONENTS;
}

function evaluateIP(input, gateHit) {
  const components = extractIPComponents(input);
  const detected = isIPStructureTriggered(components) && gateHit >= IP_TRIGGER.GATE_MIN;
  if (!detected) return { detected: false, score: 0, components };

  const base = IP_WEIGHTS.id_req * components.id_req +
               IP_WEIGHTS.narrow * components.narrow +
               IP_WEIGHTS.press * components.press +
               IP_WEIGHTS.legit * components.legit;

  const gateMult = IP_GATE_MULTIPLIERS[Math.min(gateHit, 3)];
  const score = Math.min(1.0, base * gateMult);
  return { detected, score, components };
}

module.exports = {
  IP_PATTERN_ID, IP_PATTERN_NAME, IP_PATTERN_VERSION,
  IP_WEIGHTS, IP_GATE_MULTIPLIERS, IP_TRIGGER,
  extractIPComponents, evaluateIPGate, isIPStructureTriggered, evaluateIP,
  ID_REQUEST_PATTERNS, NARROWING_PATTERNS, REFUSAL_PRESSURE_PATTERNS, LEGITIMACY_PATTERNS,
};
