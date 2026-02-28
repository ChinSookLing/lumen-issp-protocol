const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const eventSchema = require('../../schemas/event-v1.json');
const aggregateSchema = require('../../schemas/aggregate-v1.json');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const validateEvent = ajv.compile(eventSchema);
const validateAggregate = ajv.compile(aggregateSchema);

describe('Event Schema Validation', () => {
  it('should validate a minimal valid event', () => {
    const event = {
      event_id: 'evt_1234567890abcdef',
      timestamp: '2026-02-18T12:00:00Z',
      source: {
        type: 'simulated',
        raw_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        desensitized: true
      },
      layers: {
        layer1: {
          patterns: { MB: 0.72 },
          gate: [true, true, false]
        }
      }
    };
    const valid = validateEvent(event);
    assert.ok(valid, JSON.stringify(validateEvent.errors, null, 2));
  });

  it('should reject event missing required field', () => {
    const event = {
      event_id: 'evt_1234567890abcdef',
      timestamp: '2026-02-18T12:00:00Z',
      layers: {
        layer1: {
          patterns: { MB: 0.72 },
          gate: [true, true, false]
        }
      }
    };
    const valid = validateEvent(event);
    assert.equal(valid, false);
    assert.ok(validateEvent.errors.some(e => e.instancePath === '' && e.params.missingProperty === 'source'));
  });

  it('should validate event with all layers populated', () => {
    const event = {
      event_id: 'evt_abcdef1234567890',
      timestamp: '2026-02-18T12:34:56Z',
      source: {
        type: 'telegram',
        raw_hash: 'a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890',
        desensitized: false
      },
      layers: {
        layer1: {
          patterns: { MB: 0.72, GC: 0.45 },
          gate: [true, true, false],
          acri: 0.18,
          vri: 0.05
        },
        layer2: {
          mapping_version: 'v0.1.0',
          components: { guilt_invoke: 0.25, salvation: 0.30 },
          shared_lexicon_hits: ['moral_consequence', 'collective_pressure']
        },
        layer3: {
          forecast: {
            trendBand: 'MEDIUM',
            probability: 0.8,
            confidence: 0.8,
            slope: 0.034,
            window_days: 30,
            data_points: 45,
            aligned_examples: [
              { timestamp: '2026-02-17T10:00:00Z', intensity: 0.89, gate_hit: 3 },
              { timestamp: '2026-02-16T14:30:00Z', intensity: 0.76, gate_hit: 2 }
            ]
          }
        },
        layer4: {
          response_level: 2,
          desensitized: true
        }
      },
      metadata: {
        node_id: 'node-001',
        processing_time_ms: 245,
        tags: ['test', 'debug']
      }
    };
    const valid = validateEvent(event);
    assert.ok(valid, JSON.stringify(validateEvent.errors, null, 2));
  });
});

describe('Aggregate Schema Validation', () => {
  it('should validate a minimal valid aggregate', () => {
    const agg = {
      aggregate_id: 'agg_1234567890abcdef',
      time_range: {
        start: '2026-02-01T00:00:00Z',
        end: '2026-02-08T00:00:00Z',
        window_days: 7
      },
      pattern: 'MB',
      statistics: {
        count: 42,
        avg_intensity: 0.65,
        std_intensity: 0.12,
        gate_distribution: { "0": 5, "1": 10, "2": 20, "3": 7 },
        time_series: [
          { timestamp: '2026-02-01T12:00:00Z', intensity: 0.55 },
          { timestamp: '2026-02-02T12:00:00Z', intensity: 0.62 }
        ]
      }
    };
    const valid = validateAggregate(agg);
    assert.ok(valid, JSON.stringify(validateAggregate.errors, null, 2));
  });

  it('should reject aggregate missing required field', () => {
    const agg = {
      aggregate_id: 'agg_1234567890abcdef',
      time_range: {
        start: '2026-02-01T00:00:00Z',
        end: '2026-02-08T00:00:00Z',
        window_days: 7
      },
      statistics: {
        count: 42,
        avg_intensity: 0.65,
        std_intensity: 0.12,
        gate_distribution: { "0": 5, "1": 10, "2": 20, "3": 7 },
        time_series: []
      }
    };
    const valid = validateAggregate(agg);
    assert.equal(valid, false);
    assert.ok(validateAggregate.errors.some(e => e.instancePath === '' && e.params.missingProperty === 'pattern'));
  });

  it('should validate aggregate with full statistics', () => {
    const agg = {
      aggregate_id: 'agg_abcdef1234567890',
      time_range: {
        start: '2026-01-15T00:00:00Z',
        end: '2026-02-14T00:00:00Z',
        window_days: 30
      },
      pattern: 'GC',
      statistics: {
        count: 128,
        avg_intensity: 0.58,
        std_intensity: 0.21,
        min_intensity: 0.12,
        max_intensity: 0.95,
        gate_distribution: { "0": 18, "1": 42, "2": 48, "3": 20 },
        time_series: Array.from({ length: 30 }, (_, i) => ({
          timestamp: new Date(Date.UTC(2026, 0, 15 + i)).toISOString(),
          intensity: 0.3 + Math.random() * 0.5
        }))
      },
      metadata: {
        node_id: 'node-042',
        generated_at: '2026-02-18T12:00:00Z'
      }
    };
    const valid = validateAggregate(agg);
    assert.ok(valid, JSON.stringify(validateAggregate.errors, null, 2));
  });
});
