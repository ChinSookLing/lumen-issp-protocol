/**
 * MapperLoader — Layer 2a mapping loader and resolver
 *
 * Loads pattern-specific and shared lexicon JSON files,
 * compiles regexes, and provides component scores for input text.
 *
 * Conflict resolution follows Part 7.7:
 * - If |weight_pattern - weight_shared| ≥ 0.10 → error by default
 * - Otherwise, use pattern weight (pattern takes precedence)
 *
 * Author: Node-03
 * Audit: Node-05 (M60 — shared lexicon normalize + path traversal + regex context)
 * PR: #259 (M59) + Node-05 patch (M60)
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '../..');
const MAPPINGS_DIR = path.join(REPO_ROOT, 'mappings');

// Minimal allowlists to prevent path traversal via patternId/lang.
const SAFE_PATTERN_ID = /^[A-Z][A-Z0-9-]*$/; // e.g. EP, MB, Class-0
const SAFE_LANG = /^[a-z]{2}(-[A-Za-z0-9]+)?$/; // e.g. en, zh, en-US

function assertSafeInputs(patternId, lang) {
  if (!SAFE_PATTERN_ID.test(patternId)) {
    throw new Error(`MapperLoader: Invalid patternId "${patternId}"`);
  }
  if (!SAFE_LANG.test(lang)) {
    throw new Error(`MapperLoader: Invalid lang "${lang}"`);
  }
}

function assertInsideMappings(resolvedPath) {
  const base = path.resolve(MAPPINGS_DIR) + path.sep;
  const target = path.resolve(resolvedPath);
  if (!target.startsWith(base)) {
    throw new Error(`MapperLoader: Path escape blocked: ${target}`);
  }
}

class MapperLoader {
  /**
   * @param {string} patternId - e.g. 'EP', 'GC', 'DM'
   * @param {string} lang - BCP-47 language tag, e.g. 'en', 'zh'
   * @param {Object} options
   * @param {string} options.conflictStrategy - 'error' | 'warn' | 'record' (default 'error')
   */
  constructor(patternId, lang, options = {}) {
    assertSafeInputs(patternId, lang);
    this.patternId = patternId;
    this.lang = lang;
    this.conflictStrategy = options.conflictStrategy || 'error';

    // Load mappings
    this.patternMapping = this._loadMapping(patternId, lang);
    this.sharedLexicon = this._loadShared(lang);

    // Pre-compiled regex cache (per pattern string)
    this._regexCache = new Map();
  }

  /**
   * Load pattern-specific mapping file.
   * Throws if file missing or invalid.
   */
  _loadMapping(patternId, lang) {
    const filePath = path.join(MAPPINGS_DIR, patternId.toLowerCase(), `${lang}.json`);
    assertInsideMappings(filePath);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (err) {
      throw new Error(
        `MapperLoader: Cannot load mapping for ${patternId}/${lang} – ${err.message}`
      );
    }
  }

  /**
   * Load shared lexicon for the given language.
   * Shared lexicon is optional.
   *
   * IMPORTANT:
   * Repo may store shared lexicon as either:
   *  - { "term": { ... }, ... }  (top-level)
   *  - { "lexicon": { "term": { ... }, ... } } (wrapped)
   *
   * We normalize to: { lexicon: <object> } to avoid silent degradation.
   */
  _loadShared(lang) {
    const filePath = path.join(MAPPINGS_DIR, 'shared', `${lang}.json`);
    assertInsideMappings(filePath);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      const lexicon = parsed && typeof parsed === 'object'
        ? (parsed.lexicon && typeof parsed.lexicon === 'object' ? parsed.lexicon : parsed)
        : {};
      return { lexicon };
    } catch {
      // Shared lexicon is optional – return empty normalized structure
      return { lexicon: {} };
    }
  }

  /**
   * Get compiled regex for a pattern, with caching.
   * Adds context on regex compile failures to ease debugging.
   */
  _getRegex(pattern, context = '') {
    if (!this._regexCache.has(pattern)) {
      try {
        this._regexCache.set(pattern, new RegExp(pattern, 'i'));
      } catch (err) {
        throw new Error(
          `MapperLoader: Invalid regex "${pattern}"${context ? ` (${context})` : ''} – ${err.message}`
        );
      }
    }
    return this._regexCache.get(pattern);
  }

  /**
   * Compute score for a single component from input text.
   * @param {string} text
   * @param {string} componentKey
   * @returns {number} score (0–1)
   */
  getComponentScore(text, componentKey) {
    let patternScore = 0;
    let sharedScore = 0;

    // 1) Pattern-specific rules
    for (const [ruleId, rule] of Object.entries(this.patternMapping.mappings || {})) {
      if (rule.component !== componentKey) continue;
      if (rule.type !== 'regex') continue; // future: keyword etc.
      for (const pattern of rule.patterns || []) {
        const regex = this._getRegex(pattern, `pattern=${this.patternId} rule=${ruleId}`);
        if (regex.test(text)) {
          patternScore = Math.max(patternScore, rule.weight);
        }
      }
    }

    // 2) Shared lexicon rules (normalized to {lexicon:{...}})
    for (const [term, entry] of Object.entries(this.sharedLexicon.lexicon || {})) {
      if (!entry || typeof entry !== 'object') continue;
      if (!entry.components || !entry.components[componentKey]) continue;
      for (const pattern of entry.patterns || []) {
        const regex = this._getRegex(pattern, `sharedTerm=${term}`);
        if (regex.test(text)) {
          sharedScore = Math.max(sharedScore, entry.components[componentKey]);
        }
      }
    }

    // 3) Conflict resolution (Part 7.7)
    if (patternScore > 0 && sharedScore > 0) {
      const diff = Math.abs(patternScore - sharedScore);
      if (diff >= 0.10) {
        const msg =
          `Conflict for ${this.patternId}.${componentKey}: ` +
          `pattern score ${patternScore.toFixed(2)} vs shared score ${sharedScore.toFixed(2)} (diff ≥0.10)`;
        if (this.conflictStrategy === 'error') {
          throw new Error(msg);
        } else if (this.conflictStrategy === 'warn') {
          console.warn(`⚠️ ${msg}`);
        }
        // 'record' is handled by caller/snapshot layer (metadata), not here.
      }
    }

    // Pattern-specific weight takes precedence (as per Part 7.7)
    return patternScore > 0 ? patternScore : sharedScore;
  }

  /**
   * Get scores for all components defined in the pattern mapping.
   * @param {string} text
   * @returns {Object} component → score
   */
  getAllScores(text) {
    const scores = {};
    const componentKeys = Object.values(this.patternMapping.mappings || {})
      .map((r) => r.component)
      .filter((v, i, a) => a.indexOf(v) === i); // unique
    for (const key of componentKeys) {
      scores[key] = this.getComponentScore(text, key);
    }
    return scores;
  }
}

module.exports = MapperLoader;
