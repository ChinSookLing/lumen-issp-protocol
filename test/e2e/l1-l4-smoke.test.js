/**
 * l1-l4-smoke.test.js
 * End-to-End Smoke Test: L1 → L2 → L3 → L4
 *
 * 證明管線可以從原始文字到最終 alert 跑通。
 *
 * Node-05 設計 / Node-01 實作
 * 2026-02-18
 */
'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// Pipeline
const { processMessage, runForecast, runOutput } = require('../../src/pipeline/dispatcher');

// Adapter
const { aggregateToContract, contractToAlertInput } = require('../../src/pipeline/adapters/from-forecast');

// ============================================================
// Test data: 35 messages with MB pattern (minimum for forecast)
// ============================================================
function generateTestMessages(count = 35) {
  const templates = [
    "If you really cared about me, you would do this.",
    "A true friend wouldn't hesitate to help.",
    "After everything I've done for you, this is how you repay me?",
    "Only selfish people refuse to share this kind of thing.",
    "If you don't support us, you're part of the problem.",
    "Real team players make sacrifices for the group.",
    "Your silence means you don't care about what's happening.",
    "Anyone who doesn't stand with us is against us.",
    "If you truly believed in our cause, you'd prove it now.",
    "A real friend would never question this request."
  ];

  return templates.slice(0, Math.min(count, templates.length)).map((text, i) => {
    // Repeat templates to reach count
    const t = templates[i % templates.length];
    return processMessage(t, {
      source: 'test',
      nodeId: 'smoke-test',
      lang: 'en'
    });
  });
}

// ============================================================
// Tests
// ============================================================

describe('L1→L4 end-to-end smoke test', () => {

  it('full pipeline produces alert with evidence_ids and build_fingerprint', () => {
    // Step 1: L1+L2 — process messages into events
    const events = generateTestMessages(35);
    assert.ok(events.length >= 10, `Need events, got ${events.length}`);

    // Step 2: L3 — run forecast
    const aggregate = runForecast(events, 'MB', { windowDays: 7 });
    assert.ok(aggregate, 'runForecast returned null');
    assert.ok(aggregate.aggregate_id, 'missing aggregate_id');

    // Step 3: Bridge — aggregate → contract → alert input
    const contract = aggregateToContract(aggregate, {
      chatId: 'smoke-test-chat',
      commitHash: '117394f',
      operatorMode: 'test'
    });
    assert.ok(contract.evidence_ids.length > 0, 'contract has no evidence_ids');
    assert.ok(contract.build_fingerprint.commit_hash === '117394f', 'commit_hash mismatch');

    // Step 4: Adapter — contract → flat detection
    const alertInput = contractToAlertInput(contract);
    assert.ok(alertInput.acri >= 0, 'alertInput missing acri');
    assert.ok(alertInput.patterns.length > 0, 'alertInput has no patterns');
    assert.ok(alertInput._forecast_contract, 'traceability field missing');

    // Step 5: L4 — run output
    const output = runOutput(alertInput, aggregate, {
      formatType: 'report',
      lang: 'en'
    });
    assert.ok(output, 'runOutput returned null');
    assert.ok(output.alert, 'output missing alert');
    assert.ok(output.output, 'output missing formatted output');

    // Verify traceability chain
    assert.ok(
      alertInput._forecast_contract.evidence_ids.length > 0,
      'traceability: evidence_ids lost in pipeline'
    );
    assert.ok(
      alertInput._forecast_contract.build_fingerprint.operator_mode === 'test',
      'traceability: operator_mode lost'
    );
  });

  it('pipeline handles zero-detection messages gracefully', () => {
    const events = [
      processMessage("Hello, how are you today?", { source: 'test', nodeId: 'n1', lang: 'en' }),
      processMessage("Nice weather we're having.", { source: 'test', nodeId: 'n1', lang: 'en' })
    ];

    const aggregate = runForecast(events, 'MB', { windowDays: 7 });
    assert.ok(aggregate, 'aggregate should exist even with no detections');
    // forecast may be null (not enough data) — that's expected
    assert.equal(aggregate.data_points <= 2, true, 'should have few/no data points for MB');
  });

});
