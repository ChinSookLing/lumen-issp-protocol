// src/engines/explanation-lint.js
// Explanation Engine Lint — forbidden pattern detection
//
// Implements guard rules from config/explanations/forbidden-patterns.v0.1.json
// These 3 rules are the minimum required for explanation-engine unfreeze:
//   BP-02: NO_DIAGNOSIS_LABELS (critical)
//   BP-03: NO_MIND_READING (high)
//   BP-06: NO_SURVEILLANCE_INSTRUCTIONS (critical)
//
// Usage: lintExplanation(text) → { pass, violations[] }
//   pass=true means text is safe for output
//   pass=false means text must be blocked/rewritten
//
// Source: Node-05 forbidden-patterns.v0.1.json (c149)
// Impl: Node-01 (Architect)
// Date: 2026-02-25
// Unfreeze prerequisite: lint ≥3 rules landed

'use strict';

// ─── BP-02: NO_DIAGNOSIS_LABELS ──────────────────────────────────────
// Severity: critical → any_tier: REFUSE_OR_REWRITE_BEHAVIORAL

const DIAGNOSIS_EN = [
  /\bnarcissis(?:t|tic|m)\b/i,
  /\bsociopath(?:ic)?\b/i,
  /\bpsychopath(?:ic)?\b/i,
  /\bborderline\s+personality\b/i,
  /\bantisocial\s+personality\b/i,
  /\battachment\s+disorder\b/i,
  /\bdependent\s+personality\b/i,
  /\bhistrionic\b/i,
  /\bpatholog(?:y|ical|izing)\b/i,
  /\bdiagnos(?:e[ds]?|is|tic)\b/i,
  /\bmental\s+(?:illness|disorder|disease)\b/i,
  /\bpersonality\s+disorder\b/i,
  /\btrauma\s+bond(?:ing|ed)?\b/i,
  /\bgaslight(?:ing|er|ed)\b/i
];

const DIAGNOSIS_ZH = [
  /自戀型人格/, /反社會人格/, /人格障礙/, /人格障碍/,
  /依附障礙/, /依附障碍/, /邊緣型人格/, /边缘型人格/,
  /心理(?:疾病|障礙|障碍)/, /精神(?:疾病|障礙|障碍)/,
  /病態/, /病态/, /創傷連結/, /创伤连结/,
  /煤氣燈效應/, /煤气灯效应/
];

function checkDiagnosisLabels(text) {
  const violations = [];
  for (const rx of [...DIAGNOSIS_EN, ...DIAGNOSIS_ZH]) {
    const match = text.match(rx);
    if (match) {
      violations.push({
        rule_id: 'NO_DIAGNOSIS_LABELS',
        pattern_id: 'BP-02',
        severity: 'critical',
        matched: match[0],
        action: 'REFUSE_OR_REWRITE_BEHAVIORAL'
      });
    }
  }
  return violations;
}

// ─── BP-03: NO_MIND_READING ─────────────────────────────────────────
// Severity: high → tier_ge_1: HITL_REQUIRED, tier_0: DOWNGRADE

const MIND_READING_EN = [
  /\b(?:he|she|they)\s+(?:definitely|obviously|clearly)\s+(?:wants?|intends?|meant|tried)\b/i,
  /\b(?:he|she|they)\s+(?:is|are)\s+(?:trying|attempting)\s+to\s+(?:control|manipulate|deceive|trick)\b/i,
  /\btheir?\s+(?:true|real|hidden|secret)\s+(?:intention|motive|agenda|purpose)\b/i,
  /\b(?:he|she|they)\s+(?:must|certainly)\s+(?:be|have been)\s+(?:planning|scheming)\b/i,
  /\byou\s+(?:actually|really)\s+(?:want|need|feel)\b/i,
  /\bdeliberate(?:ly)?\s+(?:manipulat|deceiv|trick)/i
];

const MIND_READING_ZH = [
  /(?:他|她|對方)(?:一定|肯定|顯然|明顯)(?:是|就是)(?:想|要|在)/,
  /(?:他|她|對方)(?:一定|肯定|显然|明显)(?:是|就是)(?:想|要|在)/,
  /(?:真正|隱藏|隐藏)(?:的)?(?:目的|動機|动机|意圖|意图)/,
  /(?:你)?(?:其實|其实)(?:就是|只是)(?:想|要|在)/,
  /故意(?:想|要|在)?(?:控制|操控|欺騙|欺骗)/
];

