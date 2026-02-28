/**
 * Negation Guard — M79 Decision 1c (B-class 5/5 unanimous)
 *
 * When negation pattern appears within 5 words of guilt keyword,
 * apply ×0.25 coefficient to guilt score.
 *
 * Negation patterns: not saying | don't mean | not implying | not suggesting
 * Also covers: 我不是要 | 不是說你 | 並不是要你
 *
 * Coefficient: 0.25
 * Acceptance: B03 falls into 0~0.3 AND TRS-E self-guilt/therapy = 0
 */
"use strict";

const NEGATION_COEFFICIENT = 0.25;

// English negation phrases that precede guilt expressions
const EN_NEGATION_PATTERNS = [
  /i'?m\s+not\s+saying/i,
  /not\s+saying/i,
  /don'?t\s+mean/i,
  /not\s+implying/i,
  /not\s+suggesting/i,
  /i'?m\s+not\s+trying\s+to/i,
];

// Chinese negation phrases
const ZH_NEGATION_PATTERNS = [
  /我不是要/,
  /不是說你/,
  /並不是要你/,
  /我不是在說/,
  /不是要讓你/,
];

// Guilt keywords that, when negated, should trigger the guard
const GUILT_KEYWORDS_EN = [
  /guilty/i, /ashamed/i, /shame/i, /bad\s+about/i, /feel\s+bad/i,
];

const GUILT_KEYWORDS_ZH = [
  /愧疚/, /羞愧/, /內疚/, /難過/, /自責/,
];

/**
 * Check if negation appears near guilt keywords (within ~5 words).
 * Uses a simple approach: if both negation pattern and guilt keyword
 * exist in the same sentence/clause, apply guard.
 *
 * @param {string} input - text to check
 * @returns {boolean} true if negation guard should apply
 */
function shouldApplyNegationGuard(input) {
  // Check English
  const hasEnNegation = EN_NEGATION_PATTERNS.some(p => p.test(input));
  const hasEnGuilt = GUILT_KEYWORDS_EN.some(p => p.test(input));
  if (hasEnNegation && hasEnGuilt) return true;

  // Check Chinese
  const hasZhNegation = ZH_NEGATION_PATTERNS.some(p => p.test(input));
  const hasZhGuilt = GUILT_KEYWORDS_ZH.some(p => p.test(input));
  if (hasZhNegation && hasZhGuilt) return true;

  return false;
}

/**
 * Apply negation guard to a guilt score.
 * @param {number} score - original guilt component score
 * @param {string} input - original text
 * @returns {number} guarded score (×0.25 if negation detected)
 */
function applyNegationGuard(score, input) {
  if (score === 0) return 0;
  if (shouldApplyNegationGuard(input)) {
    return score * NEGATION_COEFFICIENT;
  }
  return score;
}

module.exports = {
  NEGATION_COEFFICIENT,
  shouldApplyNegationGuard,
  applyNegationGuard,
};
