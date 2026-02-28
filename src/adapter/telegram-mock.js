// src/adapter/telegram-mock.js
// AC-1: Telegram Mock — simulates Telegram Bot API message format
// Used for testing adapter → dispatcher pipeline without real Telegram.
//
// 設計：Node-01 (Architect)
// 日期：2026-02-25
//
// This mock generates messages in Telegram Bot API format,
// which adapter.process() normalizes into ui-request before
// handing off to dispatcher.

'use strict';

/**
 * Create a mock Telegram message object.
 * Mirrors Telegram Bot API's Message structure (simplified).
 *
 * @param {string} text - Message text
 * @param {object} [options] - Optional overrides
 * @param {number} [options.chat_id] - Telegram chat ID
 * @param {number} [options.from_id] - Sender user ID
 * @param {number} [options.message_id] - Message ID
 * @param {string} [options.scenario] - Lumen scenario (default: 'monitoring_brief')
 * @param {string} [options.domain] - Lumen domain (default: 'C_PERSONAL')
 * @param {string} [options.language] - Language code
 * @returns {object} Telegram-format message for adapter.process()
 */
function createTelegramMessage(text, options = {}) {
  const {
    chat_id = 100001,
    from_id = 200001,
    message_id = Math.floor(Date.now() / 1000),
    scenario = 'monitoring_brief',
    domain = 'C_PERSONAL',
    language
  } = options;

  return {
    // Lumen fields (adapter reads these)
    request_id: `tg_${chat_id}_${message_id}`,
    domain,
    scenario,
    tier: 0,
    source: { type: 'telegram_user_message' },
    content: { text },
    conversation_id: `tg_${chat_id}`,
    language,

    // Telegram-specific metadata (adapter extracts for traceability)
    chat_id,
    from_id,
    message_id
  };
}

/**
 * Create a series of mock Telegram messages (for multi-turn testing).
 *
 * @param {string[]} texts - Array of message texts
 * @param {object} [options] - Shared options (same chat_id, etc.)
 * @returns {object[]} Array of Telegram-format messages
 */
function createConversation(texts, options = {}) {
  const chat_id = options.chat_id || 100001;
  const from_id = options.from_id || 200001;
  const baseTime = Math.floor(Date.now() / 1000);

  return texts.map((text, i) => createTelegramMessage(text, {
    ...options,
    chat_id,
    from_id,
    message_id: baseTime + i
  }));
}

module.exports = {
  createTelegramMessage,
  createConversation
};
