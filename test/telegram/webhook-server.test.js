// test/telegram/webhook-server.test.js
// Telegram Webhook Server tests — Step 13
// Updated: Lumen-17 — aligned to new formatReply API shape (output.alert)
'use strict';
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { formatReply } = require('../../src/telegram/webhook-server');

// === formatReply tests ===
describe('formatReply — L4 UI Constraints', () => {
  it('returns null for no detection (silent mode)', () => {
    assert.strictEqual(formatReply(null), null);
    assert.strictEqual(formatReply({}), null);
    assert.strictEqual(formatReply({ alert: null }), null);
  });

  it('level 1 → null (silent audit trail)', () => {
    assert.strictEqual(formatReply({ alert: { effective_level: 1, pattern: 'MB' } }), null);
  });

  it('level 2 (low) → 🔵', () => {
    const reply = formatReply({ alert: { effective_level: 2, pattern: 'VS', channels: { push: { score: 0.2 } } } });
    assert.ok(reply.includes('🔵'));
    assert.ok(reply.includes('VS'));
  });

  it('level 3 (medium) → 🟡', () => {
    const reply = formatReply({ alert: { effective_level: 3, pattern: 'DM', channels: { push: { score: 0.4 } } } });
    assert.ok(reply.includes('🟡'));
    assert.ok(reply.includes('DM'));
  });

  it('level 4 (high) → 🟠', () => {
    const reply = formatReply({ alert: { effective_level: 4, pattern: 'MB', channels: { push: { score: 0.7 } } } });
    assert.ok(reply.includes('🟠'));
    assert.ok(reply.includes('MB'));
  });

  it('always includes disclaimer', () => {
    const reply = formatReply({ alert: { effective_level: 2, pattern: 'FC', channels: {} } });
    assert.ok(reply.includes('不是診斷') || reply.includes('不提供行動建議'));
  });

  it('includes SAFE mode marker', () => {
    const reply = formatReply({ alert: { effective_level: 3, pattern: 'EA', channels: { push: { score: 0.5 } } } });
    assert.ok(reply.includes('假設生成'));
  });

  it('handles missing pattern gracefully', () => {
    const reply = formatReply({ alert: { effective_level: 2, channels: {} } });
    assert.ok(reply.includes('unknown'));
  });

  it('handles missing channels gracefully', () => {
    const reply = formatReply({ alert: { effective_level: 2, pattern: 'GC' } });
    assert.ok(reply.includes('GC'));
  });

  it('shows ACRI score when push channel present', () => {
    const reply = formatReply({ alert: { effective_level: 3, pattern: 'DM', channels: { push: { score: 0.55 } } } });
    assert.ok(reply.includes('0.55'));
  });

  it('shows VRI score when vacuum channel present', () => {
    const reply = formatReply({ alert: { effective_level: 3, pattern: 'VS', channels: { vacuum: { score: 0.72 } } } });
    assert.ok(reply.includes('0.72'));
  });

  it('level 4+ with requires_handoff shows hand-off notice', () => {
    const reply = formatReply({ alert: { effective_level: 4, pattern: 'MB', requires_handoff: true, channels: {} } });
    assert.ok(reply.includes('建議與信任的人討論'));
  });
});

// === Silent mode ===
describe('Silent mode — no signal no reply', () => {
  it('no alert property → null', () => {
    assert.strictEqual(formatReply({ pattern: 'DM' }), null);
  });

  it('effective_level 0 → null', () => {
    assert.strictEqual(formatReply({ alert: { effective_level: 0, pattern: 'DM' } }), null);
  });

  it('effective_level 1 → null', () => {
    assert.strictEqual(formatReply({ alert: { effective_level: 1, pattern: 'DM', channels: { push: { score: 0.8 } } } }), null);
  });
});
