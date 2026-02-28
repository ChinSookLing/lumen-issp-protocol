/**
 * Lumen ISSP — god-complex (Push Channel)
 * PDD v0.1 — three-party process:
 *   Node-05 (WS1):    structural design + component definitions + differential diagnosis
 *   Node-03 (CI): math verification + threshold/constraint adjustments
 *   Node-01 (GK):   red-line compliance + Schema/IR alignment + rulings
 *
 * PURPOSE: Detect authority-closure manipulation — not "confidence" or "leadership"
 * but an authority-closure loop: exclusive authority + salvation narrative +
 * external verification shutdown + obedience binding.
 *
 * Components:
 *   C1: excl_auth     — Exclusive Authority (I am the only truth/source)
 *   C2: salvation      — Salvation Claim (follow me = saved, leave = doomed)
 *   C3: ext_discredit  — External Discredit (experts lie, don't check, conspiracy)
 *   C4: obed_link      — Obedience Link (disobey = selfish/dangerous/immoral)
 *
 * Hard constraint (OR gate — Node-05 design, Node-03 verified):
 *   excl_auth ≥ 0.50  OR  ext_discredit ≥ 0.65
 *   Two entry points: pure-exclusivity type OR pure-conspiracy type
 *   Without either = not god-complex, just normal authority/motivation
 *
 * Differential diagnosis (Node-05 §3):
 *   GC vs DM: DM = dependency loop (resource hostage); GC = authority loop (only truth)
 *   GC vs MB: MB = moral consequence blackmail; GC = authority legitimacy blackmail
 *   GC vs IP: IP = identity extraction (id_req); GC = no personal data, core is "trust only me"
 *   GC vs EA: EA = emotional lock (attachment/abandonment); GC = authority lock (worship/demonize outsiders)
 *
 * Gate: Shared Push Gate (M45 6/6 decision, Part 6 §6.3 satisfied)
 *
 * Red-line compliance:
 *   §2.1: No action advice
 *   §2.2: Detects "GC structural signal", NOT "you are a cult leader"
 *   §2.3: evidence_hash only, no raw text
 *   §2.5: extraction_method = "rule"
 */

"use strict";

const GC_PATTERN_ID = "god_complex";
const GC_PATTERN_NAME = "god-complex";
const GC_PATTERN_VERSION = "0.1.0";

/**
 * Weights (Node-05 original, Node-01 GK approved):
 * excl_auth is core (0.35) — exclusive authority is the defining feature
 * salvation is narrative (0.25) — "follow me or perish"
 * ext_discredit is closure (0.25) — "experts lie, don't check" (key differentiator from DM)
 * obed_link is binding (0.15) — culturally sensitive, lowest weight
 */
const GC_WEIGHTS = Object.freeze({
  excl_auth:     0.35,
  salvation:     0.25,
  ext_discredit: 0.25,
  obed_link:     0.15,
});

/** Unified gate_mult */
const GC_GATE_MULTIPLIERS = Object.freeze([0.30, 0.65, 1.00, 1.20]);

/** Trigger thresholds */
const GC_TRIGGER = Object.freeze({
  SUM_THRESHOLD: 0.60,            // Node-03 adjusted from 0.70, Node-01 approved
  EXCL_AUTH_HARD_MIN: 0.50,       // Node-05 original
  EXT_DISCREDIT_HARD_MIN: 0.65,  // Node-03 adjusted from 0.50, Node-01 approved
  COMPONENT_THRESHOLD: 0.25,
  MIN_ACTIVE_COMPONENTS: 2,
  GATE_MIN: 2,                    // Shared gate
});

// ─── Feature Patterns ───────────────────────────────────────────────

