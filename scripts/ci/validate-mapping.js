#!/usr/bin/env node

/**
 * validate-mapping.js
 * 
 * 驗證 mappings/ 目錄下所有 JSON 檔案：
 * - JSON 語法合法性
 * - 必填欄位存在 + 合法值（pattern enum, language, version format）
 * - rule 結構正確
 * - regex 型別 patterns 為非空陣列 + 可編譯（RegExp）
 * - shared lexicon 結構正確
 * - component key 必須存在於 registry（避免靜默失效）
 * - 一般 mapping：component 必須屬於該 pattern 的 component list
 * - shared lexicon：components 的每個 key 必須存在於 registry
 * - reserved 類型不允許帶 patterns
 * - 空 mappings 禁止（防靜默無效）
 * 
 * 使用方式：
 *   node scripts/ci/validate-mapping.js
 *   node scripts/ci/validate-mapping.js --syntax-only
 * 
 * 原作者：Node-03
 * 補強 v1：Node-05（registry cross-check + reserved type guard + cross-platform path）
 * 補強 v2：Node-05 audit 缺口修補（regex compile + empty mapping + enum check）
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '../..');
const MAPPINGS_DIR = path.join(REPO_ROOT, 'mappings');
const REGISTRY_PATH = path.join(REPO_ROOT, 'src/registry/component-registry.js');

// 合法 pattern 清單
const VALID_PATTERNS = ['DM', 'FC', 'MB', 'EA', 'IP', 'GC', 'EP', 'VS', 'Class-0'];
// 合法語言清單（目前支援）
const VALID_LANGUAGES = ['en', 'zh'];
// 版本格式
const VERSION_REGEX = /^v\d+\.\d+\.\d+$/;

// ============================================
// Registry 載入與索引
// ============================================
function loadRegistry() {
  const registry = require(REGISTRY_PATH);
  if (!registry || typeof registry !== 'object') {
    throw new Error('component-registry.js did not export an object');
  }
  return registry;
}

function buildRegistryIndex(registry) {
  const byPattern = new Map();
  const all = new Set();
  const reg = registry.VALID_COMPONENTS_BY_PATTERN || registry;

  for (const [pattern, list] of Object.entries(reg)) {
    if (!Array.isArray(list)) continue;
    const set = new Set();
    for (const c of list) {
      if (typeof c === 'string') {
        set.add(c);
        all.add(c);
      }
    }
    byPattern.set(pattern, set);
  }

  return { byPattern, all };
}

function isSharedLexiconPath(filePath) {
  const rel = path.relative(MAPPINGS_DIR, filePath);
  const segs = rel.split(path.sep);
  return segs.length >= 2 && segs[0] === 'shared';
}

// ============================================
// Regex 編譯檢查
// ============================================
function tryCompileRegex(pattern) {
  try {
    new RegExp(pattern);
    return null;
  } catch (e) {
    return e.message;
  }
}

// ============================================
// 遍歷所有 JSON 檔案
// ============================================
function walkDir(dir, callback) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, callback);
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      callback(fullPath);
    }
  }
}

// ============================================
// 主要驗證邏輯
// ============================================
let hasError = false;
const args = process.argv.slice(2);
const syntaxOnly = args.includes('--syntax-only');

let registryIndex = null;
if (!syntaxOnly) {
  try {
    const registry = loadRegistry();
    registryIndex = buildRegistryIndex(registry);
  } catch (e) {
    console.error(`❌ Failed to load registry: ${e.message}`);
    process.exit(1);
  }
}

console.log('🔍 Validating mapping JSON files...');

walkDir(MAPPINGS_DIR, (filePath) => {
  const relPath = path.relative(REPO_ROOT, filePath);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(content);
    
    // 語法檢查通過
    if (syntaxOnly) {
      console.log(`✅ ${relPath} (syntax OK)`);
      return;
    }

    // shared lexicon 結構檢查
    if (isSharedLexiconPath(filePath)) {
      if (!parsed.lexicon || typeof parsed.lexicon !== 'object') {
        console.error(`❌ ${relPath}: missing 'lexicon' object for shared mapping`);
        hasError = true;
        return;
      }

      for (const [term, rule] of Object.entries(parsed.lexicon)) {
        if (!rule || typeof rule !== 'object') {
          console.error(`❌ ${relPath}: term '${term}' must be an object`);
          hasError = true;
          continue;
        }
        if (!rule.type) {
          console.error(`❌ ${relPath}: term '${term}' missing 'type'`);
          hasError = true;
        }
        if (!Array.isArray(rule.patterns) || rule.patterns.length === 0) {
          console.error(`❌ ${relPath}: term '${term}' patterns must be non-empty array`);
          hasError = true;
        } else {
          // 檢查每個 regex 是否可編譯
          for (const pat of rule.patterns) {
            const err = tryCompileRegex(pat);
            if (err) {
              console.error(`❌ ${relPath}: term '${term}' has invalid regex '${pat}': ${err}`);
              hasError = true;
            }
          }
        }
        if (!rule.components || typeof rule.components !== 'object') {
          console.error(`❌ ${relPath}: term '${term}' missing 'components' object`);
          hasError = true;
        } else {
          for (const [ck, w] of Object.entries(rule.components)) {
            if (!registryIndex.all.has(ck)) {
              console.error(`❌ ${relPath}: term '${term}' has unknown component key '${ck}'`);
              hasError = true;
            }
            if (typeof w !== 'number' || Number.isNaN(w) || w <= 0 || w > 1) {
              console.error(`❌ ${relPath}: term '${term}' component '${ck}' weight must be in (0,1]`);
              hasError = true;
            }
          }
        }
        if (!rule.note) {
          console.warn(`⚠️  ${relPath}: term '${term}' missing 'note'`);
        }
      }

      console.log(`✅ ${relPath}`);
      return;
    }

    // ======================================
    // 一般 pattern mapping
    // ======================================

    // 必填欄位
    const requiredFields = ['pattern', 'language', 'version', 'mappings', 'meta'];
    for (const field of requiredFields) {
      if (parsed[field] === undefined) {
        console.error(`❌ ${relPath}: missing required field '${field}'`);
        hasError = true;
      }
    }

    // [缺口 2] pattern enum 檢查
    if (parsed.pattern && !VALID_PATTERNS.includes(parsed.pattern)) {
      console.error(`❌ ${relPath}: invalid pattern '${parsed.pattern}' (allowed: ${VALID_PATTERNS.join(', ')})`);
      hasError = true;
    }

    // [缺口 2] language enum 檢查
    if (parsed.language && !VALID_LANGUAGES.includes(parsed.language)) {
      console.error(`❌ ${relPath}: invalid language '${parsed.language}' (allowed: ${VALID_LANGUAGES.join(', ')})`);
      hasError = true;
    }

    // [缺口 2] version 格式檢查
    if (parsed.version && !VERSION_REGEX.test(parsed.version)) {
      console.error(`❌ ${relPath}: invalid version format '${parsed.version}' (expected: vX.Y.Z)`);
      hasError = true;
    }

    const pattern = parsed.pattern;
    const validComponentsForPattern = registryIndex.byPattern.get(pattern);
    if (pattern && !validComponentsForPattern) {
      console.error(`❌ ${relPath}: unknown pattern '${pattern}' (not found in registry)`);
      hasError = true;
    }

    // [缺口 4] 空 mapping 禁止
    const mappingEntries = Object.entries(parsed.mappings || {});
    if (mappingEntries.length === 0) {
      console.error(`❌ ${relPath}: mappings is empty (file exists but has no rules — silent no-op)`);
      hasError = true;
    }

    // rule 結構檢查
    for (const [ruleId, rule] of mappingEntries) {
      if (!rule || typeof rule !== 'object') {
        console.error(`❌ ${relPath}: rule '${ruleId}' must be an object`);
        hasError = true;
        continue;
      }
      if (!rule.type) {
        console.error(`❌ ${relPath}: rule '${ruleId}' missing 'type'`);
        hasError = true;
      }
      if (!rule.component) {
        console.error(`❌ ${relPath}: rule '${ruleId}' missing 'component'`);
        hasError = true;
      } else {
        // component 必須存在於 registry
        if (!registryIndex.all.has(rule.component)) {
          console.error(`❌ ${relPath}: rule '${ruleId}' uses unknown component '${rule.component}'`);
          hasError = true;
        }
        // component 必須屬於該 pattern
        else if (validComponentsForPattern && !validComponentsForPattern.has(rule.component)) {
          console.error(`❌ ${relPath}: rule '${ruleId}' component '${rule.component}' not allowed for pattern '${pattern}'`);
          hasError = true;
        }
      }

      // reserved 類型不允許帶 patterns
      const isReserved = rule.type === 'reserved_llm_hint' || rule.type === 'reserved_composite';
      if (isReserved && rule.patterns !== undefined) {
        console.error(`❌ ${relPath}: rule '${ruleId}' is reserved type but has 'patterns'`);
        hasError = true;
      }

      // [缺口 3] regex 必須可編譯
      if (!isReserved && rule.type === 'regex') {
        if (!Array.isArray(rule.patterns) || rule.patterns.length === 0) {
          console.error(`❌ ${relPath}: rule '${ruleId}' patterns must be non-empty array for regex type`);
          hasError = true;
        } else {
          for (const pat of rule.patterns) {
            if (typeof pat !== 'string' || pat.trim() === '') {
              console.error(`❌ ${relPath}: rule '${ruleId}' has empty pattern string`);
              hasError = true;
            } else {
              const err = tryCompileRegex(pat);
              if (err) {
                console.error(`❌ ${relPath}: rule '${ruleId}' has invalid regex '${pat}': ${err}`);
                hasError = true;
              }
            }
          }
        }
      }

      if (rule.weight !== undefined && (typeof rule.weight !== 'number' || rule.weight < 0 || rule.weight > 1)) {
        console.error(`❌ ${relPath}: rule '${ruleId}' weight must be a number between 0 and 1`);
        hasError = true;
      }
    }

    console.log(`✅ ${relPath}`);
    
  } catch (e) {
    console.error(`❌ ${relPath}: invalid JSON - ${e.message}`);
    hasError = true;
  }
});

if (hasError) {
  console.error('\n❌ Mapping validation failed.');
  process.exit(1);
} else {
  console.log('\n✅ All mapping JSON files are valid.');
}
