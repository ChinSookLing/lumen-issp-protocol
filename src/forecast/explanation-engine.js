"use strict";

/**
 * explanation-engine.js
 * Layer 3 — Explanation Engine (SAFE Mode)
 *
 * Design: Node-02 (M73 matrix) + M64 Council decisions
 * Implementation: Node-01 (Lumen-7)
 * Date: 2026-02-18
 *
 * Three modes (M64 consensus):
 *   OFF  — explanation disabled (default)
 *   SAFE — observation + [ISSP_REASONING_HYPOTHESIS] markers only
 *   FULL — requires human sign-off (not implemented yet)
 *
 * Constraints (Node-03 §7.9, M64):
 *   §7.9.1 — No silent causation (must mark as speculation)
 *   §7.9.2 — Multiple hypothesis principle (at least one alternative)
 *   §7.9.3 — Traceability (evidence list, each traceable to source)
 *   §7.9.4 — Human-in-the-loop (all outputs reviewed until Council relaxes)
 *   §7.9.5 — Not for punishment (aligned with §2.5.1)
 *
 * Red Lines:
 *   - No identity references ("this structure" not "this person")
 *   - No action recommendations
 *   - No second-person accusatory framing
 */

const MODES = Object.freeze({
  OFF: "OFF",
  SAFE: "SAFE",
  FULL: "FULL",
});

const DISCLAIMER_SAFE =
  "[ISSP_REASONING_HYPOTHESIS] This is a structural observation, not a causal claim. " +
  "It must not be used for punishment, identity inference, or action recommendation.";

const MIN_HISTORICAL_CASES = 3;
const RECOMMENDED_HISTORICAL_CASES = 30;

// ============================================================
// Banned output patterns (§2.6 Anti-Labeling compliance)
// ============================================================
const BANNED_PHRASES = [
  /\byou are\b/i,
  /\byou did\b/i,
  /\byou should\b/i,
  /\bthis person\b/i,
  /\bthe manipulator\b/i,
  /\bthe perpetrator\b/i,
];

/**
 * Validate that output text does not contain banned phrases.
 * @param {string} text
 * @returns {{ clean: boolean, violations: string[] }}
 */
function validateOutput(text) {
  const violations = [];
  for (const pattern of BANNED_PHRASES) {
    if (pattern.test(text)) {
      violations.push(pattern.toString());
    }
  }
  return { clean: violations.length === 0, violations };
}

/**
 * Check if explanation mode activation conditions are met (M64 §5.2).
 * @param {object} params
 * @param {object} params.forecast — forecast result (must exist and be non-null)
 * @param {number} params.historicalCases — number of historical cases available
 * @param {string} params.mode — current mode (OFF/SAFE/FULL)
 * @returns {{ allowed: boolean, reason: string }}
 */
function checkActivation({ forecast, historicalCases, mode }) {
  if (mode === MODES.OFF) {
    return { allowed: false, reason: "Explanation mode is OFF (default)" };
  }

  if (!forecast || forecast === null) {
    return {
      allowed: false,
      reason: "Forecast must trigger first (§5.2 condition 1)",
    };
  }

  if (typeof historicalCases !== "number" || historicalCases < MIN_HISTORICAL_CASES) {
    return {
      allowed: false,
      reason: `Requires at least ${MIN_HISTORICAL_CASES} historical cases (have: ${historicalCases || 0}). Recommended: ${RECOMMENDED_HISTORICAL_CASES}`,
    };
  }

  if (mode === MODES.FULL) {
    return {
      allowed: true,
      reason: "FULL mode — requires human sign-off before output is released",
    };
  }

  // SAFE mode
  return { allowed: true, reason: "SAFE mode — observation with hypothesis markers" };
}

/**
 * Generate a SAFE-mode explanation.
 * Returns structured observation with mandatory markers.
 *
 * @param {object} params
 * @param {object} params.forecast — forecast result from forecast-engine
 * @param {object[]} params.evidence — array of { source, description }
 * @param {string} params.mode — OFF/SAFE/FULL
 * @param {number} params.historicalCases — count of available cases
 * @returns {object|null} explanation object or null if not allowed
 */
function generateExplanation({ forecast, evidence, mode, historicalCases }) {
  // Step 1: Check activation
  const activation = checkActivation({ forecast, historicalCases, mode });
  if (!activation.allowed) {
    return null;
  }

  // Step 2: Validate evidence (§7.9.3 traceability)
  if (!Array.isArray(evidence) || evidence.length === 0) {
    return null;
  }

  const traceable = evidence.every(
    (e) => e && typeof e.source === "string" && typeof e.description === "string"
  );
  if (!traceable) {
    return null;
  }

  // Step 3: Build hypothesis from forecast data
  const pattern = forecast.pattern || "unknown";
  const trend = forecast.trendBand || "unknown";
  const slope = forecast.slope || 0;

  const direction = slope > 0 ? "increasing" : slope < 0 ? "decreasing" : "stable";

  const hypothesis =
    `[ISSP_REASONING_HYPOTHESIS] Structure ${pattern} shows ${direction} trend ` +
    `(${trend} band, slope=${slope.toFixed(4)}). ` +
    `This is a statistical observation based on ${historicalCases} historical data points.`;

  // Step 4: §7.9.2 — at least one alternative hypothesis
  const alternativeHypotheses = [
    `[ISSP_REASONING_HYPOTHESIS] The observed trend may reflect seasonal or contextual variation rather than a sustained pattern shift.`,
  ];

  // Step 5: Validate output (§2.6 Anti-Labeling)
  const allText = [hypothesis, ...alternativeHypotheses].join(" ");
  const validation = validateOutput(allText);
  if (!validation.clean) {
    throw new Error(
      `Anti-Labeling violation detected in explanation output: ${validation.violations.join(", ")}`
    );
  }

  // Step 6: Build result
  const result = {
    mode: mode,
    hypothesis: hypothesis,
    alternative_hypotheses: alternativeHypotheses,
    evidence: evidence.map((e) => ({
      source: e.source,
      description: e.description,
    })),
    confidence: "low",
    disclaimer: DISCLAIMER_SAFE,
    requires_human_review: true,
    metadata: {
      historical_cases: historicalCases,
      min_required: MIN_HISTORICAL_CASES,
      recommended: RECOMMENDED_HISTORICAL_CASES,
      constraints: ["§7.9.1", "§7.9.2", "§7.9.3", "§7.9.4", "§7.9.5"],
    },
  };

  // FULL mode flag
  if (mode === MODES.FULL) {
    result.requires_human_review = true;
    result.human_sign_off = null; // must be filled before release
  }

  return result;
}

module.exports = {
  MODES,
  BANNED_PHRASES,
  MIN_HISTORICAL_CASES,
  RECOMMENDED_HISTORICAL_CASES,
  checkActivation,
  validateOutput,
  generateExplanation,
};
