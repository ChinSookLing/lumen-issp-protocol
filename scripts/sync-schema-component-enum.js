#!/usr/bin/env node

/**
 * sync-schema-component-enum.js
 *
 * 從 core/*.js 自動抽取所有 component keys，
 * 更新 schemas/layer2a-mapping-v0.1.json 中的 enum，
 * 並確保 src/registry/component-registry.js 的 VALID_COMPONENTS_BY_PATTERN 與之對齊。
 *
 * 使用方式：
 *   node scripts/sync-schema-component-enum.js [--dry-run] [--update-registry]
 *
 * 選項：
 *   --dry-run         只顯示差異，不實際寫入檔案
 *   --update-registry 一併更新 component-registry.js（預設只更新 schema）
 *
 * 設計者：Node-03（Schema Architect / Code Designer）
 * 來源：M62 — MS-13.3 P0 交付
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const CORE_DIR = path.join(REPO_ROOT, 'core');
const SCHEMA_PATH = path.join(REPO_ROOT, 'schemas/layer2a-mapping-v0.1.json');
const REGISTRY_PATH = path.join(REPO_ROOT, 'src/registry/component-registry.js');

// Pattern 名稱對照（檔名 → registry 中的 key）
const PATTERN_MAP = {
  'dm.js': 'DM',
  'fc.js': 'FC',
  'mb.js': 'MB',
  'ea.js': 'EA',
  'ip.js': 'IP',
  'gc.js': 'GC',
  'ep.js': 'EP',
  'vs.js': 'VS',
  'class-0.js': 'Class-0',
};

/**
 * 從 core/*.js 抽取所有 component keys
 * 回傳 { patternName: [keys] }
 */
function extractComponentsFromCore() {
  const result = {};
  const files = fs.readdirSync(CORE_DIR).filter(f => f.endsWith('.js'));

  for (const file of files) {
    const pattern = PATTERN_MAP[file];
    if (!pattern) continue;

    const content = fs.readFileSync(path.join(CORE_DIR, file), 'utf-8');
    const matches = [...content.matchAll(/components\.([a-zA-Z_][a-zA-Z0-9_]*)/g)];
    const keys = [...new Set(matches.map(m => m[1]))].sort();
    result[pattern] = keys;
  }
  return result;
}

/**
 * 讀取現有 schema，回傳 { enum: [...] }
 */
function readSchemaEnum() {
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
  return schema.properties.component.enum;
}

/**
 * 寫入 schema enum
 */
function writeSchemaEnum(newEnum) {
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
  schema.properties.component.enum = newEnum;
  fs.writeFileSync(SCHEMA_PATH, JSON.stringify(schema, null, 2) + '\n');
  console.log(`✅ Updated ${SCHEMA_PATH}`);
}

/**
 * 更新 component-registry.js 中的 VALID_COMPONENTS_BY_PATTERN
 * 注意：此函數假設 registry 檔案有固定的格式，需要謹慎處理
 */
function updateRegistryFile(patternComponents) {
  let content = fs.readFileSync(REGISTRY_PATH, 'utf-8');

  // 正則找出 VALID_COMPONENTS_BY_PATTERN 物件區塊
  const regex = /(const VALID_COMPONENTS_BY_PATTERN = \{[\s\S]*?\};)/;
  const match = content.match(regex);
  if (!match) {
    console.error('❌ Could not locate VALID_COMPONENTS_BY_PATTERN in registry file');
    return false;
  }

  // 產生新的物件字串
  const newObj = {};
  for (const [pattern, keys] of Object.entries(patternComponents)) {
    newObj[pattern] = keys;
  }
  const newObjStr = JSON.stringify(newObj, null, 2)
    .replace(/"([^"]+)":/g, '$1:')   // 移除屬性名的引號（還原成 JS 物件）
    .replace(/"/g, "'");              // 雙引號轉單引號

  const newBlock = `const VALID_COMPONENTS_BY_PATTERN = ${newObjStr};`;
  content = content.replace(regex, newBlock);

  fs.writeFileSync(REGISTRY_PATH, content);
  console.log(`✅ Updated ${REGISTRY_PATH}`);
  return true;
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const shouldUpdateRegistry = args.includes('--update-registry');

  // 1. 從 core 抽取最新的 component keys
  const fromCore = extractComponentsFromCore();
  const allComponents = new Set();
  for (const keys of Object.values(fromCore)) {
    keys.forEach(k => allComponents.add(k));
  }
  const newEnum = Array.from(allComponents).sort();

  // 2. 讀取目前的 schema enum
  const currentEnum = readSchemaEnum();

  // 3. 比較
  const added = newEnum.filter(k => !currentEnum.includes(k));
  const removed = currentEnum.filter(k => !newEnum.includes(k));

  if (added.length === 0 && removed.length === 0) {
    console.log('✅ Schema enum is already up-to-date.');
  } else {
    console.log('⚠️  Schema enum differs from core components:');
    if (added.length) console.log('   + Added:', added.join(', '));
    if (removed.length) console.log('   - Removed:', removed.join(', '));

    if (!dryRun) {
      writeSchemaEnum(newEnum);
      if (shouldUpdateRegistry) {
        updateRegistryFile(fromCore);
      } else {
        console.log('ℹ️  Registry not updated (use --update-registry to update both)');
      }
    } else {
      console.log('ℹ️  Dry run – no files written.');
    }
  }
}

main();
