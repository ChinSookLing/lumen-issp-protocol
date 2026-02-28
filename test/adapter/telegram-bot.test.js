/**
 * telegram-bot.test.js
 * Step 13: Telegram Bot Adapter — webhook + formatter + commands
 *
 * Tests the real Telegram adapter (not mock).
 * Covers: parseTelegramUpdate, formatTelegramReply, handleWebhook,
 *         bot commands (/start, /status), skip logic.
 *
 * 設計+實作：Node-01 (Architect)
 * 日期：2026-02-25
 */

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  parseTelegramUpdate,
  formatTelegramReply,
  handleWebhook,
  handleStart,
  handleStatus
} = require('../../src/adapter/telegram-bot');

const dispatcher = require('../../src/pipeline/dispatcher');

// ─── Helper: build Telegram Update object ────────────────────────────

function buildUpdate(text, overrides = {}) {
  return {
    update_id: overrides.update_id || 123456789,
    message: {
      message_id: overrides.message_id || 42,
      from: {
        id: overrides.from_id || 200001,
        is_bot: false,
        language_code: overrides.language_code || 'en'
      },
      chat: {
        id: overrides.chat_id || -100001,
        type: overrides.chat_type || 'group'
      },
      date: overrides.date || Math.floor(Date.now() / 1000),
      text
    }
  };
}

// ═════════════════════════════════════════════════════════════════════
// parseTelegramUpdate
// ═════════════════════════════════════════════════════════════════════

describe('Telegram Bot: parseTelegramUpdate', () => {

  it('TG-P01: parses valid text message', () => {
    const update = buildUpdate('Hello world');
    const { parsed, skip_reason } = parseTelegramUpdate(update);
    assert.ok(parsed);
    assert.equal(skip_reason, null);
    assert.equal(parsed.content.text, 'Hello world');
    assert.equal(parsed.source.type, 'telegram_user_message');
    assert.equal(parsed.domain, 'C_PERSONAL');
  });

  it('TG-P02: extracts conversation_id from chat_id', () => {
    const update = buildUpdate('test', { chat_id: -999 });
    const { parsed } = parseTelegramUpdate(update);
    assert.equal(parsed.conversation_id, 'tg_-999');
  });

  it('TG-P03: extracts language_code', () => {
    const update = buildUpdate('test', { language_code: 'zh-hans' });
    const { parsed } = parseTelegramUpdate(update);
    assert.equal(parsed.language, 'zh-hans');
  });

  it('TG-P04: preserves Telegram metadata in _telegram', () => {
    const update = buildUpdate('test', { chat_id: -100, from_id: 200, message_id: 42 });
    const { parsed } = parseTelegramUpdate(update);
    assert.equal(parsed._telegram.chat_id, -100);
    assert.equal(parsed._telegram.from_id, 200);
    assert.equal(parsed._telegram.message_id, 42);
  });

  it('TG-P05: skips null update', () => {
    const { parsed, skip_reason } = parseTelegramUpdate(null);
    assert.equal(parsed, null);
    assert.equal(skip_reason, 'empty_update');
  });

  it('TG-P06: skips update with no message', () => {
    const { parsed, skip_reason } = parseTelegramUpdate({ update_id: 1 });
    assert.equal(parsed, null);
    assert.equal(skip_reason, 'no_message_field');
  });

  it('TG-P07: skips non-text message (photo/sticker)', () => {
    const update = {
      update_id: 1,
      message: { message_id: 1, chat: { id: 1 }, from: { id: 1 }, photo: [] }
    };
    const { parsed, skip_reason } = parseTelegramUpdate(update);
    assert.equal(parsed, null);
    assert.equal(skip_reason, 'non_text_message');
  });

  it('TG-P08: skips bot commands (/start, /help)', () => {
    const update = buildUpdate('/start');
    const { parsed, skip_reason } = parseTelegramUpdate(update);
    assert.equal(parsed, null);
    assert.equal(skip_reason, 'bot_command');
  });

  it('TG-P09: handles edited_message', () => {
    const update = {
      update_id: 1,
      edited_message: {
        message_id: 1,
        chat: { id: -100, type: 'group' },
        from: { id: 200, language_code: 'en' },
        date: Math.floor(Date.now() / 1000),
        text: 'edited text'
      }
    };
    const { parsed } = parseTelegramUpdate(update);
    assert.ok(parsed);
    assert.equal(parsed.content.text, 'edited text');
  });

  it('TG-P10: handles channel_post', () => {
    const update = {
      update_id: 1,
      channel_post: {
        message_id: 1,
        chat: { id: -100, type: 'channel' },
        from: { id: 200 },
        date: Math.floor(Date.now() / 1000),
        text: 'channel text'
      }
    };
    const { parsed } = parseTelegramUpdate(update);
    assert.ok(parsed);
    assert.equal(parsed.content.text, 'channel text');
  });
});

// ═════════════════════════════════════════════════════════════════════
// formatTelegramReply
// ═════════════════════════════════════════════════════════════════════

