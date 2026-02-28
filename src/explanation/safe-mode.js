// src/explanation/safe-mode.js
// Explanation-engine SAFE mode — M88 V1 6/6 PASS
// 5 Hard Limits (硬限制) implementation
//
// HL-1: Only output explanations that cite auditable signals (vectors / window / confidence)
// HL-2: Must carry [假設生成 — 低信心] marker
// HL-3: Lint violations → force HITL or downgrade
// HL-4: purpose=share → shorter, more neutral, de-identified version
// HL-5: Never produce operational surveillance guidance

'use strict';

const { lintExplanation } = require('../engines/explanation-lint');

// SAFE mode status — M88 V1 6/6 voted ON
const SAFE_MODE = true;

// HL-5: Banned operational phrases (surveillance guidance detection)
const SURVEILLANCE_PHRASES = [
  /\b(monitor|track|surveil|watch)\b.*\b(user|person|individual|target|subject)\b/i,
  /\b(identify|locate|find)\b.*\b(who|which person|suspect)\b/i,
  /\bset up\b.*\b(alert|alarm|notification)\b.*\b(when|if)\b.*\b(say|post|write|mention)\b/i,
  /\b(flag|report|escalate)\b.*\b(to|for)\b.*\b(authority|police|admin|manager|HR)\b/i,
  /\b(deploy|install|embed)\b.*\b(detection|monitoring|scanning)\b/i,
];

// HL-1: Allowed auditable signal fields
const AUDITABLE_FIELDS = [
  'pattern',         // detected pattern type (DM/FC/MB/EA/IP/GC/EP/VS/Class0)
  'acri',            // ACRI score
  'vri',             // VRI score
  'confidence',      // confidence level
  'gate_result',     // Three-Question Gate result
  'window',          // observation window metadata
  'vectors',         // matched vectors (without raw text)
  'momentum',        // momentum score
  'trend',           // trend shape
];

/**
 * Generate a SAFE-mode explanation from detection results.
 *
 * @param {Object} detection - Detection result from pipeline
 * @param {Object} options - { purpose: 'internal'|'share'|'audit' }
 * @returns {Object} - { explanation, markers, violations, downgraded }
 */
function generateSafeExplanation(detection, options = {}) {
  if (!SAFE_MODE) {
    return { explanation: null, markers: [], violations: [], downgraded: false };
  }

  const purpose = options.purpose || 'internal';
  const markers = [];
  const violations = [];
  let downgraded = false;

  // HL-2: Always attach hypothesis marker
  markers.push('[假設生成 — 低信心]');

  // HL-1: Extract only auditable signals
  const signals = extractAuditableSignals(detection);

  // Build base explanation from auditable signals only
  let explanation = buildSignalExplanation(signals);

  // HL-3: Run lint check — if violations found, force HITL or downgrade
  const lintResult = lintExplanation(explanation);
  if (lintResult.violations && lintResult.violations.length > 0) {
    violations.push(...lintResult.violations);
    markers.push('[HITL_REQUIRED]');
    // Downgrade: replace explanation with minimal safe version
    explanation = buildMinimalExplanation(signals);
    downgraded = true;
  }

  // HL-5: Check for surveillance guidance
  if (containsSurveillanceGuidance(explanation)) {
    violations.push({
      rule: 'HL-5',
      message: 'Explanation contains operational surveillance guidance — blocked',
    });
    markers.push('[HITL_REQUIRED]');
    explanation = buildMinimalExplanation(signals);
    downgraded = true;
  }

  // HL-4: purpose=share → shorter, more neutral, de-identified
  if (purpose === 'share') {
    explanation = deidentifyExplanation(explanation, signals);
    markers.push('[share-mode — 去識別版本]');
  }

  return {
    explanation,
    markers,
    violations,
    downgraded,
    purpose,
    safe_mode: true,
  };
}

/**
 * HL-1: Extract only auditable signal fields from detection.
 */
