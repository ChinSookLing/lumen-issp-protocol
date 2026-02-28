#!/usr/bin/env node

/**
 * validate-registry.js
 * 
 * 驗證 core/*.js 的 component keys 與 registry 一致，
 * 並確保 schema enum 與 registry 聯集一致。
 * 新增：跨 pattern 重複 component key 檢查（治理規則：每個 component 只能屬於一個 Pattern）
 * 
 * 使用方式：
 *   node scripts/ci/validate-registry.js
 *   node scripts/ci/validate-registry.js --check-schema
 * 
 * 原作者：Node-03
 * 補強：Node-05（跨 pattern 重複檢查）
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '../..');
const REGISTRY_PATH = path.join(REPO_ROOT, 'src/registry/component-registry.js');
const SCHEMA_PATH = path.join(REPO_ROOT, 'schemas/layer2a-mapping-v0.1.json');
const CORE_DIR = path.join(REPO_ROOT, 'core');
const MAPPINGS_DIR = path.join(REPO_ROOT, 'mappings');

// 載入 registry
let registry;
try {
  registry = require(REGISTRY_PATH);
} catch (e) {
  console.error('❌ Failed to load component-registry.js');
  process.exit(1);
}
const VALID_COMPONENTS_BY_PATTERN = registry.VALID_COMPONENTS_BY_PATTERN;

// 所有合法的 component key（全域集合）+ 跨 pattern 重複檢查
const ALL_VALID_COMPONENTS = new Set();
const ownerByComponent = new Map(); // component -> pattern

// ============================================
// 0. 跨 Pattern 重複 component key 檢查
// ============================================
function validateNoCrossPatternDuplicates() {
  console.log('\n🔍 Checking for cross-pattern duplicate component keys...');
  let hasError = false;

  for (const [pattern, compList] of Object.entries(VALID_COMPONENTS_BY_PATTERN)) {
    if (!Array.isArray(compList)) {
      console.error(`❌ registry pattern ${pattern} must be an array`);
      hasError = true;
      continue;
    }
    for (const c of compList) {
      if (typeof c !== 'string') {
        console.error(`❌ registry pattern ${pattern} has non-string component`);
        hasError = true;
        continue;
      }
      if (ownerByComponent.has(c)) {
        const prev = ownerByComponent.get(c);
        console.error(
          `❌ component key duplicated across patterns: '${c}' in '${prev}' and '${pattern}'`
        );
        hasError = true;
      } else {
        ownerByComponent.set(c, pattern);
      }
      ALL_VALID_COMPONENTS.add(c);
    }
  }

  if (!hasError) {
    console.log('✅ No cross-pattern duplicate component keys');
  }
  return !hasError;
}

// ============================================
// 1. 檢查 core/*.js 與 registry 一致
// ============================================
function validateCoreAgainstRegistry() {
  console.log('\n🔍 Checking core/*.js vs registry...');
  let hasError = false;
  const coreFiles = fs.readdirSync(CORE_DIR).filter(f => f.endsWith('.js'));

  for (const file of coreFiles) {
    const patternName = path.basename(file, '.js');
    // 處理 Class-0 特例
    const patternKey = patternName === 'class-0' ? 'Class-0' : patternName.toUpperCase();
    
    if (!VALID_COMPONENTS_BY_PATTERN[patternKey]) {
      console.warn(`⚠️  Pattern ${patternKey} not found in registry, skipping`);
      continue;
    }

    const content = fs.readFileSync(path.join(CORE_DIR, file), 'utf-8');
    // 抓取 components.xxx 模式
    const matches = [...content.matchAll(/components\.([a-zA-Z_][a-zA-Z0-9_]*)/g)];
    const usedKeys = [...new Set(matches.map(m => m[1]))].sort();

    const expectedKeys = VALID_COMPONENTS_BY_PATTERN[patternKey].sort();

    // 檢查多餘或遺漏的 key
    const extra = usedKeys.filter(k => !expectedKeys.includes(k));
    const missing = expectedKeys.filter(k => !usedKeys.includes(k));

    if (extra.length > 0 || missing.length > 0) {
      console.error(`❌ Pattern ${patternKey} mismatch:`);
      if (extra.length) console.error(`   Extra keys in core: ${extra.join(', ')}`);
      if (missing.length) console.error(`   Missing keys in core: ${missing.join(', ')}`);
      hasError = true;
    } else {
      console.log(`✅ ${patternKey} OK`);
    }
  }

  return !hasError;
}

// ============================================
// 2. 檢查 schema enum 與 registry 一致
// ============================================
function validateSchemaEnum() {
  console.log('\n🔍 Checking schema enum vs registry...');
  try {
    const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
    const schemaEnum = schema?.properties?.component?.enum;
    if (!schemaEnum) {
      console.warn('⚠️  No component/pattern enum found in schema, skipping enum check');
      return true;
    }
    
    const registryComponents = [...ALL_VALID_COMPONENTS].sort();
    const schemaComponents = schemaEnum.sort();

    const extraInSchema = schemaComponents.filter(c => !registryComponents.includes(c));
    const missingInSchema = registryComponents.filter(c => !schemaComponents.includes(c));

    if (extraInSchema.length > 0 || missingInSchema.length > 0) {
      if (extraInSchema.length) console.error(`❌ Extra components in schema: ${extraInSchema.join(', ')}`);
      if (missingInSchema.length) console.error(`❌ Missing components in schema: ${missingInSchema.join(', ')}`);
      return false;
    }
    console.log('✅ Schema enum matches registry');
    return true;
  } catch (e) {
    console.error(`❌ Failed to parse schema JSON: ${e.message}`);
    return false;
  }
}

// ============================================
// 3. 檢查所有 mapping 檔案的 component 合法性
// ============================================
function validateMappingsComponentKeys() {
  console.log('\n🔍 Checking mappings/*.json component keys...');
  let hasError = false;

  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        try {
          const content = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
          
          // 跨平台 shared 路徑判定
          const rel = path.relative(MAPPINGS_DIR, fullPath);
          const segs = rel.split(path.sep);
          const isShared = segs.length >= 2 && segs[0] === 'shared';

          if (isShared) {
            // shared lexicon 特殊處理
            if (content.lexicon) {
              for (const [term, rule] of Object.entries(content.lexicon)) {
                if (rule.components) {
                  for (const compKey of Object.keys(rule.components)) {
                    if (!ALL_VALID_COMPONENTS.has(compKey)) {
                      console.error(`❌ ${fullPath}: ${term} uses unknown component '${compKey}'`);
                      hasError = true;
                    }
                  }
                }
              }
            }
          } else {
            // 一般 pattern mapping
            const pattern = content.pattern;
            const validForPattern = VALID_COMPONENTS_BY_PATTERN[pattern] || [];
            
            if (!VALID_COMPONENTS_BY_PATTERN[pattern]) {
              console.error(`❌ ${fullPath}: unknown pattern '${pattern}' (not in registry)`);
              hasError = true;
            }

            for (const [ruleId, rule] of Object.entries(content.mappings || {})) {
              // component 必須存在於 registry
              if (!ALL_VALID_COMPONENTS.has(rule.component)) {
                console.error(`❌ ${fullPath}: rule '${ruleId}' uses unknown component '${rule.component}'`);
                hasError = true;
              }
              // component 必須屬於該 pattern
              else if (!validForPattern.includes(rule.component)) {
                console.error(`❌ ${fullPath}: rule '${ruleId}' component '${rule.component}' not allowed for pattern '${pattern}'`);
                hasError = true;
              }

              // reserved 類型不允許帶 patterns
              const isReserved = rule.type === 'reserved_llm_hint' || rule.type === 'reserved_composite';
              if (isReserved && rule.patterns !== undefined) {
                console.error(`❌ ${fullPath}: rule '${ruleId}' is reserved type but has 'patterns'`);
                hasError = true;
              }
            }
          }
        } catch (e) {
          console.error(`❌ ${fullPath}: invalid JSON - ${e.message}`);
          hasError = true;
        }
      }
    }
  }

  walkDir(MAPPINGS_DIR);
  return !hasError;
}

// ============================================
// 主程式
// ============================================
async function main() {
  const args = process.argv.slice(2);
  let exitCode = 0;

  if (!validateNoCrossPatternDuplicates()) exitCode = 1;
  if (!validateCoreAgainstRegistry()) exitCode = 1;
  if (args.includes('--check-schema')) {
    if (!validateSchemaEnum()) exitCode = 1;
  }
  if (!validateMappingsComponentKeys()) exitCode = 1;

  if (exitCode === 0) {
    console.log('\n✅ All registry validation passed.');
  } else {
    console.error('\n❌ Registry validation failed.');
  }
  process.exit(exitCode);
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
