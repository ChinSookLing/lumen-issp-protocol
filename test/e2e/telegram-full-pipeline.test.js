/**
 * telegram-full-pipeline.test.js
 * Step 14 — End-to-End: Telegram Webhook → L1 → L2 → L3 → L4 → formatReply
 *
 * 驗證完整 Telegram 管線：從 raw webhook update 到最終 Bot 回覆。
 * 這不是 HTTP 測試（不啟動 server），而是 unit-level E2E：
 *   parseTelegramUpdate → dispatcher.pipeline → applyView → formatReply
 *
 * Owner: Node-01 + Node-02 (M89 V2 6/6)
 * Acceptance: test/e2e/sprint11-step14.test.js or this file PASS
 *
 * 2026-02-25
 */
'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// === Telegram Adapter ===
const { parseTelegramUpdate } = require('../../src/telegram/telegram-adapter');

// === Pipeline ===
const { processMessage, runForecast, runOutput, pipeline, adaptL1toFlat } = require('../../src/pipeline/dispatcher');

// === L4 View ===
const { applyView, stripFields } = require('../../src/output/view-engine');

// === Webhook formatReply ===
const { formatReply } = require('../../src/telegram/webhook-server');

// === Output Triple (access_log) ===
const { buildAccessLog, buildL4Export, buildManifest, generateOutputTriple } = require('../../src/output/output-triple');

// === Adapter (ADAPTER_PASS) ===
const { process: adapterProcess } = require('../../src/adapter/adapter');

// === Dispatcher as module (for adapter.process) ===
const dispatcher = require('../../src/pipeline/dispatcher');

// ============================================================
// Test Fixtures — simulate raw Telegram webhook updates
// ============================================================

/**
 * Create a fake Telegram update object.
 */
function makeTelegramUpdate(text, options = {}) {
  const chatId = options.chatId || -100123456789;
  const userId = options.userId || 111222333;
  return {
    update_id: options.updateId || Math.floor(Math.random() * 1e8),
    message: {
      message_id: options.messageId || Math.floor(Math.random() * 1e5),
      from: {
        id: userId,
        is_bot: false,
        first_name: options.firstName || 'TestUser',
        username: options.username || 'testuser',
      },
      chat: {
        id: chatId,
        type: options.chatType || 'group',
        title: options.chatTitle || 'Test Group',
      },
      date: Math.floor(Date.now() / 1000),
      text,
    },
  };
}

/**
 * Build a batch of manipulative messages (MB pattern) as Telegram updates.
 */
function buildMBUpdates(count = 35) {
  const templates = [
    'If you really cared about me, you would do this.',
    'A true friend wouldn\'t hesitate to help.',
    'After everything I\'ve done for you, this is how you repay me?',
    'Only selfish people refuse to share this kind of thing.',
    'If you don\'t support us, you\'re part of the problem.',
    'Real team players make sacrifices for the group.',
    'Your silence means you don\'t care about what\'s happening.',
    'Anyone who doesn\'t stand with us is against us.',
    'If you truly believed in our cause, you\'d prove it now.',
    'A real friend would never question this request.',
  ];
  return Array.from({ length: count }, (_, i) => {
    const text = templates[i % templates.length];
    return makeTelegramUpdate(text, {
      chatId: -100999888777,
      messageId: 1000 + i,
    });
  });
}

/**
 * Build benign messages — should NOT trigger alerts.
 */
function buildBenignUpdates(count = 5) {
  const texts = [
    'Hey everyone, meeting at 3pm today.',
    'Thanks for sharing the document!',
    'Has anyone tried the new restaurant nearby?',
    'Happy birthday! Hope you have a great day.',
    'The weather is really nice today.',
  ];
  return texts.slice(0, count).map((text, i) =>
    makeTelegramUpdate(text, { messageId: 2000 + i })
  );
}

// ============================================================
// Tests
// ============================================================

