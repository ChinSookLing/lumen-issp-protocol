const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { computeTrend } = require('../../src/forecast/forecast-engine.js');

function generateEvents(count, pattern, startIntensity, endIntensity, baseGate) {
  pattern = pattern || 'MB';
  startIntensity = startIntensity ?? 0.3;
  endIntensity = endIntensity ?? 0.7;
  baseGate = baseGate ?? 1;
  const events = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const intensity = startIntensity + (endIntensity - startIntensity) * (i / (count - 1 || 1));
    const gate_hit = Math.min(3, baseGate + Math.floor(i / 10));
    events.push({
      pattern,
      intensity,
      gate_hit,
      timestamp: new Date(now - (count - i) * 69120000).toISOString(),
    });
  }
  return events;
}

describe('forecast-engine schema validation (Node-03)', () => {
  it('should compute correct trend for increasing intensity', () => {
    const events = generateEvents(30, 'MB', 0.2, 0.8);
    const result = computeTrend(events, 'MB', { windowDays: 90 });
    assert.strictEqual(result.pattern, 'MB');
    assert.strictEqual(result.window_days, 90);
    assert.strictEqual(result.data_points, 30);
    assert.ok(result.slope > 0.02);
    assert.ok(['MEDIUM', 'HIGH'].includes(result.trendBand));
    assert.strictEqual(result.aligned_examples.length, 3);
    const examples = result.aligned_examples;
    for (let i = 0; i < examples.length - 1; i++) {
      assert.ok(examples[i].intensity >= examples[i + 1].intensity);
    }
  });

  it('should throw error when data points < 30', () => {
    const events = generateEvents(25, 'MB');
    assert.throws(() => {
      computeTrend(events, 'MB', { windowDays: 90 });
    }, /Insufficient data/);
  });

  it('should classify LOW vs MEDIUM trend band', () => {
    const eventsLow = generateEvents(31, 'MB', 0.15, 0.16);
    const resultLow = computeTrend(eventsLow, 'MB', { windowDays: 30 });
    assert.strictEqual(resultLow.trendBand, 'LOW');

    const eventsMedium = generateEvents(31, 'MB', 0.1, 0.15);
    const resultMedium = computeTrend(eventsMedium, 'MB', { windowDays: 30 });
    assert.strictEqual(resultMedium.trendBand, 'MEDIUM');
  });

  it('should ignore other patterns when filtering', () => {
    const events = [
      ...generateEvents(30, 'MB', 0.3, 0.8),
      ...generateEvents(30, 'GC', 0.5, 0.5),
    ];
    const result = computeTrend(events, 'MB', { windowDays: 90 });
    assert.strictEqual(result.pattern, 'MB');
    assert.ok(result.data_points >= 30);
  });
});
