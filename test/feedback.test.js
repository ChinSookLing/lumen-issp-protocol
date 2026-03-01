/**
 * Lumen ISSP — Feedback Pipeline Tests
 * Step 21A · SPEG compliance verification
 */

const { describe, it, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// Use temp path for tests
const TEST_FEEDBACK_PATH = path.join(__dirname, '..', 'data', 'feedback.test.json');
process.env.FEEDBACK_PATH = TEST_FEEDBACK_PATH;

// Re-require after setting env
const { addFeedback, getStats, initStore } = require('../api/feedback');

function resetStore() {
  if (fs.existsSync(TEST_FEEDBACK_PATH)) {
    fs.unlinkSync(TEST_FEEDBACK_PATH);
  }
  initStore();
}

describe('Feedback Pipeline', () => {
  beforeEach(() => resetStore());
  after(() => {
    if (fs.existsSync(TEST_FEEDBACK_PATH)) {
      fs.unlinkSync(TEST_FEEDBACK_PATH);
    }
  });

  it('initializes empty store', () => {
    assert.ok(fs.existsSync(TEST_FEEDBACK_PATH));
    const data = JSON.parse(fs.readFileSync(TEST_FEEDBACK_PATH, 'utf8'));
    assert.equal(data.version, '1.0.0');
    assert.equal(data.entries.length, 0);
    assert.equal(data.stats.total, 0);
  });

  it('adds valid confirm feedback', () => {
    const result = addFeedback({
      type: 'confirm',
      pattern_id: 'P01',
      tier: 3,
      confidence_before: 0.85
    });
    assert.equal(result.ok, true);
    assert.equal(result.id, 'fb-001');
    assert.ok(result.timestamp);
  });

  it('adds valid FP feedback', () => {
    addFeedback({ type: 'confirm', pattern_id: 'P01', tier: 3 });
    const result = addFeedback({
      type: 'fp',
      pattern_id: 'P03',
      tier: 2,
      confidence_before: 0.72,
      note: 'legitimate sales language'
    });
    assert.equal(result.ok, true);
    assert.equal(result.id, 'fb-002');
  });

  it('rejects invalid type', () => {
    const result = addFeedback({
      type: 'invalid',
      pattern_id: 'P01',
      tier: 3
    });
    assert.equal(result.ok, false);
    assert.ok(result.error.includes('Invalid type'));
  });

  it('rejects invalid pattern_id', () => {
    const result = addFeedback({
      type: 'confirm',
      pattern_id: 'INVALID',
      tier: 3
    });
    assert.equal(result.ok, false);
    assert.ok(result.error.includes('Invalid pattern_id'));
  });

  it('rejects invalid tier', () => {
    const result = addFeedback({
      type: 'confirm',
      pattern_id: 'P01',
      tier: 99
    });
    assert.equal(result.ok, false);
    assert.ok(result.error.includes('Invalid tier'));
  });

  it('truncates note to 200 chars', () => {
    const longNote = 'x'.repeat(300);
    const result = addFeedback({
      type: 'fn',
      pattern_id: 'P05',
      tier: 1,
      note: longNote
    });
    assert.equal(result.ok, true);
    const data = JSON.parse(fs.readFileSync(TEST_FEEDBACK_PATH, 'utf8'));
    const entry = data.entries.find(e => e.id === result.id);
    assert.equal(entry.note.length, 200);
  });

  it('stats aggregate correctly', () => {
    addFeedback({ type: 'confirm', pattern_id: 'P01', tier: 3 });
    addFeedback({ type: 'confirm', pattern_id: 'P01', tier: 3 });
    addFeedback({ type: 'fp', pattern_id: 'P01', tier: 2 });
    addFeedback({ type: 'fn', pattern_id: 'P03', tier: 1 });
    addFeedback({ type: 'dismiss', pattern_id: 'P03', tier: 4 });

    const stats = getStats();
    assert.equal(stats.total, 5);
    assert.equal(stats.confirm, 2);
    assert.equal(stats.fp, 1);
    assert.equal(stats.fn, 1);
    assert.equal(stats.dismiss, 1);
    assert.equal(stats.by_pattern.P01.confirm, 2);
    assert.equal(stats.by_pattern.P01.fp, 1);
    assert.equal(stats.by_pattern.P03.fn, 1);
  });

  it('SPEG-A: no original text stored', () => {
    addFeedback({
      type: 'fp',
      pattern_id: 'P02',
      tier: 2,
      note: 'operator note only'
    });
    const data = JSON.parse(fs.readFileSync(TEST_FEEDBACK_PATH, 'utf8'));
    const entry = data.entries[0];
    assert.equal(entry.raw_text, undefined);
    assert.equal(entry.message, undefined);
    assert.equal(entry.content, undefined);
  });

  it('SPEG-B: no identity association', () => {
    addFeedback({
      type: 'confirm',
      pattern_id: 'P01',
      tier: 3
    });
    const data = JSON.parse(fs.readFileSync(TEST_FEEDBACK_PATH, 'utf8'));
    const entry = data.entries[0];
    assert.equal(entry.user_id, undefined);
    assert.equal(entry.chat_id, undefined);
    assert.equal(entry.ip, undefined);
  });

  it('SPEG-D: only 4 structured types accepted', () => {
    const validTypes = ['confirm', 'dismiss', 'fp', 'fn'];
    for (const type of validTypes) {
      const result = addFeedback({ type, pattern_id: 'P01', tier: 0 });
      assert.equal(result.ok, true);
    }
    const invalidResult = addFeedback({ type: 'raw_report', pattern_id: 'P01', tier: 0 });
    assert.equal(invalidResult.ok, false);
  });
});
