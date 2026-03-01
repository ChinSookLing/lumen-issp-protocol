/**
 * Lumen ISSP — Metrics & Iteration
 * Step 24A · M94-V5 Authorized
 * 
 * 5 Core Metrics: latency · TPFP · usage · feedback · uptime
 * Node-local storage · SPEG compliant
 */

const fs = require('fs');
const path = require('path');

const METRICS_PATH = process.env.METRICS_PATH || path.join(__dirname, '..', 'data', 'metrics.json');
const HISTORY_DAYS = 30;

// --- In-memory collectors (reset each nightly cycle) ---
const collectors = {
  latency_samples: [],
  messages_processed: 0,
  patterns_detected: 0,
  pattern_counts: {},
  unique_chats: new Set(),
  health_checks_passed: 0,
  health_checks_failed: 0,
  last_restart: new Date().toISOString()
};

/**
 * Record a latency sample (call from detection pipeline)
 */
function recordLatency(ms) {
  collectors.latency_samples.push(ms);
}

/**
 * Record a detection event
 */
function recordDetection(patternId, chatId) {
  collectors.messages_processed++;
  if (patternId) {
    collectors.patterns_detected++;
    collectors.pattern_counts[patternId] = (collectors.pattern_counts[patternId] || 0) + 1;
  }
  if (chatId) {
    collectors.unique_chats.add(chatId);
  }
}

/**
 * Record health check result
 */
function recordHealthCheck(passed) {
  if (passed) {
    collectors.health_checks_passed++;
  } else {
    collectors.health_checks_failed++;
  }
}

/**
 * Calculate percentile from sorted array
 */
function percentile(sortedArr, p) {
  if (sortedArr.length === 0) return 0;
  const idx = Math.ceil(p / 100 * sortedArr.length) - 1;
  return sortedArr[Math.max(0, idx)];
}

/**
 * Generate metrics snapshot from current collectors
 */
function generateSnapshot(feedbackStats) {
  const sorted = [...collectors.latency_samples].sort((a, b) => a - b);
  const totalChecks = collectors.health_checks_passed + collectors.health_checks_failed;

  const snapshot = {
    generated: new Date().toISOString(),
    period: '24h',
    metrics: {
      latency: {
        avg_ms: sorted.length > 0 ? Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length) : 0,
        p95_ms: percentile(sorted, 95),
        p99_ms: percentile(sorted, 99),
        samples: sorted.length
      },
      tpfp: {
        true_positive: feedbackStats ? feedbackStats.confirm : 0,
        false_positive: feedbackStats ? feedbackStats.fp : 0,
        false_negative: feedbackStats ? feedbackStats.fn : 0,
        precision: 0,
        recall: 0,
        f1: 0
      },
      usage: {
        messages_processed: collectors.messages_processed,
        patterns_detected: collectors.patterns_detected,
        unique_chats: collectors.unique_chats.size,
        by_pattern: { ...collectors.pattern_counts }
      },
      feedback: feedbackStats || { total: 0, confirm: 0, dismiss: 0, fp: 0, fn: 0, response_rate: 0 },
      uptime: {
        status: collectors.health_checks_failed === 0 ? 'healthy' : 'degraded',
        uptime_pct: totalChecks > 0 ? Number(((collectors.health_checks_passed / totalChecks) * 100).toFixed(2)) : 100,
        last_restart: collectors.last_restart,
        health_checks_passed: collectors.health_checks_passed,
        health_checks_failed: collectors.health_checks_failed
      }
    }
  };

  // Calculate precision / recall / F1
  const tp = snapshot.metrics.tpfp.true_positive;
  const fp = snapshot.metrics.tpfp.false_positive;
  const fn = snapshot.metrics.tpfp.false_negative;

  snapshot.metrics.tpfp.precision = (tp + fp) > 0 ? Number((tp / (tp + fp)).toFixed(3)) : 0;
  snapshot.metrics.tpfp.recall = (tp + fn) > 0 ? Number((tp / (tp + fn)).toFixed(3)) : 0;

  const p = snapshot.metrics.tpfp.precision;
  const r = snapshot.metrics.tpfp.recall;
  snapshot.metrics.tpfp.f1 = (p + r) > 0 ? Number((2 * p * r / (p + r)).toFixed(3)) : 0;

  return snapshot;
}

/**
 * Run nightly aggregation
 */
