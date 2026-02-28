#!/usr/bin/env node
'use strict';

/**
 * group-d-extended-validation.js
 * Standalone validation for M83 — reads all TRS-R2 + RW-R2 vectors
 * Run from repo root: node scripts/group-d-extended-validation.js
 */

const fs = require('fs');
const path = require('path');

// ---- Config ----
const VECTOR_DIR = path.join(__dirname, '..', 'conformance', 'forecast-inputs');
const FILES = {
  'Node-03 Dim C (Multi-pattern)': 'trs-r2-deepseek-dimc-20.json',
  'Node-04 Dim F+B (Drift+Dilution)': 'trs-r2-gemini-dimf20-dimb3.json',
  'Node-04 cc-40 (Cross-cultural)': 'gc-gem-cc-40.json',
  'RW-R2 All Cases': 'rw-r2-all-cases.json'
};

const VALID_TRENDS = ['stable','rising','declining','step_escalation','spike','peak_then_decline','intermittent','plateau'];
const VALID_SCENARIOS = ['A_FINANCIAL','B_EDUCATION','C_PERSONAL','D_ELECTION','E_ENTERPRISE'];
const VALID_PATTERNS = ['DM','FC','MB','EA','IP','GC','EP','VS','Class-0'];

// ---- Helpers ----
let totalPass = 0;
let totalFail = 0;
let totalWarn = 0;
const allVectors = [];
const errors = [];
const warnings = [];

function check(vectorId, condition, msg) {
  if (!condition) {
    errors.push(`❌ ${vectorId}: ${msg}`);
    return false;
  }
  return true;
}

function warn(vectorId, msg) {
  warnings.push(`⚠️ ${vectorId}: ${msg}`);
  totalWarn++;
}

// ---- Load & Validate ----
console.log('═══════════════════════════════════════════════════');
console.log('  GROUP D EXTENDED VALIDATION — M83 Pre-Meeting');
console.log('═══════════════════════════════════════════════════\n');