function extractAuditableSignals(detection) {
  const signals = {};
  for (const field of AUDITABLE_FIELDS) {
    if (detection[field] !== undefined) {
      signals[field] = detection[field];
    }
  }
  return signals;
}

/**
 * Build explanation text from auditable signals only.
 * No raw text, no user content, no identifying information.
 */
function buildSignalExplanation(signals) {
  const parts = [];

  if (signals.pattern) {
    parts.push(`Pattern: ${signals.pattern}`);
  }
  if (signals.acri !== undefined) {
    parts.push(`ACRI: ${signals.acri}`);
  }
  if (signals.confidence !== undefined) {
    parts.push(`Confidence: ${signals.confidence}`);
  }
  if (signals.gate_result !== undefined) {
    parts.push(`Gate: ${signals.gate_result}/3`);
  }
  if (signals.momentum !== undefined) {
    parts.push(`Momentum: ${signals.momentum}`);
  }
  if (signals.trend) {
    parts.push(`Trend: ${signals.trend}`);
  }
  if (signals.vectors && Array.isArray(signals.vectors)) {
    parts.push(`Vectors matched: ${signals.vectors.length}`);
  }
  if (signals.window) {
    parts.push(`Window: ${typeof signals.window === 'object' ? JSON.stringify(signals.window) : signals.window}`);
  }

  return parts.length > 0
    ? parts.join(' | ')
    : 'No auditable signals available.';
}

/**
 * HL-3: Build minimal explanation when lint violations trigger downgrade.
 */
function buildMinimalExplanation(signals) {
  const pattern = signals.pattern || 'unknown';
  const confidence = signals.confidence || 'low';
  return `Signal detected (${pattern}, confidence: ${confidence}). Details withheld — lint violation triggered HITL review.`;
}

/**
 * HL-4: De-identify explanation for share purpose.
 * Shorter, more neutral, no specific scores that could be used to "prove" manipulation.
 */
function deidentifyExplanation(explanation, signals) {
  // Share mode: only pattern type + confidence band (not exact score)
  const pattern = signals.pattern || 'unknown';
  const confidence = signals.confidence;
  let band = 'low';
  if (typeof confidence === 'number') {
    if (confidence >= 0.7) band = 'elevated';
    else if (confidence >= 0.4) band = 'moderate';
    else band = 'low';
  }
  return `Communication pattern noted (${pattern}, ${band} signal). This is an automated observation, not a diagnosis.`;
}

/**
 * HL-5: Check if explanation text contains surveillance guidance.
 */
function containsSurveillanceGuidance(text) {
  return SURVEILLANCE_PHRASES.some((rx) => rx.test(text));
}

/**
 * Validate that a generated explanation meets all 5 SAFE hard limits.
 * Returns { valid, violations[] }
 */
function validateSafeCompliance(result) {
  const violations = [];

  // HL-2 check: must have hypothesis marker
  if (!result.markers || !result.markers.includes('[假設生成 — 低信心]')) {
    violations.push({ rule: 'HL-2', message: 'Missing hypothesis marker' });
  }

  // HL-4 check: share purpose must have de-identified marker
  if (result.purpose === 'share') {
    if (!result.markers || !result.markers.some((m) => m.includes('share-mode'))) {
      violations.push({ rule: 'HL-4', message: 'Share purpose missing de-identification marker' });
    }
  }

  // HL-5 check: no surveillance guidance in output
  if (containsSurveillanceGuidance(result.explanation || '')) {
    violations.push({ rule: 'HL-5', message: 'Output contains surveillance guidance' });
  }

  return { valid: violations.length === 0, violations };
}

module.exports = {
  SAFE_MODE,
  generateSafeExplanation,
  extractAuditableSignals,
  buildSignalExplanation,
  buildMinimalExplanation,
  deidentifyExplanation,
  containsSurveillanceGuidance,
  validateSafeCompliance,
  AUDITABLE_FIELDS,
  SURVEILLANCE_PHRASES,
};