/** Exclusive Authority — "only I know / only I can / don't listen to anyone else" */
const EXCL_AUTH_PATTERNS = [
  // Chinese
  /只有我.*懂/, /只有我.*知道/, /只有我.*能/,
  /別聽.*別人/, /別聽.*他們/, /別信.*其他/, /別信.*外面/,
  /我是唯一/, /只有跟著我/, /我說的才是/,
  // TR-004 expansion
  /我說.*算/, /我說.*規矩/, /沒有資格.*質疑/,
  /唯一.*懂/, /只有我.*知道/, /只有我.*對/,
  /沒有人.*比我/, /誰都不如我/, /我才是.*真/,
  /只有我.*真相/, /只有我.*真理/, /只有我.*對/,
  /只有跟著我/, /只有聽我/,
  // Simplified
  /只有我.*懂/, /别听.*别人/, /别听.*他们/, /别信.*其他/,
  /我是唯一/, /只有跟着我/, /我说的才是/,
  /我说.*算/, /我说.*规矩/, /没有资格.*质疑/,
  /唯一.*懂/, /只有我.*知道/, /只有我.*对/,
  // English
  /only\s+I\s+(know|understand|can)/i, /I\s+am\s+the\s+only/i,
  /don'?t\s+listen\s+to\s+(them|anyone|others)/i,
  /nobody\s+(else\s+)?(knows?|understands?)/i,
  /I\s+alone/i, /trust\s+only\s+me/i,
  /I\s+am\s+the\s+(truth|way|answer)/i,
  /no\s+one\s+(else\s+)?can/i,
  /only\s+I\s+have\s+the\s+(truth|answer)/i,
  /I\s+know\s+the\s+truth/i,
  // TR-008 GC English expansion
  /don.?t\s+question\s+me/i, /do\s+not\s+question/i,
  /I.?m\s+(always|never)\s+(right|wrong)/i,
  /I\s+am\s+(a\s+)?(doctor|expert|god)/i,
  /you\s+(are|have)\s+no\s+(right|authority|knowledge)/i,
  /you\s+are\s+(not|never)\s+(right|correct|qualified)/i,
];

/** Salvation Claim — "follow me = saved, leave = doomed" */
const SALVATION_PATTERNS = [
  // Chinese
  /跟隨我.*才能/, /跟著我.*才有/, /跟著我.*才安全/, /跟著我.*才能/,
  /我在拯救/, /我來救/, /我是.*救世/, /我要帶.*走出/,
  /離開.*就完了/, /離開.*就沒救/, /不跟.*就完蛋/,
  /離開.*就是.*滅/, /離開.*就.*毀/,
  /只有.*這條路/, /唯一.*出路/, /唯一.*希望/,
  /沒有我.*你就/, /沒有我.*完蛋/, /沒有我.*滅亡/,
  /才能得救/, /才有出路/, /才有希望/, /才安全/,
  // Simplified
  /跟随我.*才能/, /跟着我.*才有/, /跟着我.*才能/, /我在拯救/,
  /离开.*就完了/, /离开.*就没救/, /离开.*就是.*灭/,
  // English
  /follow\s+me\s+(and|to|for)/i, /I\s+(will|can)\s+save/i,
  /I\s+am\s+(here\s+to\s+)?sav(e|ing)/i,
  /without\s+me.*doomed/i, /without\s+me.*lost/i,
  /only\s+(way|path|hope)/i, /the\s+only\s+salvation/i,
  /leave.*and.*perish/i, /if\s+you\s+leave.*done\s+for/i,
  /I\s+am\s+the\s+(only\s+)?way/i, /to\s+salvation/i,
];

/** External Discredit — "experts lie, don't check, conspiracy" */
const EXT_DISCREDIT_PATTERNS = [
  // Chinese
  /專家.*都.*騙/, /專家.*都.*錯/, /學者.*都.*假/,
  /他們.*都.*洗腦/, /他們.*都.*在騙/, /都在.*欺騙/,
  /別查.*資料/, /別看.*新聞/, /別信.*媒體/,
  /陰謀/, /他們.*不想讓你知道/, /真相.*被隱瞞/,
  /外面.*都是假/, /外面.*都在騙/, /外界.*都不可信/,
  /主流.*都是錯/, /官方.*在隱瞞/,
  /都是騙子/, /都在說謊/, /別信.*別人/,
  // Simplified
  /专家.*都.*骗/, /专家.*都.*错/, /他们.*都.*洗脑/,
  /别查.*资料/, /别看.*新闻/, /别信.*媒体/,
  /阴谋/, /真相.*被隐瞒/,
  // English
  /experts?\s+(are|is)\s+(all\s+)?(lying|wrong|fake|corrupt)/i,
  /don'?t\s+(check|look\s+at|believe|trust)\s+(the\s+)?(news|media|research|experts?)/i,
  /they'?re\s+(all\s+)?lying/i, /brain\s*wash/i,
  /conspiracy/i, /they\s+don'?t\s+want\s+you\s+to\s+know/i,
  /the\s+truth\s+is\s+being\s+hidden/i,
  /mainstream.*wrong/i, /can'?t\s+trust\s+(the\s+)?(media|experts?|science)/i,
  /wake\s+up/i, /sheep/i, /open\s+your\s+eyes/i,
  // TR-008 GC English expansion
  /you\s+would(n.?t|\s+not)\s+(understand|know|get\s+it)/i,
  /you\s+don.?t\s+(understand|know|get\s+it)/i,
  /you\s+can.?t\s+(understand|comprehend)/i,
];

