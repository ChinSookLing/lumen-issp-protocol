/**
 * validate-schema.js
 * 驗證 gc-unified-bundle-v0.2.json 是否符合 forecast-input-v0.2 schema
 *
 * 用法：node validate-schema.js
 * 依賴：ajv (npm install ajv)
 */

'use strict';

const fs = require('fs');
const path = require('path');

// Simple schema validator (no external deps)
// Validates required fields, types, enums without ajv

const VALID_SCENARIOS = ['A_FINANCIAL', 'B_EDUCATION', 'C_PERSONAL', 'D_ELECTION', 'E_ENTERPRISE'];
const VALID_TIME_SCALES = ['minute', 'hourly', 'daily', 'weekly', 'monthly', 'quarterly'];
const VALID_AUTHORS = ['Node-06', 'Node-03', 'Node-04', 'Node-05', 'Node-02', 'Node-01'];
const VALID_DIMENSIONS = ['cross_cultural', 'temporal_accumulation', 'semantic_drift', 'hitl_boundary', 'canary_drift'];
const VALID_LANGS = ['zh', 'en', 'mixed'];
const VALID_TRENDS = ['stable', 'rising', 'declining', 'step_escalation', 'spike', 'peak_then_decline', 'intermittent', 'plateau'];

function validateVector(v, index) {
  const errors = [];
  const id = v.metadata?.vector_id || `index_${index}`;

  // metadata
  if (!v.metadata) { errors.push('missing metadata'); return { id, errors }; }
  if (!VALID_SCENARIOS.includes(v.metadata.scenario)) errors.push(`invalid scenario: ${v.metadata.scenario}`);
  if (!VALID_TIME_SCALES.includes(v.metadata.time_scale)) errors.push(`invalid time_scale: ${v.metadata.time_scale}`);
  if (!v.metadata.vector_id) errors.push('missing vector_id');
  if (!VALID_AUTHORS.includes(v.metadata.author)) errors.push(`invalid author: ${v.metadata.author}`);
  if (!VALID_DIMENSIONS.includes(v.metadata.dimension_tag)) errors.push(`invalid dimension_tag: ${v.metadata.dimension_tag}`);
  if (!VALID_LANGS.includes(v.metadata.lang)) errors.push(`invalid lang: ${v.metadata.lang}`);

  // events
  if (!Array.isArray(v.events) || v.events.length === 0) { errors.push('events must be non-empty array'); }
  else {
    for (let i = 0; i < v.events.length; i++) {
      const e = v.events[i];
      if (typeof e.t !== 'number') errors.push(`events[${i}].t must be number`);
      if (!e.L1_output) errors.push(`events[${i}].L1_output missing`);
      else if (!e.L1_output.pattern) errors.push(`events[${i}].L1_output.pattern missing`);
    }
  }

  // L3_query
  if (!v.L3_query) { errors.push('missing L3_query'); }
  else {
    if (!v.L3_query.question) errors.push('missing L3_query.question');
    if (!v.L3_query.expected) errors.push('missing L3_query.expected');
    else if (!VALID_TRENDS.includes(v.L3_query.expected.trend)) {
      errors.push(`invalid trend: ${v.L3_query.expected.trend}`);
    }
  }

  return { id, errors };
}

// Main
const vectorPath = process.argv[2] || path.join(__dirname, '..', '..', 'conformance', 'forecast-inputs', 'gc-unified-bundle-v0.2.json');
const vectors = JSON.parse(fs.readFileSync(vectorPath, 'utf-8'));

console.log(`Validating ${vectors.length} vectors against forecast-input-v0.2 schema...\n`);

let totalErrors = 0;
const results = vectors.map((v, i) => validateVector(v, i));

for (const r of results) {
  if (r.errors.length > 0) {
    console.log(`❌ ${r.id}: ${r.errors.join('; ')}`);
    totalErrors += r.errors.length;
  }
}

if (totalErrors === 0) {
  console.log(`✅ All ${vectors.length} vectors pass schema validation. Zero errors.`);
} else {
  console.log(`\n⚠️  ${totalErrors} errors across ${results.filter(r => r.errors.length > 0).length} vectors.`);
}

process.exit(totalErrors > 0 ? 1 : 0);
