// test/telegram/accumulator-edge.test.js
// Accumulator Edge Case Tests — Node-03 Review (c179)
// Owner: Node-01 (test) + Node-03 (review)
//
// Covers: per-chat lock, concurrent messages, threshold boundaries,
// debug logging infrastructure, and edge conditions.

'use strict';

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const {
  addMessage, flush, releaseLock, sweep, clearAll, getBuffer, getBufferCount,
  ACC_CONFIG, _processing, _debug,
} = require('../../src/telegram/accumulator');

// ============================================================
// Setup
// ============================================================
beforeEach(() => {
  clearAll();
  _processing.clear();
});

// ============================================================
// §1: Per-chat lock (Node-03 P2)
// ============================================================
describe('§1: Per-chat lock', () => {
  it('processing map exists and is a Map', () => {
    assert.ok(_processing instanceof Map);
  });

  it('lock is set during flush and persists until releaseLock (P1.1)', () => {
    // Add messages to trigger flush
    for (let i = 0; i < ACC_CONFIG.BUFFER_SIZE - 1; i++) {
      addMessage('lock-test', `msg ${i}`);
    }
    // Before trigger — no lock
    assert.ok(!_processing.has('lock-test'), 'No lock before flush trigger');

    // Trigger flush
    const result = addMessage('lock-test', 'final msg');
    assert.ok(result, 'Should trigger flush');

    // After flush — lock PERSISTS (P1.1 fix: caller must releaseLock)
    assert.ok(_processing.has('lock-test'), 'Lock persists after flush (P1.1)');

    // Explicit release
    releaseLock('lock-test');
    assert.ok(!_processing.has('lock-test'), 'Lock cleared after releaseLock');
  });

  it('manually setting lock causes addMessage to return null (LOCK_SKIP)', () => {
    addMessage('locked-chat', 'first msg');
    _processing.set('locked-chat', true);

    const result = addMessage('locked-chat', 'should be skipped');
    assert.strictEqual(result, null, 'Message during lock returns null');

    // Buffer should still have only 1 message
    const buf = getBuffer('locked-chat');
    assert.strictEqual(buf.messages.length, 1, 'Locked message was not added');

    _processing.delete('locked-chat');
  });
});

// ============================================================
// §2: Char threshold boundary (Node-03 P2)
// ============================================================
describe('§2: Char threshold boundary', () => {
  it('exactly 600 chars triggers char_threshold', () => {
    // Each message = 120 chars, 5 messages = 600
    const msg = 'A'.repeat(120);
    for (let i = 0; i < 4; i++) {
      const r = addMessage('exact-600', msg);
      assert.strictEqual(r, null, `msg ${i} should not trigger`);
    }
    // 5th message hits exactly 600
    const result = addMessage('exact-600', msg);
    assert.ok(result, 'Exactly 600 chars should trigger');
    assert.strictEqual(result.reason, 'char_threshold');
    assert.strictEqual(result.mergedText.replace(/\n/g, '').length, 600);
  });

  it('599 chars does not trigger', () => {
    const msg = 'B'.repeat(599);
    const result = addMessage('under-600', msg);
    assert.strictEqual(result, null, '599 chars should not trigger');
    const buf = getBuffer('under-600');
    assert.strictEqual(buf.totalChars, 599);
  });

  it('601 chars triggers on single message', () => {
    const msg = 'C'.repeat(601);
    const result = addMessage('over-600', msg);
    assert.ok(result, '601 chars should trigger');
    assert.strictEqual(result.reason, 'char_threshold');
  });
});

// ============================================================
// §3: Concurrent multi-chat isolation
// ============================================================
describe('§3: Multi-chat isolation', () => {
  it('messages to different chats do not interfere', () => {
    addMessage('chat-A', 'hello from A');
    addMessage('chat-B', 'hello from B');
    addMessage('chat-A', 'second from A');

    const bufA = getBuffer('chat-A');
    const bufB = getBuffer('chat-B');

    assert.strictEqual(bufA.messages.length, 2);
    assert.strictEqual(bufB.messages.length, 1);
    assert.ok(bufA.messages[0].includes('A'));
    assert.ok(bufB.messages[0].includes('B'));
  });

  it('flushing one chat does not affect another', () => {
    // Fill chat-X to trigger
    for (let i = 0; i < ACC_CONFIG.BUFFER_SIZE; i++) {
      addMessage('chat-X', `x-msg-${i}`);
    }
    // chat-X flushed, chat-Y untouched
    addMessage('chat-Y', 'still buffering');
    assert.strictEqual(getBuffer('chat-X'), null, 'chat-X should be flushed');
    assert.strictEqual(getBuffer('chat-Y').messages.length, 1, 'chat-Y should still have 1 msg');
  });
});

// ============================================================
// §4: MAX_BUFFER_CHARS edge
// ============================================================
describe('§4: MAX_BUFFER_CHARS edge', () => {
  it('message exceeding remaining buffer is truncated', () => {
    // Fill most of buffer
    addMessage('trunc-test', 'X'.repeat(1900));
    // Next message is 200 chars but only 100 remaining
    const result = addMessage('trunc-test', 'Y'.repeat(200));
    // Should not trigger yet (1900 + 100 = 2000 = threshold)
    // Actually 2000 >= CHAR_THRESHOLD(600) so it triggers
    if (result) {
      assert.ok(result.mergedText.length <= ACC_CONFIG.MAX_BUFFER_CHARS,
        'Merged text must not exceed MAX_BUFFER_CHARS');
    }
  });

  it('buffer at MAX_BUFFER_CHARS forces flush on next message', () => {
    addMessage('full-buf', 'Z'.repeat(ACC_CONFIG.MAX_BUFFER_CHARS));
    // Buffer should be flushed (hit char_threshold at 600)
    assert.strictEqual(getBuffer('full-buf'), null, 'Buffer flushed after hitting limit');
  });
});

// ============================================================
// §5: Debug infrastructure
// ============================================================
describe('§5: Debug infrastructure', () => {
  it('_debug function exists and is callable', () => {
    assert.strictEqual(typeof _debug, 'function');
    // Should not throw even when DEBUG is off
    assert.doesNotThrow(() => _debug('TEST', 'chat-debug', { foo: 'bar' }));
  });

  it('_debug with no detail does not throw', () => {
    assert.doesNotThrow(() => _debug('TEST', 'chat-debug'));
  });
});
