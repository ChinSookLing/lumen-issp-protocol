// test/dashboard/dashboard-store.test.js
// S11-DASH-01: Dashboard Store + Converter Tests
// Owner: Node-01 (Architect)
//
// Covers:
//   §1: toDashboardItem converter (L4 → dashboard_item)
//   §2: Ring buffer store (add/get/evict)
//   §3: API contract (schema compliance)
//   §4: Red line enforcement (R1-R9)
//   §5: hashId privacy

'use strict';

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const {
  toDashboardItem, hashId, store, addResult,
  getRecent, getByRequestId, getById, getStats,
  clearAll, STORE_CONFIG,
} = require('../../src/dashboard/dashboard-store');

const schema = require('../../schemas/dashboard_item.v0.1.schema.json');

// ── Helpers ──────────────────────────────────

function mockPipelineResult(overrides = {}) {
  return {
    domain: 'C_PRIVATE',
    event: {
      layers: {
        layer1: {
          acri: 0.45,
          vri: 0.12,
          patterns: [{ id: 'MB' }, { id: 'FC' }],
          response_level: 3,
        },
      },
    },
    alert: {
      effective_level: 3,
      pattern: 'MB',
      channels: {
        push: { score: 0.45 },
        vacuum: { score: 0.12 },
      },
    },
    ...overrides,
  };
}

beforeEach(() => {
  clearAll();
});

// ============================================================
// §1: toDashboardItem converter
// ============================================================
describe('§1: toDashboardItem converter', () => {
  it('produces valid item with all required fields', () => {
    const item = toDashboardItem(mockPipelineResult(), { chatId: '12345', source: 'telegram' });
    // Check all required fields from schema
    for (const field of schema.required) {
      assert.ok(field in item, `Missing required field: ${field}`);
    }
  });

  it('maps effective_level 3 to yellow badge', () => {
    const item = toDashboardItem(mockPipelineResult());
    assert.strictEqual(item.badge, 'yellow');
    assert.strictEqual(item.badge_emoji, '🟡');
  });

  it('maps effective_level 1 to blue badge', () => {
    const result = mockPipelineResult();
    result.alert.effective_level = 1;
    const item = toDashboardItem(result);
    assert.strictEqual(item.badge, 'blue');
  });

  it('maps effective_level 4-5 to orange badge', () => {
    const result = mockPipelineResult();
    result.alert.effective_level = 4;
    const item = toDashboardItem(result);
    assert.strictEqual(item.badge, 'orange');
  });

  it('extracts top_flags from patterns (max 5)', () => {
    const item = toDashboardItem(mockPipelineResult());
    assert.deepStrictEqual(item.top_flags, ['MB', 'FC']);
  });

  it('sets tier0_readonly: true (const)', () => {
    const item = toDashboardItem(mockPipelineResult());
    assert.strictEqual(item.view.tier0_readonly, true);
    assert.strictEqual(item.view.mode, 'tier0_readonly');
  });

  it('sets redaction_state to redacted', () => {
    const item = toDashboardItem(mockPipelineResult());
    assert.strictEqual(item.redaction_state, 'redacted');
  });

  it('provides SAFE-mode simple_advice', () => {
    const item = toDashboardItem(mockPipelineResult());
    assert.ok(item.simple_advice.length > 0);
    assert.ok(item.simple_advice.length <= 480);
    // No accusations
    assert.ok(!item.simple_advice.includes('scam'));
    assert.ok(!item.simple_advice.includes('criminal'));
  });

  it('handles null/empty pipeline result gracefully', () => {
    const item = toDashboardItem(null);
    assert.ok(item.item_id);
    assert.strictEqual(item.badge, 'blue');
  });
});

// ============================================================
// §2: Ring buffer store
// ============================================================
describe('§2: Ring buffer store', () => {
  it('addResult stores and returns dashboard_item', () => {
    const item = addResult(mockPipelineResult(), { chatId: '111' });
    assert.ok(item.item_id);
    assert.strictEqual(getStats().count, 1);
  });

  it('getRecent returns newest first', () => {
    addResult(mockPipelineResult(), { chatId: 'A' });
    addResult(mockPipelineResult(), { chatId: 'B' });
    addResult(mockPipelineResult(), { chatId: 'C' });

    const items = getRecent(3);
    assert.strictEqual(items.length, 3);
    // Newest should be first
    assert.ok(items[0].time_utc >= items[1].time_utc);
  });

  it('getRecent respects limit', () => {
    for (let i = 0; i < 10; i++) {
      addResult(mockPipelineResult(), { chatId: `chat-${i}` });
    }
    assert.strictEqual(getRecent(3).length, 3);
    assert.strictEqual(getRecent(10).length, 10);
  });

  it('getByRequestId finds correct item', () => {
    const item = addResult(mockPipelineResult(), { request_id: 'REQ-FIND-ME' });
    const found = getByRequestId('REQ-FIND-ME');
    assert.ok(found);
    assert.strictEqual(found.request.request_id, 'REQ-FIND-ME');
  });

  it('getByRequestId returns null for missing', () => {
    assert.strictEqual(getByRequestId('NOPE'), null);
  });

  it('evicts oldest when MAX_ITEMS reached', () => {
    const max = STORE_CONFIG.MAX_ITEMS;
    for (let i = 0; i < max + 5; i++) {
      addResult(mockPipelineResult(), { request_id: `REQ-${i}` });
    }
    assert.strictEqual(getStats().count, max);
    // First 5 should be evicted
    assert.strictEqual(getByRequestId('REQ-0'), null);
    assert.strictEqual(getByRequestId('REQ-4'), null);
    // Last should still exist
    assert.ok(getByRequestId(`REQ-${max + 4}`));
  });

  it('clearAll empties store', () => {
    addResult(mockPipelineResult());
    assert.strictEqual(getStats().count, 1);
    clearAll();
    assert.strictEqual(getStats().count, 0);
  });
});

