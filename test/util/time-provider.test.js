'use strict';
const { describe, it, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { now, isoNow, epochNow, setProvider, resetProvider } = require('../../src/util/time-provider');

describe('time-provider', () => {
  afterEach(() => resetProvider());

  it('now() returns Date object', () => {
    assert.ok(now() instanceof Date);
  });

  it('isoNow() returns ISO string', () => {
    assert.match(isoNow(), /^\d{4}-\d{2}-\d{2}T/);
  });

  it('setProvider freezes time for testing', () => {
    const frozen = new Date('2026-01-01T00:00:00Z');
    setProvider(() => frozen);
    assert.equal(isoNow(), '2026-01-01T00:00:00.000Z');
    assert.equal(epochNow(), frozen.getTime());
  });

  it('resetProvider restores real clock', () => {
    setProvider(() => new Date('2000-01-01'));
    resetProvider();
    assert.ok(now().getFullYear() >= 2026);
  });

  it('setProvider rejects non-function', () => {
    assert.throws(() => setProvider('not a fn'), /requires a function/);
  });
});
