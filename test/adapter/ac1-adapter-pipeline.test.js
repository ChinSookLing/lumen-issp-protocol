/**
 * ac1-adapter-pipeline.test.js
 * AC-1 Acceptance Test: adapter.process() → dispatcher.pipeline() → l4-export
 *
 * Verifies the full pipeline: Telegram mock message enters adapter,
 * adapter normalizes + validates, hands off to dispatcher,
 * dispatcher runs L1→L2→L3→L4, result comes back as l4-export.
 *
 * 設計：Node-01 (Architect)
 * 日期：2026-02-25
 * AC-1 Owner: Node-01 + Node-03
 */

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { process, handleInvalid, adapter } = require('../../src/adapter/adapter');
const dispatcher = require('../../src/pipeline/dispatcher');
const { createTelegramMessage, createConversation } = require('../../src/adapter/telegram-mock');

// ============================================================
// AC-1 Core: adapter.process() → dispatcher → l4-export
// ============================================================

describe('AC-1: adapter → dispatcher pipeline', () => {

  // --- Happy path: benign message through full pipeline ---

  it('AC-1.1: benign telegram message produces complete l4-export', async () => {
    const msg = createTelegramMessage('Hello, how are you today?');
    const accessLog = [];

    const result = await process(msg, dispatcher, { accessLog });

    // Adapter metadata present
    assert.ok(result.request_id, 'should have request_id');
    assert.equal(result.domain, 'C_PRIVATE'); // REG-CB-12: migrated
    assert.equal(result.source, 'telegram_user_message');
    assert.ok(result.adapter, 'should have adapter metadata');
    assert.equal(result.adapter.engine_version, 'adapter-v0.2.0');
    assert.equal(result.adapter.fallback_occurred, false);

    // Pipeline result present
    assert.ok(result.event, 'should have event from dispatcher');
    assert.ok(result.event.layers.layer1, 'should have L1 detection');
    assert.ok(result.event.layers.layer2, 'should have L2 mapping');
    assert.ok(result.output, 'should have L4 output');
    assert.ok(result.output.alert, 'should have alert result');
    assert.equal(result.pipeline_version, '0.1.0');

    // Benign = no patterns
    assert.equal(result.event.layers.layer1.acri, 0);
    assert.equal(result.event.layers.layer1.patterns.length, 0);

    // Access log recorded (AC-3 requirement)
    assert.ok(accessLog.length >= 1, 'should have at least 1 access log entry');
    assert.equal(accessLog[0].action, 'ADAPTER_PASS');
  });

  // --- Happy path: manipulation detected end-to-end ---

  it('AC-1.2: manipulation message triggers detection through pipeline', async () => {
    const msg = createTelegramMessage(
      'If you don\'t listen to me, I will tell everyone your secret. You owe me after everything I did for you.',
      { language: 'en' }
    );
    const accessLog = [];

    const result = await process(msg, dispatcher, { accessLog });

    // Should detect manipulation
    assert.ok(result.event.layers.layer1.acri > 0, 'should have non-zero ACRI');
    assert.ok(result.event.layers.layer1.patterns.length > 0, 'should detect patterns');

    // Should have L4 output
    assert.ok(result.output.alert, 'should have alert');
    assert.ok(result.output.output, 'should have formatted output');

    // Access log
    const passEntry = accessLog.find(e => e.action === 'ADAPTER_PASS');
    assert.ok(passEntry, 'should log ADAPTER_PASS');
  });

  // --- Happy path: Chinese text ---

  it('AC-1.3: Chinese manipulation message detected', async () => {
    const msg = createTelegramMessage(
      '你昨天為什麼不接我電話？我為你做了這麼多，你就這樣對我？如果你不聽我的，我就把一切都告訴你爸媽。',
      { language: 'zh-TW', domain: 'C_PERSONAL' }
    );
    const accessLog = [];

    const result = await process(msg, dispatcher, { accessLog });

    assert.ok(result.request_id);
    assert.equal(result.domain, 'C_PRIVATE'); // REG-CB-12: migrated
    assert.ok(result.event, 'should have pipeline event');
    assert.ok(result.output, 'should have pipeline output');
  });

  // --- Domain + scenario pass-through ---

  it('AC-1.4: domain and scenario pass through correctly', async () => {
    const msg = createTelegramMessage('test message', {
      domain: 'A_FINANCIAL',
      scenario: 'incident_review'
    });

    const result = await process(msg, dispatcher);

    assert.equal(result.domain, 'A_ECONOMIC'); // REG-CB-12: migrated
    assert.equal(result.scenario, 'incident_review');
  });

  // --- Conversation ID for multi-turn traceability ---

  it('AC-1.5: conversation_id preserved for multi-turn', async () => {
    const msg = createTelegramMessage('test', { chat_id: 999888 });

    const result = await process(msg, dispatcher);

    assert.equal(result.conversation_id, 'tg_999888');
  });
});