/** Obedience Link — "disobey = selfish/dangerous/immoral" */
const OBED_LINK_PATTERNS = [
  // Chinese
  /不聽.*就是.*自私/, /不跟.*就是.*背叛/, /不服從.*危險/,
  /聽我的.*才對/, /照我說的做/, /必須.*服從/,
  /不聽話.*後果/, /不配合.*下場/, /質疑.*就是.*叛徒/,
  /反對.*就是.*敵人/, /不信.*就是.*愚蠢/,
  // Simplified
  /不听.*就是.*自私/, /不跟.*就是.*背叛/,
  /听我的.*才对/, /照我说的做/, /必须.*服从/,
  // English
  /if\s+you\s+don'?t\s+(follow|obey|listen)/i,
  /disobey.*dangerous/i, /disobey.*selfish/i,
  /do\s+(as|what)\s+I\s+say/i, /you\s+must\s+(obey|follow|comply)/i,
  // TR-008 GC English expansion
  /you\s+need\s+to\s+follow/i, /just\s+(follow|obey|listen)/i,
  /stop\s+question(ing)?\s+me/i, /don.?t\s+argue/i,
  /I\s+set\s+(the|your)\s+(rules?|punishment)/i,
  /my\s+way\s+or/i, /because\s+I\s+said\s+so/i,
  /question.*traitor/i, /doubt.*enemy/i,
  /those\s+who\s+(don'?t|won'?t)\s+(follow|listen)/i,
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

// ─── GC Evaluator ───────────────────────────────────────────────────

/**
 * Extract GC components from input.
 */
function extractGCComponents(input) {
  return {
    excl_auth:     scorePatterns(input, EXCL_AUTH_PATTERNS),
    salvation:     scorePatterns(input, SALVATION_PATTERNS),
    ext_discredit: scorePatterns(input, EXT_DISCREDIT_PATTERNS),
    obed_link:     scorePatterns(input, OBED_LINK_PATTERNS),
  };
}

/**
 * Hard constraint (OR gate — Node-05 design, Node-03 verified, Node-01 approved):
 *   excl_auth ≥ 0.50 OR ext_discredit ≥ 0.65
 *   Two entry points for GC: pure-exclusivity OR pure-conspiracy
 */
function isGCStructureTriggered(components) {
  // OR hard constraint
  const hardPass = components.excl_auth >= GC_TRIGGER.EXCL_AUTH_HARD_MIN ||
                   components.ext_discredit >= GC_TRIGGER.EXT_DISCREDIT_HARD_MIN;
  if (!hardPass) return false;

  const scores = [components.excl_auth, components.salvation,
                  components.ext_discredit, components.obed_link];
  const base = GC_WEIGHTS.excl_auth * components.excl_auth +
               GC_WEIGHTS.salvation * components.salvation +
               GC_WEIGHTS.ext_discredit * components.ext_discredit +
               GC_WEIGHTS.obed_link * components.obed_link;
  const active = scores.filter(s => s > GC_TRIGGER.COMPONENT_THRESHOLD).length;

  return base >= GC_TRIGGER.SUM_THRESHOLD && active >= GC_TRIGGER.MIN_ACTIVE_COMPONENTS;
}

function evaluateGC(input, gateHit) {
  const components = extractGCComponents(input);
  const detected = isGCStructureTriggered(components) && gateHit >= GC_TRIGGER.GATE_MIN;
  if (!detected) return { detected: false, score: 0, components };

  const base = GC_WEIGHTS.excl_auth * components.excl_auth +
               GC_WEIGHTS.salvation * components.salvation +
               GC_WEIGHTS.ext_discredit * components.ext_discredit +
               GC_WEIGHTS.obed_link * components.obed_link;

  const gateMult = GC_GATE_MULTIPLIERS[Math.min(gateHit, 3)];
  const score = Math.min(1.0, base * gateMult);
  return { detected, score, components };
}

module.exports = {
  GC_PATTERN_ID, GC_PATTERN_NAME, GC_PATTERN_VERSION,
  GC_WEIGHTS, GC_GATE_MULTIPLIERS, GC_TRIGGER,
  extractGCComponents, isGCStructureTriggered, evaluateGC,
  EXCL_AUTH_PATTERNS, SALVATION_PATTERNS, EXT_DISCREDIT_PATTERNS, OBED_LINK_PATTERNS,
};
