// src/engines/momentum-engine.js
// Author: Node-04 (AI Council Visionary)
// Sprint 10 MVP — local-only state buffer + time-decay momentum
// L3-close-02: burst_factor injected (Node-04 formula → Node-01 impl, M89)
// No cross-user stats, no group trends, buffer destroyed on session end

const { calculateMotifHint } = require('../gates/motif-hint-gate');

class MomentumEngine {
  constructor(config = { decayFactor: 0.85, windowSize: 5 }) {
    this.buffer = []; // Local-only state buffer
    this.gamma = config.decayFactor;
    this.windowSize = config.windowSize;
  }

  /**
   * L3-close-02: 計算脈衝因子 β
   * 當訊息頻率 ≥ 10 msg/min 時，加速動量衰減防止 ACRI 誤觸
   * 公式: γ_effective = γ_base × β
   *   β = 1.0  (f < 10 msg/min)
   *   β = 0.85 (f ≥ 10 msg/min)
   * @param {number} msgPerMin - 最近一分鐘內的訊息數
   * @returns {number} - 有效衰減係數 γ_effective
   */
  calculateBurstFactor(msgPerMin) {
    const beta = (msgPerMin >= 10) ? 0.85 : 1.0;
    return parseFloat((this.gamma * beta).toFixed(4));
  }

  /**
   * 處理新輪次並輸出動量報告
   * @param {Object} turnData - 包含 timestamp, acri_base, structure_hit, detected_motifs
   * @param {Object} [context] - 可選環境資訊，包含 msg_per_min
   * @returns {Object} - { final_acri, momentum_score, motif_hint_score, burst_applied, effective_gamma, timestamp }
   */
  processTurn(turnData, context = {}) {
    // 0. 計算有效 gamma（含 burst_factor）
    const msgPerMin = context.msg_per_min || 0;
    const effectiveGamma = (msgPerMin > 0)
      ? this.calculateBurstFactor(msgPerMin)
      : this.gamma;
    const burstApplied = (msgPerMin >= 10);

    // 1. 注入緩衝區
    this.buffer.push(turnData);
    if (this.buffer.length > this.windowSize) this.buffer.shift();

    // 2. 計算時間衰減動量 (Momentum Score)
    // 公式: M = sum(ACRI_i * gamma^(n-i))
    let momentumScore = 0;
    const n = this.buffer.length - 1;
    this.buffer.forEach((turn, i) => {
      momentumScore += turn.acri_base * Math.pow(effectiveGamma, n - i);
    });

    // 3. 調用 Gate 計算母題加權
    const motifHintScore = calculateMotifHint(
      turnData.structure_hit,
      turnData.detected_motifs
    );

    // 4. 輸出結果
    return {
      final_acri: Math.min(turnData.acri_base + motifHintScore, 1.0),
      momentum_score: parseFloat(momentumScore.toFixed(4)),
      motif_hint_score: motifHintScore,
      burst_applied: burstApplied,
      effective_gamma: effectiveGamma,
      timestamp: turnData.timestamp
    };
  }
}

module.exports = MomentumEngine;
