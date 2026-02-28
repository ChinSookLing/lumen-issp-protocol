#!/usr/bin/env node
'use strict';

/**
 * rw-r2-l1-engine-run.js
 * Feed RW-R2 cases through core/evaluator.js evaluate()
 * Run from repo root: node scripts/rw-r2-l1-engine-run.js
 */

const fs = require('fs');
const path = require('path');

// ---- Load L1 engine ----
const evaluatorPath = path.join(__dirname, '..', 'core', 'evaluator.js');
const { evaluate } = require(evaluatorPath);
console.log(`✅ Loaded L1 engine: core/evaluator.js`);

// ---- Load RW-R2 cases ----
const casesPath = path.join(__dirname, '..', 'conformance', 'forecast-inputs', 'rw-r2-all-cases.json');
const cases = JSON.parse(fs.readFileSync(casesPath, 'utf8'));
console.log(`✅ Loaded ${cases.length} RW-R2 cases\n`);

// ---- Run Detection ----
console.log('═══════════════════════════════════════════════════');
console.log('  RW-R2 L1 ENGINE RUN — M83');
console.log('═══════════════════════════════════════════════════\n');

const results = [];
let correctDetections = 0;
let totalPositive = 0;
let totalNegative = 0;
let falsePositives = 0;
let falseNegatives = 0;

for (const c of cases) {
  const vid = c.metadata.vector_id;
  const isPositive = c.metadata.type === 'positive';
  const expectedPatterns = c.events[0].L1_output.expected_patterns || [];

  // Get text
  const ev = c.events[0];
  const text = ev.text_en || ev.text_zh || ev.text_ms || '';

  if (!text) {
    console.log(`⬜ ${vid}: no text found, skipping`);
    continue;
  }

  // Run L1 evaluate()
  let output;
  try {
    output = evaluate(text);
  } catch (e) {
    console.log(`❌ ${vid}: engine error — ${e.message}`);
    results.push({ vector_id: vid, error: e.message });
    continue;
  }

  // Extract detected patterns from output
  // evaluate() returns a LumenDetectionResult — find pattern hits
  const patternHits = output.patterns || output.pattern_hits || output.push_patterns || [];
  const detectedPatterns = patternHits
    .filter(p => p.detected !== false)
    .map(p => p.id || p.pattern_id || p.name || '');

  const acri = output.acri != null ? output.acri : 
               (output.push && output.push.acri != null ? output.push.acri : null);
  
  const responseLevel = output.response_level || output.level || null;

  // Determine if detected as manipulation
  const isDetected = detectedPatterns.length > 0 || (acri != null && acri > 0.25);

  // Evaluate
  if (isPositive) {
    totalPositive++;
    if (isDetected) correctDetections++;
    else falseNegatives++;
  } else {
    totalNegative++;
    if (isDetected) falsePositives++;
    else correctDetections++;
  }

  // Pattern match analysis
  const matchedPatterns = expectedPatterns.filter(p => detectedPatterns.includes(p));
  const missedPatterns = expectedPatterns.filter(p => !detectedPatterns.includes(p));
  const extraPatterns = detectedPatterns.filter(p => !expectedPatterns.includes(p));

  // Display
  const icon = isPositive
    ? (isDetected ? '✅' : '❌ FN')
    : (isDetected ? '⚠️ FP' : '✅');
  const typeLabel = isPositive ? 'POS' : 'NEG';

  console.log(`${icon} ${vid} [${typeLabel}] ${c.metadata.scenario} (${c.metadata.lang})`);
  console.log(`   Text: ${text.substring(0, 70)}${text.length > 70 ? '...' : ''}`);
  console.log(`   Expected:  [${expectedPatterns.join(', ')}]`);
  console.log(`   Detected:  [${detectedPatterns.join(', ')}] | ACRI: ${acri != null ? acri.toFixed(3) : 'N/A'} | Level: ${responseLevel || 'N/A'}`);
  if (matchedPatterns.length > 0) console.log(`   Matched:   [${matchedPatterns.join(', ')}] ✓`);
  if (missedPatterns.length > 0) console.log(`   Missed:    [${missedPatterns.join(', ')}] ✗`);
  if (extraPatterns.length > 0) console.log(`   Extra:     [${extraPatterns.join(', ')}]`);
  console.log('');

  results.push({
    vector_id: vid,
    type: c.metadata.type,
    scenario: c.metadata.scenario,
    lang: c.metadata.lang,
    expected_patterns: expectedPatterns,
    detected_patterns: detectedPatterns,
    matched_patterns: matchedPatterns,
    missed_patterns: missedPatterns,
    extra_patterns: extraPatterns,
    acri,
    response_level: responseLevel,
    is_detected: isDetected,
    correct: (isPositive && isDetected) || (!isPositive && !isDetected),
    raw_output: output
  });
}

