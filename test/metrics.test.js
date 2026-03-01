/**
 * Lumen ISSP — Metrics Tests
 * Step 24A
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { recordLatency, recordDetection, recordHealthCheck, generateSnapshot } = require('../api/metrics');

describe('Metrics System', () => {
  it('records latency samples', () => {
    recordLatency(45);
    recordLatency(120);
    recordLatency(30);
    const snapshot = generateSnapshot(null);
    assert.ok(snapshot.metrics.latency.samples >= 3);
    assert.ok(snapshot.metrics.latency.avg_ms > 0);
  });

  it('records detection events', () => {
    recordDetection('P01', 'chat-001');
    recordDetection('P03', 'chat-001');
    recordDetection('P01', 'chat-002');
    recordDetection(null, 'chat-003');
    const snapshot = generateSnapshot(null);
    assert.ok(snapshot.metrics.usage.messages_processed >= 4);
    assert.ok(snapshot.metrics.usage.patterns_detected >= 3);
  });

  it('calculates TPFP from feedback stats', () => {
    const feedbackStats = {
      total: 10,
      confirm: 7,
      dismiss: 1,
      fp: 2,
      fn: 0,
      response_rate: 0.5
    };
    const snapshot = generateSnapshot(feedbackStats);
    assert.equal(snapshot.metrics.tpfp.true_positive, 7);
    assert.equal(snapshot.metrics.tpfp.false_positive, 2);
    assert.ok(Math.abs(snapshot.metrics.tpfp.precision - 0.778) < 0.01);
    assert.equal(snapshot.metrics.tpfp.recall, 1);
  });

  it('tracks uptime via health checks', () => {
    recordHealthCheck(true);
    recordHealthCheck(true);
    recordHealthCheck(true);
    recordHealthCheck(false);
    const snapshot = generateSnapshot(null);
    assert.ok(snapshot.metrics.uptime.health_checks_passed >= 3);
    assert.ok(snapshot.metrics.uptime.health_checks_failed >= 1);
    assert.equal(snapshot.metrics.uptime.status, 'degraded');
  });

  it('handles empty state gracefully', () => {
    const snapshot = generateSnapshot(null);
    assert.notEqual(snapshot.metrics.latency.avg_ms, undefined);
    assert.equal(snapshot.metrics.tpfp.f1, 0);
    assert.notEqual(snapshot.metrics.usage.messages_processed, undefined);
  });

  it('generates complete snapshot structure', () => {
    const snapshot = generateSnapshot(null);
    assert.ok(snapshot.generated);
    assert.equal(snapshot.period, '24h');
    assert.ok(snapshot.metrics.latency);
    assert.ok(snapshot.metrics.tpfp);
    assert.ok(snapshot.metrics.usage);
    assert.ok(snapshot.metrics.feedback !== undefined);
    assert.ok(snapshot.metrics.uptime);
  });
});
