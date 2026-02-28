// test/engines/burst-logic.test.js
// L3-close-02: burst_factor test suite
// Node-04 formula → Node-01 implementation + test (M89)

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const MomentumEngine = require('../../src/engines/momentum-engine');
const burstFixture = require('../fixtures/burst-10msg.json');

describe('L3-close-02: burst_factor logic', () => {
  // --- calculateBurstFactor ---

  it('calculateBurstFactor returns base gamma when f < 10', () => {
    const engine = new MomentumEngine();
    assert.strictEqual(engine.calculateBurstFactor(0), 0.85);
    assert.strictEqual(engine.calculateBurstFactor(5), 0.85);
    assert.strictEqual(engine.calculateBurstFactor(9), 0.85);
  });

  it('calculateBurstFactor returns γ×0.85 when f >= 10', () => {
    const engine = new MomentumEngine();
    assert.strictEqual(engine.calculateBurstFactor(10), 0.7225);
    assert.strictEqual(engine.calculateBurstFactor(15), 0.7225);
    assert.strictEqual(engine.calculateBurstFactor(100), 0.7225);
  });

  it('calculateBurstFactor boundary: f=9 vs f=10', () => {
    const engine = new MomentumEngine();
    assert.strictEqual(engine.calculateBurstFactor(9), 0.85);
    assert.strictEqual(engine.calculateBurstFactor(10), 0.7225);
  });

  // --- processTurn with burst context ---

  it('processTurn without context uses base gamma', () => {
    const engine = new MomentumEngine();
    const turn = burstFixture.turns[0];
    const result = engine.processTurn(turn);
    assert.strictEqual(result.burst_applied, false);
    assert.strictEqual(result.effective_gamma, 0.85);
  });

  it('processTurn with msg_per_min=0 uses base gamma', () => {
    const engine = new MomentumEngine();
    const turn = burstFixture.turns[0];
    const result = engine.processTurn(turn, { msg_per_min: 0 });
    assert.strictEqual(result.burst_applied, false);
    assert.strictEqual(result.effective_gamma, 0.85);
  });

  it('processTurn with msg_per_min=10 applies burst', () => {
    const engine = new MomentumEngine();
    const turn = burstFixture.turns[0];
    const result = engine.processTurn(turn, { msg_per_min: 10 });
    assert.strictEqual(result.burst_applied, true);
    assert.strictEqual(result.effective_gamma, 0.7225);
  });

  it('burst fixture full sequence — all turns burst_applied', () => {
    const engine = new MomentumEngine();
    const context = { msg_per_min: burstFixture.context.msg_per_min };
    let lastResult;
    for (const turn of burstFixture.turns) {
      lastResult = engine.processTurn(turn, context);
    }
    assert.strictEqual(lastResult.burst_applied, burstFixture.expected.burst_applied);
    assert.strictEqual(lastResult.effective_gamma, burstFixture.expected.effective_gamma);
  });

  it('burst lowers momentum_score compared to no-burst', () => {
    const engineNoBurst = new MomentumEngine();
    const engineBurst = new MomentumEngine();
    const turns = burstFixture.turns;
    let resultNoBurst, resultBurst;
    for (const turn of turns) {
      resultNoBurst = engineNoBurst.processTurn(turn);
      resultBurst = engineBurst.processTurn(turn, { msg_per_min: 10 });
    }
    assert.ok(resultBurst.momentum_score < resultNoBurst.momentum_score);
  });

  it('custom decayFactor respects burst_factor', () => {
    const engine = new MomentumEngine({ decayFactor: 0.9, windowSize: 5 });
    assert.strictEqual(engine.calculateBurstFactor(10), 0.765);
  });

  it('processTurn still returns all original fields', () => {
    const engine = new MomentumEngine();
    const turn = burstFixture.turns[0];
    const result = engine.processTurn(turn);
    assert.ok('final_acri' in result);
    assert.ok('momentum_score' in result);
    assert.ok('motif_hint_score' in result);
    assert.ok('timestamp' in result);
    assert.ok('burst_applied' in result);
    assert.ok('effective_gamma' in result);
  });
});