describe('Telegram Bot: formatTelegramReply', () => {

  it('TG-F01: returns null for no-signal (silent mode)', () => {
    const triple = {
      l4_export: { signals: { acri_value: 0, acri_band: 'Low', patterns: [] } }
    };
    const reply = formatTelegramReply(triple, -100);
    assert.equal(reply, null);
  });

  it('TG-F02: formats low-band reply in English', () => {
    const triple = {
      l4_export: { signals: { acri_value: 0.2, acri_band: 'Low', patterns: ['EP'] } }
    };
    const reply = formatTelegramReply(triple, -100, { language: 'en' });
    assert.ok(reply);
    assert.equal(reply.method, 'sendMessage');
    assert.equal(reply.chat_id, -100);
    assert.ok(reply.text.includes('🔵'));
    assert.ok(reply.text.includes('EP'));
    assert.ok(reply.text.includes('structural observation'));
  });

  it('TG-F03: formats medium-band reply', () => {
    const triple = {
      l4_export: { signals: { acri_value: 0.5, acri_band: 'Medium', patterns: ['FC'] } }
    };
    const reply = formatTelegramReply(triple, -100, { language: 'en' });
    assert.ok(reply.text.includes('🟡'));
  });

  it('TG-F04: formats high-band reply', () => {
    const triple = {
      l4_export: { signals: { acri_value: 0.8, acri_band: 'High', patterns: ['MB'] } }
    };
    const reply = formatTelegramReply(triple, -100, { language: 'en' });
    assert.ok(reply.text.includes('🟠'));
  });

  it('TG-F05: formats reply in Chinese', () => {
    const triple = {
      l4_export: { signals: { acri_value: 0.5, acri_band: 'Medium', patterns: ['DM'] } }
    };
    const reply = formatTelegramReply(triple, -100, { language: 'zh-hant' });
    assert.ok(reply.text.includes('觀察'));
    assert.ok(reply.text.includes('結構觀察'));
  });

  it('TG-F06: always includes disclaimer', () => {
    const triple = {
      l4_export: { signals: { acri_value: 0.5, acri_band: 'Medium', patterns: ['FC'] } }
    };
    const reply = formatTelegramReply(triple, -100, { language: 'en' });
    assert.ok(reply.text.includes('not a factual verdict'));
  });

  it('TG-F07: low-band disables notification', () => {
    const triple = {
      l4_export: { signals: { acri_value: 0.2, acri_band: 'Low', patterns: ['EA'] } }
    };
    const reply = formatTelegramReply(triple, -100);
    assert.equal(reply.disable_notification, true);
  });
});

// ═════════════════════════════════════════════════════════════════════
// handleWebhook — full pipeline integration
// ═════════════════════════════════════════════════════════════════════

describe('Telegram Bot: handleWebhook (full pipeline)', () => {

  it('TG-W01: benign message returns null (silent)', async () => {
    const update = buildUpdate('Hello, nice weather today!');
    const reply = await handleWebhook(update, dispatcher);
    // Benign message should not trigger a reply
    assert.equal(reply, null);
  });

  it('TG-W02: skipped update calls onSkip', async () => {
    let skipData = null;
    await handleWebhook(null, dispatcher, {
      onSkip: (data) => { skipData = data; }
    });
    assert.ok(skipData);
    assert.equal(skipData.skip_reason, 'empty_update');
  });

  it('TG-W03: bot command is skipped', async () => {
    let skipData = null;
    const update = buildUpdate('/start');
    await handleWebhook(update, dispatcher, {
      onSkip: (data) => { skipData = data; }
    });
    assert.ok(skipData);
    assert.equal(skipData.skip_reason, 'bot_command');
  });

  it('TG-W04: pipeline runs and calls onTriple', async () => {
    let tripleData = null;
    const update = buildUpdate('If you really loved me you would do what I say');
    await handleWebhook(update, dispatcher, {
      onTriple: (data) => { tripleData = data; }
    });
    assert.ok(tripleData, 'onTriple must be called');
    assert.ok(tripleData.manifest);
    assert.ok(tripleData.access_log);
    assert.ok(tripleData.l4_export);
  });

  it('TG-W05: pipeline result has no raw text in l4_export', async () => {
    const inputText = 'You have no choice, follow my orders now';
    let tripleData = null;
    const update = buildUpdate(inputText);
    await handleWebhook(update, dispatcher, {
      onTriple: (data) => { tripleData = data; }
    });
    assert.ok(tripleData);
    const json = JSON.stringify(tripleData.l4_export);
    assert.ok(!json.includes(inputText), '§2.2: l4_export must not contain raw text');
  });
});

// ═════════════════════════════════════════════════════════════════════
// Bot Commands
// ═════════════════════════════════════════════════════════════════════

describe('Telegram Bot: Commands', () => {

  it('TG-C01: /start returns welcome message (English)', () => {
    const reply = handleStart(-100, 'en');
    assert.equal(reply.method, 'sendMessage');
    assert.equal(reply.chat_id, -100);
    assert.ok(reply.text.includes('Lumen ISSP'));
    assert.ok(reply.text.includes('/status'));
  });

  it('TG-C02: /start returns welcome message (Chinese)', () => {
    const reply = handleStart(-100, 'zh-hant');
    assert.ok(reply.text.includes('Lumen ISSP'));
    assert.ok(reply.text.includes('觀察'));
  });

  it('TG-C03: /status returns stats', () => {
    const reply = handleStatus(-100, {
      messages_processed: 42,
      signals_detected: 3,
      uptime_hours: 12
    });
    assert.ok(reply.text.includes('42'));
    assert.ok(reply.text.includes('3'));
    assert.ok(reply.text.includes('ISSP'));
  });
});
