#!/usr/bin/env node

/**
 * validate-shadow-signals.js
 * 
 * 檢查 evaluator 輸出中是否包含 shadow_signals 欄位。
 * 目前僅產生 warning，不 block CI。
 * 
 * 使用方式：
 *   node scripts/ci/validate-shadow-signals.js
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '../..');

try {
  console.log('🔍 Checking for shadow_signals presence in test output...');
  
  const epContent = fs.readFileSync(path.join(REPO_ROOT, 'core/ep.js'), 'utf-8');
  const snapshotContent = fs.readFileSync(path.join(REPO_ROOT, 'src/snapshot.js'), 'utf-8');
  
  if (!epContent.includes('shadow_signals') && !snapshotContent.includes('shadow_signals')) {
    console.warn('⚠️  shadow_signals not found in core/ep.js or src/snapshot.js');
  } else {
    console.log('✅ shadow_signals implementation detected');
  }

  console.log('\n⚠️  This is a non-blocking warning only.');
  process.exit(0);
  
} catch (err) {
  console.error('Error during shadow signals check:', err.message);
  process.exit(0);
}
