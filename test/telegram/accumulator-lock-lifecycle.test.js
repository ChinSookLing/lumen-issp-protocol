// test/telegram/accumulator-lock-lifecycle.test.js
// Tests for P1.1 fix: lock must persist through async processing
// Owner: Node-01 (Architect) — Node-02-G scan finding

'use strict';

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { addMessage, flush, releaseLock, clearAll, getBuffer, ACC_CONFIG } = require('../../src/telegram/accumulator');

describe('Accumulator Lock Lifecycle (P1.1 fix)', () => {
  beforeEach(() => {
    clearAll();
  });

  it('releaseLock is exported and callable', () => {
    assert.equal(typeof releaseLock, 'function');
  });

  it('lock persists after flush() returns — not auto-released', () => {
    const chatId = 'lock-persist-test';
    // Fill buffer to trigger flush
    for (let i = 0; i < ACC_CONFIG.BUFFER_SIZE; i++) {
      addMessage(chatId, `msg ${i}`);
    }
    // After flush trigger, lock should still be set
    // New message should be LOCK_SKIP'd
    const result = addMessage(chatId, 'should be skipped');
    assert.equal(result, null, 'message during lock should return null (skipped)');
  });

  it('releaseLock() allows new messages after processing completes', () => {
    const chatId = 'lock-release-test';
    // Fill and trigger flush
    for (let i = 0; i < ACC_CONFIG.BUFFER_SIZE; i++) {
      addMessage(chatId, `msg ${i}`);
    }
    // Lock is set — new messages skipped
    assert.equal(addMessage(chatId, 'locked'), null);

    // Simulate processFlush completion
    releaseLock(chatId);

    // Now new messages should be accepted
    const result = addMessage(chatId, 'after release');
    // Should not be null — message is accepted into new buffer
    const buf = getBuffer(chatId);
    assert.ok(buf, 'buffer should exist after lock release');
    assert.equal(buf.messages.length, 1);
    assert.equal(buf.messages[0], 'after release');
  });

  it('releaseLock() on non-locked chatId is safe (no-op)', () => {
    // Should not throw
    assert.doesNotThrow(() => releaseLock('nonexistent-chat'));
  });

  it('concurrent flush prevention: second flush returns null while locked', () => {
    const chatId = 'concurrent-test';
    // Fill buffer
    for (let i = 0; i < ACC_CONFIG.BUFFER_SIZE; i++) {
      addMessage(chatId, `msg ${i}`);
    }
    // First flush triggered by Nth message — lock is set
    // Try manual flush — should return null (locked)
    const secondFlush = flush(chatId, 'manual');
    assert.equal(secondFlush, null, 'second flush should return null while locked');

    // Release and verify clean state
    releaseLock(chatId);
  });

  it('lock survives across multiple addMessage calls during processing', () => {
    const chatId = 'multi-add-locked';
    // Trigger flush
    for (let i = 0; i < ACC_CONFIG.BUFFER_SIZE; i++) {
      addMessage(chatId, `msg ${i}`);
    }
    // All subsequent adds should be skipped
    for (let i = 0; i < 5; i++) {
      assert.equal(addMessage(chatId, `extra ${i}`), null, `msg ${i} should be skipped`);
    }
    // Release
    releaseLock(chatId);
    // Now should accept
    addMessage(chatId, 'finally accepted');
    const buf = getBuffer(chatId);
    assert.ok(buf);
    assert.equal(buf.messages[0], 'finally accepted');
  });
});
