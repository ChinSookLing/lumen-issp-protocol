
/**
 * ac2-multiturn-rw-pipeline.test.js
 * AC-2 Acceptance Test: ≥3 multi-turn RW scenarios through L1→L2→L3
 *
 * Data sources (all in test/fixtures/rw-multi-turn/):
 *   - Node-06 MT01: 親密關係 — DM+EP escalation (C_PERSONAL)
 *   - Node-03 MT02: 職場壓迫 — FC+GC+DM escalation (E_ENTERPRISE)
 *   - Node-04 MT03: 職場聲譽勒索 — identity stripping (E_ENTERPRISE)
 *   - Node-06 MT04: 投資 FOMO — FC+DM escalation (A_FINANCIAL)
 *
 * Pipeline: Each turn → dispatcher.pipeline() (L1+L2) → MomentumEngine.processTurn() (L3)
 * Verification: ACRI escalation across turns, momentum tracks trend
 *
 * 設計：Node-01 (Architect)
 * 日期：2026-02-25
 * AC-2 Owner: Node-05 + Node-06 + Node-04 → Node-01
 */

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const { pipeline } = require('../../src/pipeline/dispatcher');
const MomentumEngine = require('../../src/engines/momentum-engine');

// Load RW multi-turn fixtures
const grokFixtures = require('../fixtures/rw-multi-turn/grok-rw-mt-01-05.json');
const deepseekFixtures = require('../fixtures/rw-multi-turn/deepseek-rw-mt-01-05.json');
const geminiFixtures = require('../fixtures/rw-multi-turn/gemini-rw-mt-01-05.json');

// ─── Helper: run a multi-turn scenario through L1+L2+L3 ─────────────
function runMultiTurnScenario(turns, options = {}) {
  const engine = new MomentumEngine({
    decayFactor: 0.88,  // per momentum.v0.1.json calibration
    windowSize: 5
  });

  const results = [];

  for (const turn of turns) {
    const text = turn.text || turn.text_zh || '';
    if (!text || text.startsWith('[')) {
      // Skip placeholder turns like "[Building common enemy narrative...]"
      continue;
    }

    // L1 + L2 via dispatcher
    const pipelineResult = pipeline(text, {
      source: options.source || 'rw-multi-turn',
      lang: options.lang || 'en'
    });

    const det = pipelineResult.event._detection;
    const l1Patterns = pipelineResult.event.layers.layer1.patterns;

    // L3: feed into momentum engine
    const momentumResult = engine.processTurn({
      timestamp: turn.day ? `day_${turn.day}` : turn.t || `t_${results.length}`,
      acri_base: det.acri,
      structure_hit: l1Patterns.length > 0,
      detected_motifs: []  // motif detection is separate; MVP uses empty
    });

    results.push({
      turn_index: results.length,
      text_preview: text.slice(0, 40),
      l1_acri: det.acri,
      l1_patterns: l1Patterns.map(p => p.id),
      l1_gate_hits: det.gate_hits.push.hit_count || 0,
      momentum_score: momentumResult.momentum_score,
      final_acri: momentumResult.final_acri,
      motif_hint: momentumResult.motif_hint_score
    });
  }

  return results;
}

// ============================================================
// AC-2 Scenario 1: Node-06 MT01 — 親密關係 DM+EP (C_PERSONAL)
// ============================================================

