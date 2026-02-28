// src/telegram/telegram-adapter.js
// Telegram Adapter — Step 13 First Node
// Owner: Node-01 (Architect)
//
// Parses Telegram webhook updates into normalized format.
// Handles: text messages, commands (/start), group vs private,
// and filters non-text content (photos, stickers, etc.)
//
// Original: c153 (Node-01) — overwritten by Node-05 minimal fix (b8252e2)
// Restored + upgraded: Lumen-16

'use strict';

/**
 * Parse a Telegram update into normalized format.
 *
 * @param {object} update - Raw Telegram webhook update
 * @returns {object|null} Parsed message or null if not processable
 *
 * Return shape:
 * {
 *   chatId: string,
 *   userId: string,
 *   username: string|null,
 *   text: string,
 *   type: 'command' | 'text' | 'unsupported',
 *   command: string|null,        // e.g. '/start' (only if type === 'command')
 *   isGroup: boolean,
 *   messageId: number|null,
 *   raw: object
 * }
 */
function parseTelegramUpdate(update) {
  if (!update) return null;

  // Support message + edited_message + channel_post
  const msg = update.message || update.edited_message || update.channel_post;
  if (!msg) return null;

  const chatId = msg.chat && msg.chat.id ? String(msg.chat.id) : null;
  if (!chatId) return null;

  const userId = msg.from && msg.from.id ? String(msg.from.id) : null;
  const username = (msg.from && msg.from.username) || null;
  const messageId = msg.message_id || null;
  const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';

  // Non-text content → unsupported
  if (typeof msg.text !== 'string' || msg.text.trim().length === 0) {
    return {
      chatId,
      userId,
      username,
      text: '',
      type: 'unsupported',
      command: null,
      isGroup,
      messageId,
      raw: update
    };
  }

  const text = msg.text.trim();

  // Command detection (e.g. /start, /help, /start@BotName)
  if (text.startsWith('/')) {
    const commandMatch = text.match(/^\/([a-zA-Z0-9_]+)(?:@\S+)?\s*(.*)/);
    const command = commandMatch ? commandMatch[1].toLowerCase() : null;
    const commandArgs = commandMatch ? commandMatch[2].trim() : '';

    return {
      chatId,
      userId,
      username,
      text: commandArgs,
      type: 'command',
      command: command ? `/${command}` : null,
      isGroup,
      messageId,
      raw: update
    };
  }

  // Regular text message
  return {
    chatId,
    userId,
    username,
    text,
    type: 'text',
    command: null,
    isGroup,
    messageId,
    raw: update
  };
}

module.exports = { parseTelegramUpdate };