// ---- Summary ----
console.log('═══════════════════════════════════════════════════');
console.log('  SUMMARY');
console.log('═══════════════════════════════════════════════════\n');

const total = results.filter(r => !r.error).length;
const correct = results.filter(r => r.correct).length;
const errCount = results.filter(r => r.error).length;

console.log(`  Total cases:        ${cases.length}`);
console.log(`  Successfully run:   ${total}`);
console.log(`  Errors:             ${errCount}`);
console.log(`  Positive cases:     ${totalPositive}`);
console.log(`  Negative cases:     ${totalNegative}`);
console.log(`  ─────────────────────────────`);
console.log(`  Correct:            ${correct}/${total}`);
console.log(`  False positives:    ${falsePositives}/${totalNegative}`);
console.log(`  False negatives:    ${falseNegatives}/${totalPositive}`);
console.log(`  Accuracy:           ${total > 0 ? ((correct / total) * 100).toFixed(1) : 0}%`);
console.log(`  FP rate:            ${totalNegative > 0 ? ((falsePositives / totalNegative) * 100).toFixed(1) : 0}%`);
console.log(`  Detection rate:     ${totalPositive > 0 ? (((totalPositive - falseNegatives) / totalPositive) * 100).toFixed(1) : 0}%`);

// Pattern-level analysis
const allExpected = results.filter(r => r.expected_patterns).flatMap(r => r.expected_patterns);
const allMatched = results.filter(r => r.matched_patterns).flatMap(r => r.matched_patterns);
const patternStats = {};
allExpected.forEach(p => {
  if (!patternStats[p]) patternStats[p] = { expected: 0, matched: 0 };
  patternStats[p].expected++;
});
allMatched.forEach(p => {
  if (patternStats[p]) patternStats[p].matched++;
});

console.log('\n  Pattern Detection Rates:');
for (const [p, s] of Object.entries(patternStats).sort((a, b) => b[1].expected - a[1].expected)) {
  const rate = s.expected > 0 ? ((s.matched / s.expected) * 100).toFixed(0) : 0;
  console.log(`    ${p.padEnd(6)} ${s.matched}/${s.expected} (${rate}%)`);
}

console.log('');

// ---- Save report ----
const report = {
  schema_version: "rw-r2-l1-run-v0.1",
  run_date: new Date().toISOString(),
  engine: "core/evaluator.js evaluate()",
  total_cases: cases.length,
  successfully_run: total,
  errors: errCount,
  positive: totalPositive,
  negative: totalNegative,
  correct,
  false_positives: falsePositives,
  false_negatives: falseNegatives,
  accuracy: total > 0 ? parseFloat(((correct / total) * 100).toFixed(1)) : 0,
  fp_rate: totalNegative > 0 ? parseFloat(((falsePositives / totalNegative) * 100).toFixed(1)) : 0,
  detection_rate: totalPositive > 0 ? parseFloat((((totalPositive - falseNegatives) / totalPositive) * 100).toFixed(1)) : 0,
  pattern_stats: patternStats,
  results
};

const reportPath = path.join(__dirname, '..', 'conformance', 'rw-r2-l1-run-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`📄 Report saved: ${reportPath}`);
console.log('\n═══════════════════════════════════════════════════\n');