function checkMindReading(text) {
  const violations = [];
  for (const rx of [...MIND_READING_EN, ...MIND_READING_ZH]) {
    const match = text.match(rx);
    if (match) {
      violations.push({
        rule_id: 'NO_MIND_READING',
        pattern_id: 'BP-03',
        severity: 'high',
        matched: match[0],
        action: 'HITL_REQUIRED'
      });
    }
  }
  return violations;
}

// ─── BP-06: NO_SURVEILLANCE_INSTRUCTIONS ─────────────────────────────
// Severity: critical → any_tier: REFUSE

const SURVEILLANCE_EN = [
  /\b(?:track|monitor|surveil|spy\s+on|stalk)\s+(?:his|her|their|someone)/i,
  /\b(?:install|set\s+up)\s+(?:a\s+)?(?:tracker|keylogger|spyware|hidden\s+camera)/i,
  /\bcollect\s+(?:their|his|her)\s+(?:data|messages|chat|logs|records)/i,
  /\b(?:record|screenshot|save)\s+(?:everything|all\s+(?:their|his|her))/i,
  /\b(?:build|create|maintain)\s+(?:a\s+)?(?:watchlist|dossier|file\s+on)\b/i,
  /\b(?:cross[- ]?reference|link|connect)\s+(?:their|his|her)\s+(?:accounts?|identit)/i,
  /\bcovert(?:ly)?\s+(?:collect|record|monitor|gather)/i
];

const SURVEILLANCE_ZH = [
  /(?:偷偷|秘密|暗中)(?:裝|安裝|装|安装)(?:追蹤|追踪|監控|监控)/,
  /(?:收集|搜集|蒐集)(?:他|她|對方|对方)?(?:的)?(?:聊天|對話|对话|紀錄|记录|資料|资料)/,
  /(?:整理|建立|做)(?:成)?(?:名單|名单|檔案|档案|清單|清单)/,
  /(?:追蹤|追踪|監視|监视|監控|监控)(?:他|她|對方|对方)/,
  /(?:偷偷|秘密)(?:錄|录|截圖|截图|記錄|记录)/
];

function checkSurveillanceInstructions(text) {
  const violations = [];
  for (const rx of [...SURVEILLANCE_EN, ...SURVEILLANCE_ZH]) {
    const match = text.match(rx);
    if (match) {
      violations.push({
        rule_id: 'NO_SURVEILLANCE_INSTRUCTIONS',
        pattern_id: 'BP-06',
        severity: 'critical',
        matched: match[0],
        action: 'REFUSE'
      });
    }
  }
  return violations;
}

// ─── Main Lint Function ──────────────────────────────────────────────

/**
 * Lint an explanation text against forbidden patterns.
 * @param {string} text - Explanation text to lint
 * @param {object} [options]
 * @param {string[]} [options.rules] - Subset of rules to check (default: all 3)
 * @returns {{ pass: boolean, violations: object[], rules_checked: string[] }}
 */
function lintExplanation(text, options = {}) {
  const {
    rules = ['NO_DIAGNOSIS_LABELS', 'NO_MIND_READING', 'NO_SURVEILLANCE_INSTRUCTIONS']
  } = options;

  if (!text || typeof text !== 'string') {
    return { pass: true, violations: [], rules_checked: rules };
  }

  const violations = [];

  if (rules.includes('NO_DIAGNOSIS_LABELS')) {
    violations.push(...checkDiagnosisLabels(text));
  }
  if (rules.includes('NO_MIND_READING')) {
    violations.push(...checkMindReading(text));
  }
  if (rules.includes('NO_SURVEILLANCE_INSTRUCTIONS')) {
    violations.push(...checkSurveillanceInstructions(text));
  }

  return {
    pass: violations.length === 0,
    violations,
    rules_checked: rules
  };
}

/**
 * Quick check: does this text have any critical violations?
 * @param {string} text
 * @returns {boolean}
 */
function hasCriticalViolation(text) {
  const result = lintExplanation(text);
  return result.violations.some(v => v.severity === 'critical');
}

module.exports = {
  lintExplanation,
  hasCriticalViolation,
  checkDiagnosisLabels,
  checkMindReading,
  checkSurveillanceInstructions
};