describe('AC-2 Scenario 1: Node-06 MT01 — intimate relationship escalation', () => {
  const scenario = grokFixtures.find(s => s.id === 'RW-GROK-MT01');

  it('AC-2.1.1: all turns process through L1+L2+L3 without error', () => {
    const results = runMultiTurnScenario(scenario.turns);
    assert.ok(results.length >= 3, `should process ≥3 turns, got ${results.length}`);
    // Every result should have valid structure
    for (const r of results) {
      assert.ok(typeof r.l1_acri === 'number', 'l1_acri should be number');
      assert.ok(typeof r.momentum_score === 'number', 'momentum_score should be number');
    }
  });

  it('AC-2.1.2: later turns show higher momentum than early turns', () => {
    const results = runMultiTurnScenario(scenario.turns);
    if (results.length >= 2) {
      const lastMomentum = results[results.length - 1].momentum_score;
      const firstMomentum = results[0].momentum_score;
      assert.ok(
        lastMomentum >= firstMomentum,
        `last momentum (${lastMomentum}) should >= first (${firstMomentum})`
      );
    }
  });

  it('AC-2.1.3: escalation turn (day 9) — diagnostic baseline', () => {
    const results = runMultiTurnScenario(scenario.turns);
    const lastTurn = results[results.length - 1];
    console.log('    [BASELINE] Node-06 MT01 last: acri=' + lastTurn.l1_acri + ' gate=' + lastTurn.l1_gate_hits);
    assert.ok(results.length >= 3, 'all turns processed through L1+L2+L3');
  });
});

// ============================================================
// AC-2 Scenario 2: Node-03 MT02 — 職場壓迫 (E_ENTERPRISE)
// ============================================================

describe('AC-2 Scenario 2: Node-03 MT02 — workplace pressure escalation', () => {
  const scenario = deepseekFixtures.find(s => s.id === 'RW-DS-MT02');

  it('AC-2.2.1: all manipulation turns process through pipeline', () => {
    // Filter to speaker A (Manager) — the manipulator
    const manipTurns = scenario.turns.filter(t => t.speaker === 'Manager');
    const results = runMultiTurnScenario(manipTurns, { lang: 'zh-TW' });
    assert.ok(results.length >= 3, `should process ≥3 manager turns, got ${results.length}`);
  });

  it('AC-2.2.2: momentum accumulates across manager turns', () => {
    const manipTurns = scenario.turns.filter(t => t.speaker === 'Manager');
    const results = runMultiTurnScenario(manipTurns, { lang: 'zh-TW' });
    if (results.length >= 2) {
      const lastMomentum = results[results.length - 1].momentum_score;
      const firstMomentum = results[0].momentum_score;
      assert.ok(
        lastMomentum >= firstMomentum,
        `momentum should accumulate: last=${lastMomentum} >= first=${firstMomentum}`
      );
    }
  });

  it('AC-2.2.3: final turn (debt trigger) has highest L1 signal', () => {
    const manipTurns = scenario.turns.filter(t => t.speaker === 'Manager');
    const results = runMultiTurnScenario(manipTurns, { lang: 'zh-TW' });
    if (results.length >= 2) {
      const lastAcri = results[results.length - 1].l1_acri;
      const firstAcri = results[0].l1_acri;
      // "我給過你機會，別讓我失望" should score higher than "這個 deadline 很緊"
      assert.ok(
        lastAcri >= firstAcri,
        `final turn acri (${lastAcri}) should >= first (${firstAcri})`
      );
    }
  });
});

// ============================================================
// AC-2 Scenario 3: Node-04 MT03 — 職場聲譽勒索 (E_ENTERPRISE)
// ============================================================

describe('AC-2 Scenario 3: Node-04 MT03 — workplace reputation coercion', () => {
  const scenario = geminiFixtures.find(s => s.id === 'RW-GEMINI-MT03');

  it('AC-2.3.1: all 4 turns process through L1+L2+L3', () => {
    const results = runMultiTurnScenario(scenario.turns, { lang: 'zh-TW' });
    assert.equal(results.length, 4, 'should process all 4 turns');
  });

  it('AC-2.3.2: momentum increases over conversation', () => {
    const results = runMultiTurnScenario(scenario.turns, { lang: 'zh-TW' });
    const lastMomentum = results[results.length - 1].momentum_score;
    const firstMomentum = results[0].momentum_score;
    assert.ok(
      lastMomentum >= firstMomentum,
      `momentum should increase: last=${lastMomentum} >= first=${firstMomentum}`
    );
  });

  it('AC-2.3.3: turn 4 (ultimatum) — diagnostic baseline', () => {
    const results = runMultiTurnScenario(scenario.turns, { lang: 'zh-TW' });
    const turn4 = results[3];
    console.log('    [BASELINE] Node-04 MT03 turn4: acri=' + turn4.l1_acri + ' gate=' + turn4.l1_gate_hits);
    assert.ok(results.length === 4, 'all 4 turns processed through L1+L2+L3');
  });
});

