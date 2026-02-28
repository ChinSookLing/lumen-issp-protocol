// src/forecast/confidence-rules.js
// Author: Node-03 (AI Council Validator / Schema Architect)
// Sprint 10 — R² confidence split: rule-based confidence
// Separates confidence (rule-based) from probability (stat-based)

/**
 * Compute confidence level based on component hit patterns and consistency.
 * @param {Object} params
 * @param {number} params.hitCount - number of components with score > 0
 * @param {number[]} params.componentScores - array of component scores (0-1)
 * @param {boolean} params.boosterHit - whether a booster component triggered
 * @returns {string} 'low' | 'medium' | 'high'
 */
function computeConfidence({ hitCount, componentScores, boosterHit = false }) {
  // Filter out zero scores to only consider active components
  const activeScores = componentScores.filter(s => s > 0);
  if (activeScores.length === 0) return 'low';

  const avg = activeScores.reduce((a, b) => a + b, 0) / activeScores.length;
  const std = Math.sqrt(
    activeScores.map(s => (s - avg) ** 2).reduce((a, b) => a + b, 0) / activeScores.length
  );

  // Rule 1: booster only → low
  if (boosterHit && hitCount < 2) return 'low';

  // Rule 2: low hit count → low unless scores are very high
  if (hitCount < 2) {
    if (avg > 0.8) return 'medium'; // exceptional
    return 'low';
  }

  // Rule 3: high consistency and good coverage
  if (hitCount >= 3 && std <= 0.2 && avg >= 0.6) return 'high';

  // Rule 4: medium if at least 2 components with moderate scores
  if (hitCount >= 2 && std <= 0.3 && avg >= 0.4) return 'medium';

  // Rule 5: everything else low
  return 'low';
}

module.exports = { computeConfidence };
