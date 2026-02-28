// src/adapter/telegram-bot.js
// Step 13: Telegram Bot Adapter — real webhook handler
//
// Receives Telegram Bot API webhook updates, normalizes to
// ui-request format, runs through adapter.process() → dispatcher,
// and returns a response payload for Telegram sendMessage.
//
// This is the first real "node" — Scenario C (Personal mode).
//
// Flow:
//   Telegram webhook POST → parseTelegramUpdate() → adapter.process(msg, dispatcher)
//     → generateOutputTriple() → formatTelegramReply() → sendMessage
//
// 設計+實作：Node-01 (Architect)
// 日期：2026-02-25
// Sprint 10 — Step 13: First Node (Telegram)

'use strict';

const { process: adapterProcess } = require('./adapter');
const { generateOutputTriple } = require('../output/output-triple');

// ─── Telegram Update Parser ─────────────────────────────────────────

/**
 * Parse a raw Telegram Bot API Update object into adapter-compatible format.
 * Handles: text messages, edited messages, channel posts.
 * Ignores: photos, stickers, voice, callbacks (future).
 *
 * @param {object} update - Raw Telegram Update object from webhook
 * @returns {{ parsed: object|null, skip_reason: string|null }}
 */
function parseTelegramUpdate(update) {
  if (!update) {
    return { parsed: null, skip_reason: 'empty_update' };
  }

  // Extract message from various update types
  const message = update.message
    || update.edited_message
    || update.channel_post
    || update.edited_channel_post;

  if (!message) {
    return { parsed: null, skip_reason: 'no_message_field' };
  }

  // Only process text messages
  if (!message.text || typeof message.text !== 'string') {
    return { parsed: null, skip_reason: 'non_text_message' };
  }

  // Skip bot commands (e.g. /start, /help)
  if (message.text.startsWith('/')) {
    return { parsed: null, skip_reason: 'bot_command' };
  }

  const chat = message.chat || {};
  const from = message.from || {};

  const parsed = {
    // Lumen adapter fields
    request_id: `tg_${chat.id}_${message.message_id}`,
    domain: 'C_PERSONAL',
    scenario: 'monitoring_brief',
    tier: 0,
    source: { type: 'telegram_user_message' },
    content: { text: message.text },
    conversation_id: `tg_${chat.id}`,
    language: from.language_code || undefined,

    // Telegram metadata (for traceability, not detection)
    _telegram: {
      update_id: update.update_id,
      message_id: message.message_id,
      chat_id: chat.id,
      chat_type: chat.type, // 'private', 'group', 'supergroup'
      from_id: from.id,
      from_is_bot: from.is_bot || false,
      date: message.date
    }
  };

  return { parsed, skip_reason: null };
}

// ─── Telegram Reply Formatter ────────────────────────────────────────

/**
 * Format pipeline result into Telegram sendMessage payload.
 * Follows L4 UI Constraints v0.2 — structural observation, not verdict.
 *
 * @param {object} triple - Output triple from generateOutputTriple()
 * @param {number} chatId - Telegram chat ID to reply to
 * @param {object} options
 * @returns {object} Telegram sendMessage payload
 */
function formatTelegramReply(triple, chatId, options = {}) {
  const { language = 'en' } = options;
  const exp = triple.l4_export;
  const signals = exp.signals || {};

  // No signal detected — don't spam the user
  if (signals.acri_value === 0 && (!signals.patterns || signals.patterns.length === 0)) {
    return null; // Silent — no reply needed
  }

  // Signal detected — build user-facing message
  const band = signals.acri_band || 'Low';
  const patterns = (signals.patterns || []).join(', ') || 'structural signal';

  // L4-UI-C2: No precise probabilities for end users
  // L4-UI-C3: Non-alarmist tone
  const messages = {
    en: {
      low: `🔵 Observation: A mild structural pattern (${patterns}) was noted. No immediate concern, but stay aware of communication dynamics.`,
      medium: `🟡 Observation: A moderate structural pattern (${patterns}) was detected. Consider whether the conversation feels balanced and respectful.`,
      high: `🟠 Observation: A strong structural pattern (${patterns}) was detected. You may want to pause and reflect on the dynamics of this conversation.`
    },
    zh: {
      low: `🔵 觀察：偵測到輕微的結構性模式（${patterns}）。目前無需擔心，但請留意溝通動態。`,
      medium: `🟡 觀察：偵測到中等強度的結構性模式（${patterns}）。請考慮這段對話是否感覺平衡和尊重。`,
      high: `🟠 觀察：偵測到較強的結構性模式（${patterns}）。您可能需要暫停並反思這段對話的動態。`
    }
  };

  const lang = (language || 'en').startsWith('zh') ? 'zh' : 'en';
  const level = band === 'High' ? 'high' : band === 'Medium' ? 'medium' : 'low';
  const text = messages[lang][level];

  // Append disclaimer (L4 requirement)
  const disclaimer = lang === 'zh'
    ? '\n\n⚠️ 此為結構觀察，非事實判定。請自行評估。'
    : '\n\n⚠️ This is a structural observation, not a factual verdict. Please assess for yourself.';

  return {
    method: 'sendMessage',
    chat_id: chatId,
    text: text + disclaimer,
    parse_mode: 'HTML',
    // Don't reply to specific message — post as standalone observation
    disable_notification: level === 'low'
  };
}