describe('Step 14: Telegram Full Pipeline E2E', () => {

  // ----------------------------------------------------------
  // Tier 0: Parse layer — Telegram → normalized
  // ----------------------------------------------------------
  describe('Tier 0: Telegram parse', () => {

    it('parses a standard group text message', () => {
      const update = makeTelegramUpdate('Hello group!', { chatType: 'group' });
      const parsed = parseTelegramUpdate(update);
      assert.ok(parsed, 'parseTelegramUpdate returned null');
      assert.equal(parsed.type, 'text');
      assert.equal(parsed.isGroup, true);
      assert.equal(parsed.text, 'Hello group!');
      assert.ok(parsed.chatId, 'missing chatId');
      assert.ok(parsed.userId, 'missing userId');
    });

    it('parses /start command', () => {
      const update = makeTelegramUpdate('/start', { chatType: 'private' });
      const parsed = parseTelegramUpdate(update);
      assert.ok(parsed, 'parseTelegramUpdate returned null');
      assert.equal(parsed.type, 'command');
      assert.equal(parsed.command, '/start');
    });

    it('returns null for empty update', () => {
      assert.equal(parseTelegramUpdate(null), null);
      assert.equal(parseTelegramUpdate({}), null);
    });

    it('returns null for photo-only message (no text)', () => {
      const update = {
        update_id: 1,
        message: {
          message_id: 1,
          from: { id: 1, is_bot: false, first_name: 'X' },
          chat: { id: -100, type: 'group' },
          date: Date.now(),
          photo: [{ file_id: 'abc' }],
          // no .text field
        },
      };
      const parsed = parseTelegramUpdate(update);
      // Should be null or type=unsupported
      if (parsed) {
        assert.equal(parsed.type, 'unsupported');
      }
    });
  });

  // ----------------------------------------------------------
  // Tier 1: Single message through pipeline
  // ----------------------------------------------------------
  describe('Tier 1: Single message pipeline', () => {

    it('benign message produces low/no detection', () => {
      const update = makeTelegramUpdate('Nice weather today!');
      const parsed = parseTelegramUpdate(update);
      assert.ok(parsed);

      const event = processMessage(parsed.text, {
        source: 'telegram',
        nodeId: `chat:${parsed.chatId}`,
        lang: 'en',
      });
      assert.ok(event, 'processMessage returned null');
      // Benign text should have low or zero ACRI
      const acri = event.channels?.push?.acri ?? event.acri ?? 0;
      assert.ok(acri < 0.5, `benign text ACRI too high: ${acri}`);
    });

    it('manipulative message produces valid event with gate_hits', () => {
      const update = makeTelegramUpdate(
        'If you really cared about me, you would never question this.'
      );
      const parsed = parseTelegramUpdate(update);
      assert.ok(parsed);

      const event = processMessage(parsed.text, {
        source: 'telegram',
        nodeId: `chat:${parsed.chatId}`,
        lang: 'en',
      });
      assert.ok(event, 'processMessage returned null');
      assert.ok(event.event_id, 'event should have event_id');
      assert.ok(event.layers, 'event should have layers');
      assert.ok(event.layers.layer1, 'event should have layers.layer1');
      // Three-Question Gate: single sentence hits 2/3 push + 1/3 vacuum
      // but may not reach pattern threshold — that's correct behavior.
      const l1 = event.layers.layer1;
      const totalHits = (l1.gate_hits?.push?.hit_count || 0) +
                        (l1.gate_hits?.vacuum?.hit_count || 0);
      assert.ok(totalHits > 0,
        'manipulative text should trigger at least some gate_hits');
    });
        });


  // ----------------------------------------------------------
  // Tier 2: Multi-message → Forecast → Output → formatReply
  // ----------------------------------------------------------
  describe('Tier 2: Full pipeline with forecast', () => {

    it('MB batch → forecast → alert → formatReply produces reply text', () => {
      const updates = buildMBUpdates(35);

      // Step 1: Parse + L1+L2
      const events = updates.map(u => {
        const parsed = parseTelegramUpdate(u);
        assert.ok(parsed, 'parse failed');
        return processMessage(parsed.text, {
          source: 'telegram',
          nodeId: `chat:${parsed.chatId}`,
          lang: 'en',
        });
      });
      assert.ok(events.length === 35, `expected 35 events, got ${events.length}`);

      // Step 2: L3 Forecast
      const aggregate = runForecast(events, 'MB', { windowDays: 7 });
      assert.ok(aggregate, 'runForecast returned null');
      assert.ok(aggregate.aggregate_id, 'missing aggregate_id');

      // Step 3: L4 Output
      const output = runOutput(
        { acri: aggregate.acri || 0.5, vri: 0, response_level: 3, patterns: ['MB'] },
        aggregate,
        { formatType: 'report', lang: 'en' }
      );
      assert.ok(output, 'runOutput returned null');
      assert.ok(output.alert, 'output missing alert');

      // Step 4: applyView — user_guard should strip scores
      const viewResult = applyView('user_guard', output);
      assert.ok(viewResult, 'applyView returned null');
      assert.equal(viewResult.view, 'user_guard');
      // user_guard should NOT expose raw acri/momentum scores
      assert.equal(viewResult.acri_score, undefined, 'user_guard should not expose acri_score');
      assert.equal(viewResult.momentum_score, undefined, 'user_guard should not expose momentum_score');

      // Step 5: formatReply — Telegram text output
      const reply = formatReply(output);
      // reply could be null if effective_level <= 1 (Silent)
      if (reply) {
        assert.equal(typeof reply, 'string', 'reply should be string');
        assert.ok(reply.includes('Lumen'), 'reply should mention Lumen');
        // SAFE mode marker must be present (M88 V1)
        assert.ok(
          reply.includes('假設生成') || reply.includes('低信心'),
          'reply must contain SAFE mode marker'
        );
      }
    });

    it('benign batch → forecast → no alert reply (Silent or null)', () => {
      const updates = buildBenignUpdates(5);

      const events = updates.map(u => {
        const parsed = parseTelegramUpdate(u);
        return processMessage(parsed.text, {
          source: 'telegram',
          nodeId: `chat:${parsed.chatId}`,
          lang: 'en',
        });
      });

      // Forecast on benign — should have minimal data
      const aggregate = runForecast(events, 'MB', { windowDays: 7 });
      assert.ok(aggregate, 'aggregate should exist');

      // If we force an output with low response_level
      const output = runOutput(
        { acri: 0, vri: 0, response_level: 1, patterns: [] },
        aggregate,
        { formatType: 'report', lang: 'en' }
      );

      // formatReply should return null for level ≤ 1 (Silent Audit Trail)
      const reply = formatReply(output);
      assert.equal(reply, null, 'benign batch should not produce a visible reply');
    });
  });

  // ----------------------------------------------------------
  // Tier 3: Pipeline convenience function
  // ----------------------------------------------------------
  describe('Tier 3: dispatcher.pipeline() convenience', () => {

    it('single manipulative text through pipeline() returns structured output', () => {
      const result = pipeline('After everything I\'ve done, you owe me this.', {
        source: 'telegram',
        nodeId: 'chat:-100999',
        lang: 'en',
      });
      assert.ok(result, 'pipeline() returned null');
      // pipeline should return at minimum the L1+L2 event
      // exact shape depends on implementation — verify it's an object
      assert.equal(typeof result, 'object');
    });
  });

  // ----------------------------------------------------------
  // Tier 4: Edge cases
  // ----------------------------------------------------------
  describe('Tier 4: Edge cases', () => {

    it('empty string message is rejected by evaluator', () => {
      const update = makeTelegramUpdate('');
      const parsed = parseTelegramUpdate(update);
      // parseTelegramUpdate may return null or parsed with empty text
      if (parsed && parsed.text === '') {
        // evaluator should throw for empty input — this is correct behavior
        assert.throws(
          () => processMessage('', {
            source: 'telegram',
            nodeId: 'chat:-100',
            lang: 'en',
          }),
          { message: /non-empty string/i },
          'evaluator should reject empty string'
        );
      }
    });

    it('very long message (10k chars) does not crash', () => {
      const longText = 'If you really cared about me. '.repeat(350); // ~10.5k chars
      const update = makeTelegramUpdate(longText);
      const parsed = parseTelegramUpdate(update);
      assert.ok(parsed);

      const event = processMessage(parsed.text, {
        source: 'telegram',
        nodeId: 'chat:-100',
        lang: 'en',
      });
      assert.ok(event, 'processMessage should handle long text');
    });

    it('Chinese text message parses and processes', () => {
      const update = makeTelegramUpdate('你不幫我就是不在乎我，所有真正的朋友都會這樣做。');
      const parsed = parseTelegramUpdate(update);
      assert.ok(parsed);
      assert.equal(parsed.text, '你不幫我就是不在乎我，所有真正的朋友都會這樣做。');

      const event = processMessage(parsed.text, {
        source: 'telegram',
        nodeId: 'chat:-100',
        lang: 'zh',
      });
      assert.ok(event, 'processMessage should handle Chinese text');
    });

    it('edited_message is also processed', () => {
      const update = {
        update_id: 999,
        edited_message: {
          message_id: 42,
          from: { id: 111, is_bot: false, first_name: 'Editor' },
          chat: { id: -100, type: 'group', title: 'Test' },
          date: Math.floor(Date.now() / 1000),
          edit_date: Math.floor(Date.now() / 1000),
          text: 'You owe me everything after all I did.',
        },
      };
      const parsed = parseTelegramUpdate(update);
      assert.ok(parsed, 'edited_message should be parsed');
      assert.equal(parsed.text, 'You owe me everything after all I did.');
    });
  });

  // ----------------------------------------------------------
  // Tier 5: S11-E2E-02 Patch — Violation Fixture (raw_text leak)
  // M90-D02: Node-02 suggestion #1 — ALL members supported
  // ----------------------------------------------------------
  describe('Tier 5: Violation fixture — raw_text leak guard', () => {

    it('formatReply output never contains raw input text', () => {
      const rawInput = 'If you really cared about me, you would do this for me right now.';
      const result = pipeline(rawInput, {
        source: 'telegram',
        nodeId: 'chat:-100violation',
        lang: 'en',
      });

      const reply = formatReply(result.output);
      if (reply) {
        // The reply must NEVER contain the raw input text
        assert.ok(
          !reply.includes(rawInput),
          'formatReply MUST NOT leak raw input text into Telegram reply'
        );
        // Also check for substrings (partial leak)
        assert.ok(
          !reply.includes('If you really cared about me'),
          'formatReply MUST NOT leak partial raw text'
        );
      }
    });

    it('user_guard view strips all deny-listed fields', () => {
      const sensitiveOutput = {
        alert: {
          effective_level: 3,
          pattern: 'DM',
          channels: { push: { score: 0.5 } },
          requires_handoff: false,
        },
        output: { format: 'report' },
        // Inject fields that should be stripped
        raw_text: 'SECRET: this should never appear',
        plain_text_payload: 'also secret',
        user_real_name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
      };

      const viewResult = applyView('user_guard', sensitiveOutput);
      if (viewResult) {
        const resultStr = JSON.stringify(viewResult);
        assert.ok(!resultStr.includes('SECRET'), 'raw_text must be stripped');
        assert.ok(!resultStr.includes('also secret'), 'plain_text_payload must be stripped');
        assert.ok(!resultStr.includes('John Doe'), 'user_real_name must be stripped');
        assert.ok(!resultStr.includes('john@example.com'), 'email must be stripped');
        assert.ok(!resultStr.includes('+1234567890'), 'phone must be stripped');
      }
    });

    it('L4 export envelope never contains raw_text', () => {
      const result = pipeline(
        'After everything I did for you, this is how you repay me?',
        { source: 'telegram', nodeId: 'chat:-100export', lang: 'en' }
      );

      const l4Export = buildL4Export(result, { tier: 'TIER_0' });
      const exportStr = JSON.stringify(l4Export);
      assert.ok(!exportStr.includes('After everything I did for you'),
        'L4 export MUST NOT contain raw input text');
      assert.strictEqual(l4Export.contains_raw_text, false,
        'L4 export must flag contains_raw_text=false');
    });
  });

  // ----------------------------------------------------------
  // Tier 6: S11-E2E-02 Patch — access_log ADAPTER_PASS
  // M90-D02: Node-02 suggestion #4 — Node-01 + Node-05 + Node-06
  // ----------------------------------------------------------
  describe('Tier 6: access_log entry — ADAPTER_PASS verification', () => {

    it('adapter.process() writes ADAPTER_PASS to accessLog', async () => {
      const input = {
        text: 'If you really cared, you would help me.',
        domain: 'C_PERSONAL',
        request_id: 'test_adapter_pass_001',
      };
      const accessLog = [];
      await adapterProcess(input, dispatcher, { accessLog });

      // Find ADAPTER_PASS entry
      const passEntry = accessLog.find(e => e.action === 'ADAPTER_PASS');
      assert.ok(passEntry, 'accessLog should contain ADAPTER_PASS entry');
      assert.ok(passEntry.timestamp, 'ADAPTER_PASS entry should have timestamp');
    });

    it('buildAccessLog produces valid schema from accessLog entries', () => {
      const mockAccessLog = [
        {
          timestamp: new Date().toISOString(),
          action: 'ADAPTER_PASS',
          text_length: 42,
          source: 'telegram',
        },
      ];
      const log = buildAccessLog(mockAccessLog, { request_id: 'test_schema_001' });
      assert.strictEqual(log.schema_version, 'access-log-v0.1');
      assert.strictEqual(log.request_id, 'test_schema_001');
      assert.ok(log.entries.length >= 1);
      assert.strictEqual(log.entries[0].action, 'ADAPTER_PASS');
    });

    it('access_log entry does not contain raw text', async () => {
      const input = {
        text: 'Super secret manipulation text that must not leak.',
        domain: 'C_PERSONAL',
        request_id: 'test_no_leak_001',
      };
      const accessLog = [];
      await adapterProcess(input, dispatcher, { accessLog });

      const logStr = JSON.stringify(accessLog);
      assert.ok(!logStr.includes('Super secret manipulation'),
        'access_log MUST NOT contain raw text');
    });
  });

  // ----------------------------------------------------------
  // Tier 7: S11-E2E-02 Patch — processing_time_ms
  // M90-D02: Node-02 suggestion #3 — record, don't assert threshold
  // Node-05: "先記錄，門檻下一輪鎖"
  // ----------------------------------------------------------
  describe('Tier 7: processing_time_ms recording', () => {

    it('pipeline() execution time is measurable and under 140ms budget', () => {
      const text = 'If you don\'t support us, you\'re part of the problem.';
      const start = performance.now();
      const result = pipeline(text, {
        source: 'telegram',
        nodeId: 'chat:-100perf',
        lang: 'en',
      });
      const elapsed = performance.now() - start;

      assert.ok(result, 'pipeline should return result');
      // Record the timing (this is the "先記錄" part)
      console.log(`  [processing_time] single_msg: ${elapsed.toFixed(3)}ms`);
      // M88 benchmark: P95 = 0.762ms, budget = 140ms
      // We record but do NOT assert hard threshold (M90 decision: 門檻後鎖)
      assert.ok(elapsed < 140, `pipeline exceeded 140ms budget: ${elapsed.toFixed(3)}ms`);
    });

    it('multi-message pipeline timing (35 messages)', () => {
      const updates = buildMBUpdates(35);
      const start = performance.now();

      const events = updates.map(u => {
        const parsed = parseTelegramUpdate(u);
        return processMessage(parsed.text, {
          source: 'telegram',
          nodeId: `chat:${parsed.chatId}`,
          lang: 'en',
        });
      });
      const aggregate = runForecast(events, 'MB', { windowDays: 7 });
      runOutput(
        { acri: 0.5, vri: 0, response_level: 3, patterns: ['MB'] },
        aggregate,
        { formatType: 'report', lang: 'en' }
      );

      const elapsed = performance.now() - start;
      const perMsg = elapsed / 35;

      console.log(`  [processing_time] 35_msg_batch: total=${elapsed.toFixed(3)}ms per_msg=${perMsg.toFixed(3)}ms`);
      // Record only — no hard assert on per-message time
      assert.ok(elapsed < 5000, `35-message batch exceeded 5s safety limit: ${elapsed.toFixed(3)}ms`);
    });

    it('evaluateLongText timing for accumulated text', () => {
      const { evaluateLongText } = require('../../core/evaluator');
      const mergedText = [
        'We all decided this is the best approach.',
        'Everyone in the team agrees with this direction.',
        'I noticed you are the only one who has not confirmed yet.',
        'The whole group is waiting for your response.',
        'We need unity on this, not individual opinions.',
        'If you cannot get on board, maybe this is not the right team for you.',
      ].join('\n');

      const start = performance.now();
      const result = evaluateLongText(mergedText);
      const elapsed = performance.now() - start;

      console.log(`  [processing_time] evaluateLongText (6-msg merge): ${elapsed.toFixed(3)}ms`);
      assert.ok(result, 'evaluateLongText should return result');
      assert.ok(elapsed < 140, `evaluateLongText exceeded 140ms: ${elapsed.toFixed(3)}ms`);
    });
  });

  // ----------------------------------------------------------
  // Tier 8: Node-02 Review Supplements (c180 review)
  // ----------------------------------------------------------
  describe('Tier 8: Node-02 review supplements', () => {

    it('T8.1: Chinese violation fixture — raw_text leak guard (multi-lang)', () => {
      const rawInput = '如果你真心在乎我，你現在就會這麼做。';
      const result = pipeline(rawInput, {
        source: 'telegram',
        nodeId: 'chat:-100violation_cn',
        lang: 'zh',
      });

      const reply = formatReply(result.output);
      if (reply) {
        assert.ok(!reply.includes(rawInput), 'formatReply MUST NOT leak Chinese raw text');
        assert.ok(!reply.includes('如果你真心'), 'formatReply MUST NOT leak partial Chinese raw text');
      }

      const l4Export = buildL4Export(result, { tier: 'TIER_0' });
      const exportStr = JSON.stringify(l4Export);
      assert.ok(!exportStr.includes(rawInput), 'L4 export MUST NOT contain Chinese raw text');
    });

    it('T8.2: super long text (>2000 chars) does not exceed budget or crash', () => {
      const longText = 'If you really cared about me you would do this. '.repeat(50); // ~2400 chars
      const start = performance.now();
      const result = pipeline(longText, {
        source: 'telegram',
        nodeId: 'chat:-100stress',
        lang: 'en',
      });
      const elapsed = performance.now() - start;

      console.log(`  [processing_time] super_long (${longText.length} chars): ${elapsed.toFixed(3)}ms`);
      assert.ok(result, 'pipeline should not crash on super long text');
      assert.ok(elapsed < 140, `super long text exceeded 140ms: ${elapsed.toFixed(3)}ms`);
    });
  });


  // ----------------------------------------------------------
  // S11-E2E-02-supplement: Node-02-Bing Tier 5-7 Extra
  // Delivered: M91 承諾 48h window
  // Owner: Node-02 (draft) → Node-01 (wiring) → c195
  // ----------------------------------------------------------
  describe('S11-E2E-02-supplement: Node-02 Tier 5-7 Extra', () => {

    it('Tier5 Extra: Chinese violation fixture (zh-Hant locale) must not leak raw_text', () => {
      const rawInput = '如果你真心在乎我，你現在就會這麼做。';
      const result = pipeline(rawInput, {
        source: 'telegram',
        nodeId: 'chat:-100violation_cn',
        lang: 'zh-Hant',
      });

      const reply = formatReply(result.output);
      if (reply) {
        assert.ok(!reply.includes(rawInput), 'formatReply MUST NOT leak raw input text (Chinese zh-Hant)');
      }
      const l4Export = buildL4Export(result, { tier: 'TIER_0' });
      assert.ok(!JSON.stringify(l4Export).includes(rawInput), 'L4 export MUST NOT contain Chinese raw input text');
    });

    it('Tier6 Extra: edited_message should produce access_log entry without raw text', async () => {
      const input = {
        text: 'Edited: I changed my mind.',
        domain: 'C_PUBLIC',
        request_id: 'test_edited_msg_001',
        meta: { edited: true },
      };
      const accessLog = [];
      await adapterProcess(input, dispatcher, { accessLog });

      assert.ok(accessLog.length > 0, 'accessLog should have entries for edited message');
      assert.ok(!JSON.stringify(accessLog).includes('Edited: I changed my mind.'),
        'access_log MUST NOT contain raw text from edited message');
    });

    it('Tier7 Extra: pure repetition stress (2500 chars) under budget and stable', () => {
      const longText = 'A'.repeat(2500);
      const start = performance.now();
      const result = pipeline(longText, { source: 'telegram', nodeId: 'chat:-100long', lang: 'en' });
      const elapsed = performance.now() - start;

      console.log(`  [processing_time] pure_repeat_stress (${longText.length} chars): ${elapsed.toFixed(3)}ms`);
      assert.ok(result, 'pipeline should not crash on pure repetition stress');
      assert.ok(elapsed < 140, `processing_time_ms too high: ${elapsed.toFixed(3)}ms`);
    });

  });
});