for (const [label, filename] of Object.entries(FILES)) {
  const filepath = path.join(VECTOR_DIR, filename);
  
  if (!fs.existsSync(filepath)) {
    console.log(`⬜ ${label}: FILE NOT FOUND (${filename}) — skipping`);
    continue;
  }

  let vectors;
  try {
    vectors = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (e) {
    errors.push(`❌ ${label}: JSON parse error — ${e.message}`);
    totalFail++;
    continue;
  }

  if (!Array.isArray(vectors)) {
    errors.push(`❌ ${label}: not an array`);
    totalFail++;
    continue;
  }

  let filePass = 0;
  let fileFail = 0;

  for (const v of vectors) {
    const vid = (v.metadata && v.metadata.vector_id) || v.id || 'UNKNOWN';
    let vectorOk = true;

    // 1. metadata checks
    if (!check(vid, v.metadata, 'missing metadata object')) { vectorOk = false; }
    else {
      if (!check(vid, v.metadata.vector_id, 'missing metadata.vector_id')) vectorOk = false;
      if (!check(vid, v.metadata.author, 'missing metadata.author')) vectorOk = false;
      if (!check(vid, v.metadata.lang, 'missing metadata.lang')) vectorOk = false;
      if (!check(vid, v.metadata.scenario, 'missing metadata.scenario')) vectorOk = false;
      
      if (v.metadata.scenario && !VALID_SCENARIOS.includes(v.metadata.scenario)) {
        warn(vid, `scenario "${v.metadata.scenario}" not in standard list`);
      }
    }

    // 2. events check
    if (!check(vid, v.events && Array.isArray(v.events), 'missing or invalid events array')) { vectorOk = false; }
    else {
      if (!check(vid, v.events.length >= 1, 'events array is empty')) vectorOk = false;
      
      for (let i = 0; i < v.events.length; i++) {
        const ev = v.events[i];
        if (!check(vid, ev.t !== undefined && ev.t !== null, `events[${i}] missing t (time)`)) vectorOk = false;
        
        // Must have at least one text field
        const hasText = ev.text_zh || ev.text_en || ev.text_ms;
        if (!hasText) warn(vid, `events[${i}] has no text field`);

        // L1_output check
        if (ev.L1_output) {
          if (ev.L1_output.acri !== undefined && ev.L1_output.acri !== null) {
            if (typeof ev.L1_output.acri === 'number') {
              if (ev.L1_output.acri < 0 || ev.L1_output.acri > 1.0) {
                warn(vid, `events[${i}] acri=${ev.L1_output.acri} out of [0,1] range`);
              }
            }
          }
        }
      }
    }

    // 3. L3_query check (TRS vectors)
    if (v.L3_query) {
      const exp = v.L3_query.expected || v.L3_query.expected_answer;
      if (exp) {
        if (exp.trend && !VALID_TRENDS.includes(exp.trend)) {
          if (!check(vid, false, `invalid trend "${exp.trend}"`)) vectorOk = false;
        }
        if (exp.final_acri_range) {
          if (!check(vid, Array.isArray(exp.final_acri_range) && exp.final_acri_range.length === 2,
            'final_acri_range must be [min, max]')) vectorOk = false;
          else {
            if (exp.final_acri_range[0] > exp.final_acri_range[1]) {
              warn(vid, 'final_acri_range[0] > final_acri_range[1]');
            }
          }
        }
      }
    }

    if (vectorOk) { filePass++; totalPass++; }
    else { fileFail++; totalFail++; }
    
    allVectors.push({ ...v, _file: label, _valid: vectorOk });
  }

  const status = fileFail === 0 ? '✅' : '⚠️';
  console.log(`${status} ${label}: ${filePass}/${vectors.length} pass (${fileFail} fail)`);
}

// ---- Coverage Analysis ----
console.log('\n───────────────────────────────────────────────────');
console.log('  COVERAGE ANALYSIS');
console.log('───────────────────────────────────────────────────\n');

// By scenario
const byScenario = {};
VALID_SCENARIOS.forEach(s => byScenario[s] = 0);
allVectors.forEach(v => {
  if (v.metadata && v.metadata.scenario) {
    byScenario[v.metadata.scenario] = (byScenario[v.metadata.scenario] || 0) + 1;
  }
});
console.log('By Scenario:');
for (const [s, c] of Object.entries(byScenario)) {
  const bar = '█'.repeat(Math.min(c, 30));
  console.log(`  ${s.padEnd(15)} ${String(c).padStart(3)} ${bar}`);
}

// By dimension
const byDim = {};
allVectors.forEach(v => {
  const dim = (v.metadata && v.metadata.dimension_tag) || 'unknown';
  byDim[dim] = (byDim[dim] || 0) + 1;
});
console.log('\nBy Dimension:');
for (const [d, c] of Object.entries(byDim)) {
  console.log(`  ${d.padEnd(20)} ${String(c).padStart(3)}`);
}

// By author
const byAuthor = {};
allVectors.forEach(v => {
  const a = (v.metadata && v.metadata.author) || 'unknown';
  byAuthor[a] = (byAuthor[a] || 0) + 1;
});
console.log('\nBy Author:');
for (const [a, c] of Object.entries(byAuthor)) {
  console.log(`  ${a.padEnd(15)} ${String(c).padStart(3)}`);
}

// By language
const byLang = {};
allVectors.forEach(v => {
  const l = (v.metadata && v.metadata.lang) || 'unknown';
  byLang[l] = (byLang[l] || 0) + 1;
});
console.log('\nBy Language:');
for (const [l, c] of Object.entries(byLang)) {
  console.log(`  ${l.padEnd(10)} ${String(c).padStart(3)}`);
}

// By trend (TRS only)
const byTrend = {};
allVectors.forEach(v => {
  if (v.L3_query && v.L3_query.expected && v.L3_query.expected.trend) {
    const t = v.L3_query.expected.trend;
    byTrend[t] = (byTrend[t] || 0) + 1;
  }
});
console.log('\nBy Trend (TRS vectors):');
for (const [t, c] of Object.entries(byTrend)) {
  console.log(`  ${t.padEnd(20)} ${String(c).padStart(3)}`);
}

// By type (positive vs hard_negative)
const byType = { positive: 0, hard_negative: 0, trs: 0 };
allVectors.forEach(v => {
  const type = v.metadata && v.metadata.type;
  if (type === 'hard_negative') byType.hard_negative++;
  else if (type === 'positive') byType.positive++;
  else byType.trs++;
});
console.log('\nBy Type:');
console.log(`  TRS vectors:     ${byType.trs}`);
console.log(`  RW positive:     ${byType.positive}`);
console.log(`  RW hard negative: ${byType.hard_negative}`);

// ---- ACRI Range Analysis ----
console.log('\n───────────────────────────────────────────────────');
console.log('  ACRI RANGE ANALYSIS (TRS vectors)');
console.log('───────────────────────────────────────────────────\n');

const acriRanges = [];
allVectors.forEach(v => {
  if (v.L3_query && v.L3_query.expected && v.L3_query.expected.final_acri_range) {
    const r = v.L3_query.expected.final_acri_range;
    acriRanges.push({ id: v.metadata.vector_id, min: r[0], max: r[1], mid: (r[0]+r[1])/2 });
  }
});

if (acriRanges.length > 0) {
  acriRanges.sort((a, b) => a.mid - b.mid);
  
  const bands = { low: 0, medium: 0, high: 0, critical: 0 };
  acriRanges.forEach(r => {
    if (r.mid < 0.3) bands.low++;
    else if (r.mid < 0.6) bands.medium++;
    else if (r.mid < 0.8) bands.high++;
    else bands.critical++;
  });

  console.log('ACRI Bands:');
  console.log(`  Low (0-0.3):       ${bands.low}`);
  console.log(`  Medium (0.3-0.6):  ${bands.medium}`);
  console.log(`  High (0.6-0.8):    ${bands.high}`);
  console.log(`  Critical (0.8+):   ${bands.critical}`);
  
  console.log(`\n  Lowest:  ${acriRanges[0].id} [${acriRanges[0].min}-${acriRanges[0].max}]`);
  console.log(`  Highest: ${acriRanges[acriRanges.length-1].id} [${acriRanges[acriRanges.length-1].min}-${acriRanges[acriRanges.length-1].max}]`);
}

// ---- Errors & Warnings ----
if (warnings.length > 0) {
  console.log('\n───────────────────────────────────────────────────');
  console.log('  WARNINGS');
  console.log('───────────────────────────────────────────────────\n');
  warnings.forEach(w => console.log(`  ${w}`));
}

if (errors.length > 0) {
  console.log('\n───────────────────────────────────────────────────');
  console.log('  ERRORS');
  console.log('───────────────────────────────────────────────────\n');
  errors.forEach(e => console.log(`  ${e}`));
}

// ---- Final Verdict ----
console.log('\n═══════════════════════════════════════════════════');
console.log('  VERDICT');
console.log('═══════════════════════════════════════════════════\n');

const total = totalPass + totalFail;
const passRate = total > 0 ? ((totalPass / total) * 100).toFixed(1) : 0;

console.log(`  Total vectors:  ${total}`);
console.log(`  Pass:           ${totalPass}`);
console.log(`  Fail:           ${totalFail}`);
console.log(`  Warnings:       ${totalWarn}`);
console.log(`  Pass rate:      ${passRate}%`);
console.log('');

if (totalFail === 0) {
  console.log('  ✅ VERDICT: PASS — All vectors schema-compliant');
  console.log('  → Ready for M83 Layer 2a + Group D closure vote');
} else {
  console.log('  ⚠️ VERDICT: CONDITIONAL — Some vectors need fixes');
  console.log(`  → ${totalFail} vectors need correction before M83`);
}

console.log('\n═══════════════════════════════════════════════════\n');

// ---- Write report ----
const report = {
  schema_version: "group-d-extended-v0.1",
  run_date: new Date().toISOString(),
  total_vectors: total,
  pass: totalPass,
  fail: totalFail,
  warnings: totalWarn,
  pass_rate: parseFloat(passRate),
  verdict: totalFail === 0 ? 'PASS' : 'CONDITIONAL',
  coverage: { byScenario, byDim, byAuthor, byLang, byTrend, byType },
  errors: errors,
  warnings_list: warnings
};

const reportPath = path.join(VECTOR_DIR, '..', 'group-d-extended-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`📄 Report saved: ${reportPath}`);
