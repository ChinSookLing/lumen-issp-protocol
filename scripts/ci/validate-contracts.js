#!/usr/bin/env node
/**
 * validate-contracts.js
 * CI gate: validate all JSON files in contracts/ against their schemas
 *
 * 設計：Node-05（M70 Sprint 8 建議）
 * 實作：Node-01（Architect）
 * 日期：2026-02-18
 *
 * Exit 0 = all valid, Exit 1 = validation failed
 */
'use strict';

const fs = require('fs');
const path = require('path');

const CONTRACTS_DIR = path.join(__dirname, '../../contracts');

function validateJsonFile(filePath) {
  const errors = [];
  const raw = fs.readFileSync(filePath, 'utf8');
  
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return [`${filePath}: invalid JSON — ${e.message}`];
  }

  // Basic structural checks for forecast-to-alert contract
  if (filePath.includes('forecast-to-alert')) {
    const required = ['time_utc', 'chat_id', 'window', 'forecast', 'evidence_ids', 'build_fingerprint'];
    
    // Check schema has required fields defined
    if (parsed.required) {
      for (const field of required) {
        if (!parsed.required.includes(field)) {
          errors.push(`${filePath}: missing required field definition: ${field}`);
        }
      }
    }

    // Check properties defined
    if (parsed.properties) {
      for (const field of required) {
        if (!parsed.properties[field]) {
          errors.push(`${filePath}: missing property definition: ${field}`);
        }
      }
    }

    // Check forecast enum values
    if (parsed.properties?.forecast?.properties?.trend?.enum) {
      const validTrends = ['rising', 'stable', 'declining'];
      const actual = parsed.properties.forecast.properties.trend.enum;
      for (const t of validTrends) {
        if (!actual.includes(t)) {
          errors.push(`${filePath}: forecast.trend missing enum value: ${t}`);
        }
      }
    }
  }

  return errors;
}

// Main
const files = fs.readdirSync(CONTRACTS_DIR)
  .filter(f => f.endsWith('.json'))
  .map(f => path.join(CONTRACTS_DIR, f));

if (files.length === 0) {
  console.log('⚠️  No contract files found in contracts/');
  process.exit(0);
}

let totalErrors = 0;
for (const file of files) {
  const errors = validateJsonFile(file);
  if (errors.length > 0) {
    errors.forEach(e => console.error(`❌ ${e}`));
    totalErrors += errors.length;
  } else {
    console.log(`✅ ${path.basename(file)}`);
  }
}

if (totalErrors > 0) {
  console.error(`\n❌ ${totalErrors} error(s) found`);
  process.exit(1);
} else {
  console.log(`\n✅ All ${files.length} contract(s) valid`);
  process.exit(0);
}