// ─── Webhook Handler ─────────────────────────────────────────────────

/**
 * Main webhook handler — receives Telegram update, runs full pipeline.
 *
 * @param {object} update - Raw Telegram Bot API Update
 * @param {object} dispatcher - Lumen dispatcher module
 * @param {object} options
 * @param {function} [options.onTriple] - Callback for output triple (for logging/audit)
 * @param {function} [options.onSkip] - Callback when message is skipped
 * @returns {Promise<object|null>} Telegram sendMessage payload, or null if no reply
 */
async function handleWebhook(update, dispatcher, options = {}) {
  const { onTriple, onSkip } = options;

  // Step 1: Parse Telegram update
  const { parsed, skip_reason } = parseTelegramUpdate(update);

  if (!parsed) {
    if (onSkip) onSkip({ update_id: update?.update_id, skip_reason });
    return null;
  }

  // Step 2: Run through adapter → dispatcher pipeline
  const accessLog = [];
  const pipelineResult = await adapterProcess(parsed, dispatcher, { accessLog });

  // Step 3: Check for adapter errors
  if (pipelineResult.error) {
    if (onSkip) onSkip({
      update_id: update.update_id,
      skip_reason: `adapter_error: ${pipelineResult.reason}`
    });
    return null;
  }

  // Step 4: Generate output triple (for audit trail)
  const triple = generateOutputTriple(pipelineResult, accessLog, { tier: 'TIER_0' });

  if (onTriple) onTriple(triple);

  // Step 5: Format reply for Telegram
  const chatId = parsed._telegram.chat_id;
  const reply = formatTelegramReply(triple, chatId, {
    language: parsed.language
  });

  return reply;
}

// ─── Bot Command Handlers ────────────────────────────────────────────

/**
 * Handle /start command
 * @param {number} chatId
 * @param {string} language
 * @returns {object} Telegram sendMessage payload
 */
function handleStart(chatId, language = 'en') {
  const lang = (language || 'en').startsWith('zh') ? 'zh' : 'en';
  const text = lang === 'zh'
    ? '🛡️ Lumen ISSP 已啟動。\n\n我會觀察群組中的溝通結構。我不讀取內容含義，只偵測操控性結構模式。\n\n指令：\n/status — 查看狀態\n/help — 使用說明\n/stop — 停止觀察'
    : '🛡️ Lumen ISSP activated.\n\nI observe communication structures in this group. I don\'t read content meaning — I detect structural manipulation patterns.\n\nCommands:\n/status — Check status\n/help — Usage guide\n/stop — Stop observation';

  return {
    method: 'sendMessage',
    chat_id: chatId,
    text,
    parse_mode: 'HTML'
  };
}

/**
 * Handle /status command
 * @param {number} chatId
 * @param {object} stats - Runtime stats
 * @returns {object} Telegram sendMessage payload
 */
function handleStatus(chatId, stats = {}) {
  const {
    messages_processed = 0,
    signals_detected = 0,
    uptime_hours = 0
  } = stats;

  return {
    method: 'sendMessage',
    chat_id: chatId,
    text: `🛡️ Lumen Status\n\n📊 Messages processed: ${messages_processed}\n🔍 Signals detected: ${signals_detected}\n⏱️ Uptime: ${uptime_hours}h\n\nEngine: adapter-v0.2.0\nProtocol: ISSP v0.1`,
    parse_mode: 'HTML'
  };
}

module.exports = {
  parseTelegramUpdate,
  formatTelegramReply,
  handleWebhook,
  handleStart,
  handleStatus
};