function runNightly(feedbackStats) {
  console.log('🔭 Lumen Metrics — Nightly Aggregation');

  const snapshot = generateSnapshot(feedbackStats);

  // Load existing or create new
  let store;
  if (fs.existsSync(METRICS_PATH)) {
    store = JSON.parse(fs.readFileSync(METRICS_PATH, 'utf8'));
  } else {
    const dir = path.dirname(METRICS_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    store = { version: '1.0.0', node_id: process.env.NODE_ID || 'reference-render', history: [] };
  }

  // Update current metrics
  store.generated = snapshot.generated;
  store.period = snapshot.period;
  store.metrics = snapshot.metrics;

  // Append to history (rolling 30 days)
  store.history.push({
    date: snapshot.generated.split('T')[0],
    latency_avg: snapshot.metrics.latency.avg_ms,
    f1: snapshot.metrics.tpfp.f1,
    messages: snapshot.metrics.usage.messages_processed,
    uptime_pct: snapshot.metrics.uptime.uptime_pct
  });

  if (store.history.length > HISTORY_DAYS) {
    store.history = store.history.slice(-HISTORY_DAYS);
  }

  fs.writeFileSync(METRICS_PATH, JSON.stringify(store, null, 2));

  // Check alert thresholds
  const alerts = checkAlerts(snapshot.metrics);
  if (alerts.length > 0) {
    console.log('   ⚠️  ALERTS:');
    alerts.forEach(a => console.log(`      - ${a}`));
  } else {
    console.log('   ✅ All metrics within thresholds');
  }

  console.log(`   Latency avg: ${snapshot.metrics.latency.avg_ms}ms (p95: ${snapshot.metrics.latency.p95_ms}ms)`);
  console.log(`   F1: ${snapshot.metrics.tpfp.f1}`);
  console.log(`   Messages: ${snapshot.metrics.usage.messages_processed}`);
  console.log(`   Uptime: ${snapshot.metrics.uptime.uptime_pct}%`);
  console.log(`   History: ${store.history.length} days`);

  // Reset collectors for next cycle
  resetCollectors();

  return { snapshot, alerts };
}

/**
 * Check alert thresholds
 */
function checkAlerts(metrics) {
  const alerts = [];
  if (metrics.latency.p95_ms > 500) alerts.push(`Latency p95 = ${metrics.latency.p95_ms}ms (threshold: 500ms)`);
  if (metrics.tpfp.f1 > 0 && metrics.tpfp.f1 < 0.90) alerts.push(`F1 = ${metrics.tpfp.f1} (threshold: 0.90)`);
  if (metrics.uptime.uptime_pct < 99) alerts.push(`Uptime = ${metrics.uptime.uptime_pct}% (threshold: 99%)`);
  if (metrics.feedback.total > 0) {
    const fpRate = metrics.feedback.fp / metrics.feedback.total;
    if (fpRate > 0.15) alerts.push(`FP rate = ${(fpRate * 100).toFixed(1)}% (threshold: 15%)`);
  }
  return alerts;
}

/**
 * Reset collectors for next cycle
 */
function resetCollectors() {
  collectors.latency_samples = [];
  collectors.messages_processed = 0;
  collectors.patterns_detected = 0;
  collectors.pattern_counts = {};
  collectors.unique_chats = new Set();
  collectors.health_checks_passed = 0;
  collectors.health_checks_failed = 0;
}

/**
 * Get current metrics (for API)
 */
function getCurrentMetrics() {
  if (fs.existsSync(METRICS_PATH)) {
    return JSON.parse(fs.readFileSync(METRICS_PATH, 'utf8'));
  }
  return { version: '1.0.0', metrics: null, message: 'No metrics data yet. Run nightly job first.' };
}

/**
 * Express route handlers
 */
function registerRoutes(app) {
  app.get('/api/metrics', (req, res) => {
    res.json(getCurrentMetrics());
  });

  app.get('/api/metrics/live', (req, res) => {
    const sorted = [...collectors.latency_samples].sort((a, b) => a - b);
    res.json({
      live: true,
      latency_avg_ms: sorted.length > 0 ? Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length) : 0,
      messages_this_cycle: collectors.messages_processed,
      uptime_status: collectors.health_checks_failed === 0 ? 'healthy' : 'degraded'
    });
  });
}

module.exports = {
  recordLatency,
  recordDetection,
  recordHealthCheck,
  generateSnapshot,
  runNightly,
  getCurrentMetrics,
  registerRoutes
};
