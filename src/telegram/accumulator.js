// src/telegram/accumulator.js
// Multi-turn Accumulator — S11-ACC-01
// Owner: Node-01 (Architect) — M90 全票鎖定方案 A
//
// Purpose: Buffer per-chat messages for Telegram webhook.
//   Single-sentence ACRI is too low for gradual manipulation.
//   Chat-level accumulation lets evaluateLongText() merge cross-sentence
//   components, recovering False Negatives (Private Beta finding).
//
// Spec (M90 locked):
//   Buffer granularity:  per chatId
//   Buffer size:         N = 6 messages
//   Trigger 1:           N reached → merge → evaluateLongText()
//   Trigger 2:           merged chars ≥ 600 → early trigger
//   Clear 1:             after trigger → flush
//   Clear 2:             idle > 90s → discard (no detection value)
//   MAX_BUFFER_CHARS:    2000 (prevent memory bomb from long messages)
//   MAX_BUFFER_AGE_MS:   300000 (5 min hard cap — no long-term memory)
//   buffer_mode:         text only (no raw metadata stored)
//   buffer_trigger_reason: N_reached | char_threshold | idle_flush
//
// Privacy (Node-05 M90):
//   - Only store message text, no userId/username/messageId
//   - Buffer auto-expires; never persists across restarts
//   - Complies with §2.2 (no raw text storage beyond processing window)
//
// Design: Node-01 (Architect)
// Date: 2026-02-26

'use strict';

// Configuration — M90 locked parameters
// Node-03 config 外移: read from config/accumulator.json, fallback to defaults
// ============================================================
const path = require("node:path");
const _cfgDefaults = {
  BUFFER_SIZE: 6,
  CHAR_THRESHOLD: 600,
  IDLE_TIMEOUT_MS: 90_000,
  MAX_BUFFER_CHARS: 2000,
  MAX_BUFFER_AGE_MS: 300_000,
  SWEEP_INTERVAL_MS: 15_000,
};
let _cfgFile = {};
try {
  _cfgFile = require(path.join(__dirname, "..", "..", "config", "accumulator.json"));
} catch { /* config file missing — use defaults */ }
const ACC_CONFIG = { ..._cfgDefaults, ..._cfgFile };

// ============================================================
// Debug logging — enable with DEBUG=accumulator or DEBUG=*
// Node-03 P1: essential for Private Beta FN case tracing
// ============================================================

const DEBUG_ENABLED = (() => {
  const d = (typeof process !== 'undefined' && process.env && process.env.DEBUG) || '';
  return d === '*' || d.includes('accumulator');
})();

function debug(action, chatId, detail = {}) {
  if (!DEBUG_ENABLED) return;
  const ts = new Date().toISOString();
  const info = Object.keys(detail).length
    ? ' ' + JSON.stringify(detail)
    : '';
  console.log(`[ACC ${ts}] ${action} chat=${chatId}${info}`);
}

// ============================================================
// Per-chat processing lock — Node-03 P2
// Simple flag to prevent concurrent flush on same chatId.
// Not a full mutex — sufficient for Private Beta traffic.
// ============================================================

const processing = new Map();

// ============================================================
// Buffer Store — in-memory, per chatId
// ============================================================

/**
 * @typedef {object} ChatBuffer
 * @property {string[]} messages - Buffered message texts
 * @property {number} totalChars - Sum of message lengths
 * @property {number} createdAt - Timestamp of first message in buffer
 * @property {number} lastMessageAt - Timestamp of most recent message
 */

/** @type {Map<string, ChatBuffer>} */
const buffers = new Map();

// ============================================================
// Core API
// ============================================================

/**
 * Add a message to the chat buffer.
 * Returns a flush result if trigger conditions are met, null otherwise.
 *
 * @param {string} chatId - Chat identifier
 * @param {string} text - Message text (already trimmed)
 * @returns {{ mergedText: string, reason: string, messageCount: number } | null}
 */
function addMessage(chatId, text) {
  if (!chatId || typeof text !== 'string' || text.length === 0) {
    return null;
  }

  // Per-chat lock — if already processing a flush, skip
  if (processing.get(chatId)) {
    debug('LOCK_SKIP', chatId, { reason: 'flush_in_progress' });
    return null;
  }

  let buf = buffers.get(chatId);
  const now = Date.now();

  // Check MAX_BUFFER_AGE — if existing buffer is too old, discard it first
  if (buf && (now - buf.createdAt) >= ACC_CONFIG.MAX_BUFFER_AGE_MS) {
    debug('AGE_DISCARD', chatId, { age_ms: now - buf.createdAt, msgs: buf.messages.length });
    buffers.delete(chatId);
    buf = undefined;
  }

  if (!buf) {
    buf = {
      messages: [],
      totalChars: 0,
      createdAt: now,
      lastMessageAt: now,
    };
    buffers.set(chatId, buf);
    debug('NEW_BUFFER', chatId);
  }

  // Truncate message if adding would exceed MAX_BUFFER_CHARS
  const remaining = ACC_CONFIG.MAX_BUFFER_CHARS - buf.totalChars;
  if (remaining <= 0) {
    debug('BUFFER_FULL', chatId, { totalChars: buf.totalChars, msgs: buf.messages.length });
    // Buffer full — force flush with what we have
    return flush(chatId, 'char_threshold');
  }

  const truncated = text.length > remaining ? text.slice(0, remaining) : text;
  buf.messages.push(truncated);
  buf.totalChars += truncated.length;
  buf.lastMessageAt = now;

  debug('ADD', chatId, { n: buf.messages.length, chars: buf.totalChars, textLen: truncated.length });

  // === Trigger check ===

  // Trigger 1: N messages reached
  if (buf.messages.length >= ACC_CONFIG.BUFFER_SIZE) {
    debug('TRIGGER', chatId, { reason: 'N_reached', n: buf.messages.length });
    return flush(chatId, 'N_reached');
  }

  // Trigger 2: char threshold reached
  if (buf.totalChars >= ACC_CONFIG.CHAR_THRESHOLD) {
    debug('TRIGGER', chatId, { reason: 'char_threshold', chars: buf.totalChars });
    return flush(chatId, 'char_threshold');
  }

  // No trigger — buffer continues accumulating
  return null;
}

