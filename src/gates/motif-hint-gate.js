// src/gates/motif-hint-gate.js
// Author: Node-04 (AI Council Visionary)
// Sprint 10 MVP — structure-first gating
// Rule: structure_hit === true → allow motif_hint; else → 0

const motifsConfig = require('../../config/motifs/structure-motifs.v0.1.json');

/**
 * 計算 Motif 加權增量
 * @param {boolean} structureHit - L2 結構向量是否命中
 * @param {Array} detectedMotifIds - 當前輪次偵測到的母題 ID 列表
 * @returns {number} - 最終加權值 (motif_hint_score)
 */
function calculateMotifHint(structureHit, detectedMotifIds) {
  if (!structureHit || !detectedMotifIds || detectedMotifIds.length === 0) {
    return 0; // 門控：無結構命中則權重歸零
  }

  let totalBoost = 0;
  const { motifs, global_constraints } = motifsConfig;

  detectedMotifIds.forEach(id => {
    const motif = motifs.find(m => m.id === id);
    if (motif) {
      totalBoost += motif.weight_boost;
    }
  });

  // 應用全局天花板限制 (Anti-drift)
  return Math.min(totalBoost, global_constraints.max_cumulative_hint);
}

module.exports = { calculateMotifHint };
