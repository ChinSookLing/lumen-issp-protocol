#!/usr/bin/env node

/**
 * Lumen ISSP — Metrics Nightly Job
 * Step 24A
 * 
 * Run via cron: 0 3 * * * node scripts/metrics-nightly.js
 * Or manually: node scripts/metrics-nightly.js
 */

const { runNightly } = require('../api/metrics');
const { getStats } = require('../api/feedback');

console.log('========================================');
console.log('  Lumen Metrics — Nightly Aggregation');
console.log(`  ${new Date().toISOString()}`);
console.log('========================================');
console.log('');

try {
  // Get feedback stats for TPFP calculation
  let feedbackStats = null;
  try {
    feedbackStats = getStats();
  } catch (e) {
    console.log('   ℹ️  No feedback data available (feedback pipeline may not be active)');
  }

  const { snapshot, alerts } = runNightly(feedbackStats);

  console.log('');
  if (alerts.length > 0) {
    console.log(`⚠️  ${alerts.length} alert(s) — review recommended`);
    process.exit(1); // Non-zero exit for CI to catch
  } else {
    console.log('✅ Nightly aggregation complete');
    process.exit(0);
  }
} catch (err) {
  console.error('❌ Nightly job failed:', err.message);
  process.exit(2);
}