/**
 * Flush the buffer for a chat, returning merged text.
 *
 * @param {string} chatId
 * @param {string} reason - 'N_reached' | 'char_threshold' | 'idle_flush'
 * @returns {{ mergedText: string, reason: string, messageCount: number } | null}
 */
function flush(chatId, reason) {
  const buf = buffers.get(chatId);
  if (!buf || buf.messages.length === 0) {
    buffers.delete(chatId);
    return null;
  }

  // Set lock
  processing.set(chatId, true);

  const result = {
    mergedText: buf.messages.join('\n'),
    reason,
    messageCount: buf.messages.length,
  };

  debug('FLUSH', chatId, { reason, msgs: result.messageCount, chars: result.mergedText.length });

  // Clear buffer but KEEP lock — caller must call releaseLock(chatId)
  // after async processing completes (P1.1 fix: Node-02-G scan finding)
  buffers.delete(chatId);
  // NOTE: processing lock stays set until releaseLock() is called

  return result;
}

/**
 * Release the per-chat processing lock.
 * Must be called after async processing (processFlush) completes.
 * @param {string} chatId
 */
function releaseLock(chatId) {
  processing.delete(chatId);
  debug('LOCK_RELEASE', chatId);
}

/**
 * Sweep idle buffers. Called by setInterval.
 * Idle = no new message for IDLE_TIMEOUT_MS.
 * Age-expired = buffer older than MAX_BUFFER_AGE_MS.
 *
 * @param {function} [onIdleFlush] - Optional callback for idle flushes
 *   Called with (chatId, flushResult) — allows webhook to run pipeline on idle flush
 */
function sweep(onIdleFlush) {
  const now = Date.now();

  for (const [chatId, buf] of buffers) {
    // Hard age limit — discard without processing (no detection value)
    if ((now - buf.createdAt) >= ACC_CONFIG.MAX_BUFFER_AGE_MS) {
      debug('SWEEP_AGE_DISCARD', chatId, { age_ms: now - buf.createdAt });
      buffers.delete(chatId);
      continue;
    }

    // Idle timeout — flush with reason
    if ((now - buf.lastMessageAt) >= ACC_CONFIG.IDLE_TIMEOUT_MS) {
      debug('SWEEP_IDLE', chatId, { idle_ms: now - buf.lastMessageAt });
      const result = flush(chatId, 'idle_flush');
      if (result && typeof onIdleFlush === 'function') {
        onIdleFlush(chatId, result);
        // Lock release is caller's responsibility (processFlush finally block)
      } else if (result) {
        // No callback — release lock ourselves
        releaseLock(chatId);
      }
    }
  }
}

// ============================================================
// Lifecycle — sweep timer
// ============================================================

let sweepTimer = null;

/**
 * Start the periodic sweep timer.
 * @param {function} [onIdleFlush] - Callback when idle buffers are flushed
 * @returns {NodeJS.Timeout}
 */
function startSweep(onIdleFlush) {
  if (sweepTimer) return sweepTimer;
  sweepTimer = setInterval(() => sweep(onIdleFlush), ACC_CONFIG.SWEEP_INTERVAL_MS);
  // Don't prevent process exit
  if (sweepTimer.unref) sweepTimer.unref();
  return sweepTimer;
}

/**
 * Stop the periodic sweep timer.
 */
function stopSweep() {
  if (sweepTimer) {
    clearInterval(sweepTimer);
    sweepTimer = null;
  }
}

// ============================================================
// Introspection — for testing and debug
// ============================================================

/**
 * Get current buffer state for a chat (read-only snapshot).
 * @param {string} chatId
 * @returns {ChatBuffer|null}
 */
function getBuffer(chatId) {
  const buf = buffers.get(chatId);
  if (!buf) return null;
  return {
    messages: [...buf.messages],
    totalChars: buf.totalChars,
    createdAt: buf.createdAt,
    lastMessageAt: buf.lastMessageAt,
  };
}

/**
 * Get total number of active buffers.
 * @returns {number}
 */
function getBufferCount() {
  return buffers.size;
}

/**
 * Clear all buffers (for testing).
 */
function clearAll() {
  buffers.clear();
  processing.clear(); // P1.1: must also clear locks for test isolation
}

// ============================================================
// Exports
// ============================================================

module.exports = {
  // Core API
  addMessage,
  flush,
  releaseLock,
  sweep,

  // Lifecycle
  startSweep,
  stopSweep,

  // Introspection
  getBuffer,
  getBufferCount,
  clearAll,

  // Config (read-only reference for tests)
  ACC_CONFIG,

  // Debug & lock (Node-03 P1/P2 — for testing)
  _processing: processing,
  _debug: debug,
  ACC_CONFIG,

  // Test-only: direct buffer access (for timestamp manipulation in sweep tests)
  _buffers: buffers,
};