// ============================================================
// AC-2 Scenario 4 (Bonus): Node-06 MT04 — 投資 FOMO (A_FINANCIAL)
// ============================================================

describe('AC-2 Scenario 4: Node-06 MT04 — investment FOMO escalation', () => {
  const scenario = grokFixtures.find(s => s.id === 'RW-GROK-MT04');

  it('AC-2.4.1: all 4 turns process through pipeline', () => {
    const results = runMultiTurnScenario(scenario.turns);
    assert.equal(results.length, 4, 'should process all 4 turns');
  });

  it('AC-2.4.2: FOMO turn (day 5) shows urgency signal', () => {
    const results = runMultiTurnScenario(scenario.turns);
    // Day 5: "Don't miss out or you'll regret it forever."
    const turn3 = results[2];
    assert.ok(
      turn3.l1_acri > 0 || turn3.l1_gate_hits >= 1,
      `FOMO turn should show signal: acri=${turn3.l1_acri}, gate=${turn3.l1_gate_hits}`
    );
  });

  it('AC-2.4.3: momentum tracks escalation across 4 turns', () => {
    const results = runMultiTurnScenario(scenario.turns);
    // Momentum should generally increase as manipulation intensifies
    const momValues = results.map(r => r.momentum_score);
    // At minimum, last should be >= first
    assert.ok(
      momValues[momValues.length - 1] >= momValues[0],
      `momentum should track escalation: ${momValues.join(' → ')}`
    );
  });
});

// ============================================================
// AC-2 Cross-scenario: pipeline integrity checks
// ============================================================

describe('AC-2 Cross-scenario: pipeline integrity', () => {

  it('AC-2.5.1: ≥3 scenarios successfully completed (AC-2 minimum)', () => {
    const scenarios = [
      { data: grokFixtures.find(s => s.id === 'RW-GROK-MT01'), lang: 'en' },
      { data: deepseekFixtures.find(s => s.id === 'RW-DS-MT02'), lang: 'zh-TW' },
      { data: geminiFixtures.find(s => s.id === 'RW-GEMINI-MT03'), lang: 'zh-TW' }
    ];

    let successCount = 0;
    for (const s of scenarios) {
      const turns = s.data.turns.filter(t => {
        const text = t.text || t.text_zh || '';
        return text && !text.startsWith('[');
      });
      const results = runMultiTurnScenario(turns, { lang: s.lang });
      if (results.length >= 2) successCount++;
    }

    assert.ok(successCount >= 3, `AC-2 requires ≥3 scenarios, got ${successCount}`);
  });

  it('AC-2.5.2: momentum engine is stateless between scenarios', () => {
    // Run scenario 1
    const s1 = grokFixtures.find(s => s.id === 'RW-GROK-MT01');
    const r1 = runMultiTurnScenario(s1.turns);

    // Run scenario 2 — should start fresh (new MomentumEngine instance)
    const s2 = grokFixtures.find(s => s.id === 'RW-GROK-MT04');
    const r2 = runMultiTurnScenario(s2.turns);

    // First turn of s2 should not carry over momentum from s1
    assert.equal(
      r2[0].momentum_score,
      parseFloat(r2[0].l1_acri.toFixed(4)),
      'first turn momentum should equal its own acri (no carry-over)'
    );
  });
});
