const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { computeTrend } = require('../../src/forecast/forecast-engine');

describe('Threshold Audit — forecast-engine', () => {

  const BASE_TIME = new Date('2026-01-01T00:00:00Z').getTime();
  const DAY_MS = 86400000;

  function makeEvents(count, pattern, slope, windowDays) {
    // Place all events within the window, ending at the last day
    const endTime = BASE_TIME + (windowDays || 90) * DAY_MS;
    const spacing = Math.floor((windowDays || 90) * DAY_MS / count);
    return Array.from({ length: count }, (_, i) => ({
      pattern: pattern,
      intensity: Math.min(Math.max(slope * i, 0), 1.0),
      gate_hit: 2,
      timestamp: new Date(endTime - (count - 1 - i) * spacing).toISOString()
    }));
  }

  it('MIN_DATA_POINTS boundary: 29 events should throw', () => {
    const events = makeEvents(29, 'MB', 0.01, 90);
    assert.throws(
      () => computeTrend(events, 'MB', { windowDays: 90 }),
      /30|insufficient|not enough|minimum/i
    );
  });

  it('MIN_DATA_POINTS boundary: 30 events should succeed', () => {
    const events = makeEvents(30, 'MB', 0.01, 90);
    const r = computeTrend(events, 'MB', { windowDays: 90 });
    assert.ok(r, 'computeTrend should return a result with 30 events');
    assert.ok(r.trendBand, 'result should have trendBand');
  });

  it('low slope should not produce HIGH band', () => {
    const events = makeEvents(35, 'MB', 0.001, 90);
    const r = computeTrend(events, 'MB', { windowDays: 90 });
    assert.notEqual(r.trendBand, 'HIGH', 'near-zero slope must not classify as HIGH');
  });

  it('high slope should produce HIGH band', () => {
    const events = makeEvents(35, 'MB', 0.02, 90);
    const r = computeTrend(events, 'MB', { windowDays: 90 });
    assert.equal(r.trendBand, 'HIGH');
  });
});