// ============================================================
// AC-1 Error Handling: explicit reject, never silent drop
// ============================================================

describe('AC-1: error handling (explicit reject)', () => {

  it('AC-1.6: SPEG-blocked source returns ADAPTER_REJECT', async () => {
    const msg = {
      request_id: 'blocked_001',
      source: { type: 'firehose_stream' },
      content: { text: 'should be blocked' }
    };
    const accessLog = [];

    const result = await process(msg, dispatcher, { accessLog });

    assert.equal(result.error, 'INVALID_INPUT');
    assert.equal(result.code, 'ADAPTER_REJECT');
    assert.ok(result.reason.includes('SPEG violation'));
    assert.equal(result.logged, true);

    // Should be in access log
    const rejectEntry = accessLog.find(e => e.action === 'ADAPTER_REJECT');
    assert.ok(rejectEntry, 'rejection should be logged');
  });

  it('AC-1.7: empty text returns ADAPTER_REJECT', async () => {
    const msg = {
      request_id: 'empty_001',
      source: { type: 'manual_paste' },
      content: { text: '' }
    };
    const accessLog = [];

    const result = await process(msg, dispatcher, { accessLog });

    assert.equal(result.error, 'INVALID_INPUT');
    assert.equal(result.code, 'ADAPTER_REJECT');
    assert.ok(result.reason.includes('empty'));
  });

  it('AC-1.8: missing text field returns ADAPTER_REJECT', async () => {
    const msg = {
      request_id: 'notext_001',
      source: { type: 'manual_paste' }
      // no content, no text
    };
    const accessLog = [];

    const result = await process(msg, dispatcher, { accessLog });

    assert.equal(result.error, 'INVALID_INPUT');
    assert.equal(result.code, 'ADAPTER_REJECT');
  });

  it('AC-1.9: plain string input works (manual_paste fallback)', async () => {
    // Plain string should be parsed as { text: string, source: 'manual_paste' }
    const result = await process('Hello world', dispatcher);

    assert.ok(result.event, 'plain string should be processed');
    assert.equal(result.source, 'manual_paste');
  });
});

// ============================================================
// AC-1 Backward Compatibility: original adapter() still works
// ============================================================

describe('AC-1: backward compatibility', () => {

  it('AC-1.10: original adapter() function unchanged', async () => {
    const input = {
      request_id: 'compat_001',
      domain: 'C_PERSONAL',
      scenario: 'monitoring_brief',
      source: { type: 'telegram_user_message' },
      content: { text: 'test' }
    };

    const result = await adapter(input);

    // Original shape preserved
    assert.equal(result.request_id, 'compat_001');
    assert.ok(result.layers.layer1);
    assert.ok(result.metadata);
    assert.equal(result.metadata.engine_version, 'adapter-v0.1.1');
  });
});

// ============================================================
// AC-1 + Telegram Mock: createConversation()
// ============================================================

describe('AC-1: telegram mock helpers', () => {

  it('AC-1.11: createConversation produces sequential messages', () => {
    const msgs = createConversation([
      'First message',
      'Second message',
      'Third message'
    ], { chat_id: 777 });

    assert.equal(msgs.length, 3);
    // All same chat_id
    assert.ok(msgs.every(m => m.chat_id === 777));
    assert.ok(msgs.every(m => m.conversation_id === 'tg_777'));
    // Sequential message_ids
    assert.ok(msgs[1].message_id > msgs[0].message_id);
    assert.ok(msgs[2].message_id > msgs[1].message_id);
  });

  it('AC-1.12: multi-turn messages all process through pipeline', async () => {
    const msgs = createConversation([
      'How are you?',
      'I need your help with something.',
      'If you don\'t help me, I\'ll tell everyone what you did.'
    ]);

    const results = [];
    for (const msg of msgs) {
      const result = await process(msg, dispatcher);
      results.push(result);
    }

    // All should succeed (no ADAPTER_REJECT)
    assert.ok(results.every(r => !r.error), 'all messages should process');
    // All should have pipeline output
    assert.ok(results.every(r => r.event && r.output), 'all should have output');
    // Last message (manipulation) should have higher ACRI
    assert.ok(
      results[2].event.layers.layer1.acri > results[0].event.layers.layer1.acri,
      'manipulation message should score higher'
    );
  });
});