// ============================================================
// §3: Schema contract compliance
// ============================================================
describe('§3: Schema contract compliance', () => {
  it('item source matches schema enum', () => {
    const allowed = schema.properties.source.enum;
    const item = toDashboardItem(mockPipelineResult(), { source: 'telegram' });
    assert.ok(allowed.includes(item.source));
  });

  it('badge matches schema enum', () => {
    const allowed = schema.properties.badge.enum;
    const item = toDashboardItem(mockPipelineResult());
    assert.ok(allowed.includes(item.badge));
  });

  it('view.mode matches schema enum', () => {
    const allowed = schema.properties.view.properties.mode.enum;
    const item = toDashboardItem(mockPipelineResult());
    assert.ok(allowed.includes(item.view.mode));
  });

  it('top_flags has max 5 items', () => {
    const result = mockPipelineResult();
    result.event.layers.layer1.patterns = Array.from({ length: 8 }, (_, i) => ({ id: `P${i}` }));
    const item = toDashboardItem(result);
    assert.ok(item.top_flags.length <= 5);
  });

  it('simple_advice under 480 chars', () => {
    const item = toDashboardItem(mockPipelineResult());
    assert.ok(item.simple_advice.length <= 480);
  });
});

// ============================================================
// §4: Red line enforcement (R1-R9)
// ============================================================
describe('§4: Red line enforcement', () => {
  it('R3: no raw_text value in item (never)', () => {
    const item = toDashboardItem(mockPipelineResult());
    // Check that no field contains actual text content
    assert.ok(!('raw_text' in item), 'No raw_text field at root');
    assert.ok(!('raw_text' in (item.request || {})), 'No raw_text in request');
    // sensitive_excluded.no_raw_text is the PROOF it's excluded — that's OK
    assert.ok(item.sensitive_excluded.no_raw_text === true);
  });

  it('R5: chatId is hashed, not raw', () => {
    const item = toDashboardItem(mockPipelineResult(), { chatId: '-100123456789' });
    // Should NOT contain the raw chatId
    const json = JSON.stringify(item);
    assert.ok(!json.includes('-100123456789'), 'Raw chatId must not appear');
    // Should contain hashed version
    assert.ok(item.request.chat_id);
    assert.strictEqual(item.request.chat_id.length, 16);
  });

  it('R9: sensitive_excluded proves isolation', () => {
    const item = toDashboardItem(mockPipelineResult());
    assert.strictEqual(item.sensitive_excluded.no_raw_text, true);
    assert.strictEqual(item.sensitive_excluded.no_scores, true);
    assert.strictEqual(item.sensitive_excluded.no_evidence_detail, true);
  });

  it('no acri_score in dashboard item', () => {
    const item = toDashboardItem(mockPipelineResult());
    const json = JSON.stringify(item);
    assert.ok(!json.includes('acri_score'), 'acri_score must not appear');
    assert.ok(!json.includes('momentum_score'), 'momentum_score must not appear');
  });

  it('no userId in dashboard item', () => {
    const item = toDashboardItem(mockPipelineResult(), { chatId: '999', userId: 'user_abc' });
    const json = JSON.stringify(item);
    assert.ok(!json.includes('userId'), 'userId must not appear');
    assert.ok(!json.includes('user_abc'), 'raw userId must not appear');
  });
});

// ============================================================
// §5: hashId privacy
// ============================================================
describe('§5: hashId privacy', () => {
  it('produces 16-char hex string', () => {
    const h = hashId('12345');
    assert.strictEqual(h.length, 16);
    assert.ok(/^[a-f0-9]{16}$/.test(h));
  });

  it('is deterministic', () => {
    assert.strictEqual(hashId('abc'), hashId('abc'));
  });

  it('different inputs produce different hashes', () => {
    assert.notStrictEqual(hashId('abc'), hashId('def'));
  });

  it('cannot reverse to original', () => {
    const h = hashId('-100123456789');
    assert.ok(!h.includes('100123456789'));
  });
});
