#!/usr/bin/env node

/**
 * Lumen ISSP — Feedback → Fixture Candidate Generator
 * Step 21A · Nightly scan
 * 
 * Scans feedback.json for:
 * - FP entries with count ≥ 3 for same pattern → candidate FP fixture
 * - FN entries → candidate new test case
 * 
 * Output: data/fixture-candidates.json (human review required before merge)
 * 
 * CRITICAL: Candidates only. Human review + CI pass required before merge.
 */

const fs = require('fs');
const path = require('path');

const FEEDBACK_PATH = process.env.FEEDBACK_PATH || path.join(__dirname, '..', 'data', 'feedback.json');
const CANDIDATES_PATH = path.join(__dirname, '..', 'data', 'fixture-candidates.json');
const FP_THRESHOLD = 3; // Minimum FP reports before generating candidate

function run() {
  console.log('🔭 Lumen Feedback → Fixture Scanner');
  console.log(`   Source: ${FEEDBACK_PATH}`);
  console.log(`   Threshold: FP count ≥ ${FP_THRESHOLD}`);
  console.log('');

  if (!fs.existsSync(FEEDBACK_PATH)) {
    console.log('   No feedback data found. Exiting.');
    return;
  }

  const data = JSON.parse(fs.readFileSync(FEEDBACK_PATH, 'utf8'));
  const candidates = { generated: new Date().toISOString(), fp_candidates: [], fn_candidates: [] };

  // Count FP by pattern
  const fpCounts = {};
  const fnEntries = [];

  for (const entry of data.entries) {
    if (entry.type === 'fp') {
      const key = `${entry.pattern_id}:${entry.flag_id || 'none'}`;
      if (!fpCounts[key]) fpCounts[key] = { count: 0, pattern_id: entry.pattern_id, flag_id: entry.flag_id, tiers: [] };
      fpCounts[key].count++;
      fpCounts[key].tiers.push(entry.tier);
    }
    if (entry.type === 'fn') {
      fnEntries.push({
        pattern_id: entry.pattern_id,
        tier: entry.tier,
        note: entry.note,
        timestamp: entry.timestamp
      });
    }
  }

  // Generate FP candidates
  for (const [key, info] of Object.entries(fpCounts)) {
    if (info.count >= FP_THRESHOLD) {
      candidates.fp_candidates.push({
        pattern_id: info.pattern_id,
        flag_id: info.flag_id,
        fp_count: info.count,
        tiers: [...new Set(info.tiers)].sort(),
        action: 'REVIEW — consider adding FP fixture or adjusting threshold',
        status: 'pending_human_review'
      });
    }
  }

  // Generate FN candidates
  for (const fn of fnEntries) {
    candidates.fn_candidates.push({
      pattern_id: fn.pattern_id,
      tier: fn.tier,
      note: fn.note,
      reported: fn.timestamp,
      action: 'REVIEW — consider adding new test case',
      status: 'pending_human_review'
    });
  }

  // Write candidates
  fs.writeFileSync(CANDIDATES_PATH, JSON.stringify(candidates, null, 2));

  console.log(`   FP candidates: ${candidates.fp_candidates.length} (threshold ≥ ${FP_THRESHOLD})`);
  console.log(`   FN candidates: ${candidates.fn_candidates.length}`);
  console.log(`   Output: ${CANDIDATES_PATH}`);
  console.log('');
  console.log('   ⚠️  All candidates require human review before merge.');
}

run();
