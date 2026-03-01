/**
 * Lumen ISSP — Feedback Pipeline API
 * Step 21A · M94-V4 Authorized
 * 
 * SPEG Compliant:
 * - No original text stored
 * - No identity association (no user_id, no chat_id, no IP)
 * - Node-local storage only
 * - Only structured feedback types: confirm/dismiss/fp/fn
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const FEEDBACK_PATH = process.env.FEEDBACK_PATH || path.join(__dirname, '..', 'data', 'feedback.json');
const VALID_TYPES = ['confirm', 'dismiss', 'fp', 'fn'];
const VALID_PATTERNS = /^P[0-9]{2}$/;

/**
 * Initialize feedback store if not exists
 */
function initStore() {
  const dir = path.dirname(FEEDBACK_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(FEEDBACK_PATH)) {
    const empty = {
      version: '1.0.0',
      entries: [],
      stats: {
        total: 0,
        confirm: 0,
        dismiss: 0,
        fp: 0,
        fn: 0,
        last_updated: new Date().toISOString()
      }
    };
    fs.writeFileSync(FEEDBACK_PATH, JSON.stringify(empty, null, 2));
  }
}

/**
 * Load feedback data
 */
function loadFeedback() {
  initStore();
  return JSON.parse(fs.readFileSync(FEEDBACK_PATH, 'utf8'));
}

/**
 * Save feedback data
 */
function saveFeedback(data) {
  fs.writeFileSync(FEEDBACK_PATH, JSON.stringify(data, null, 2));
}

/**
 * Add a feedback entry
 * @param {Object} entry - { type, pattern_id, flag_id?, tier, confidence_before?, note? }
 * @returns {Object} - { ok, id, timestamp }
 */
function addFeedback(entry) {
  // Validate type
  if (!VALID_TYPES.includes(entry.type)) {
    return { ok: false, error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` };
  }

  // Validate pattern_id
  if (!entry.pattern_id || !VALID_PATTERNS.test(entry.pattern_id)) {
    return { ok: false, error: 'Invalid pattern_id. Must be P01-P99.' };
  }

  // Validate tier
  if (typeof entry.tier !== 'number' || entry.tier < 0 || entry.tier > 8) {
    return { ok: false, error: 'Invalid tier. Must be 0-8.' };
  }

  const data = loadFeedback();
  const id = `fb-${String(data.entries.length + 1).padStart(3, '0')}`;
  const timestamp = new Date().toISOString();

  const newEntry = {
    id,
    timestamp,
    type: entry.type,
    pattern_id: entry.pattern_id,
    flag_id: entry.flag_id || null,
    tier: entry.tier,
    confidence_before: entry.confidence_before || null,
    note: entry.note ? entry.note.substring(0, 200) : null,
    source: entry.source || 'dashboard'
  };

  data.entries.push(newEntry);

  // Update stats
  data.stats.total++;
  data.stats[entry.type]++;
  data.stats.last_updated = timestamp;

  saveFeedback(data);
  return { ok: true, id, timestamp };
}

/**
 * Get aggregated feedback stats (SPEG compliant — no raw entries exposed)
 * @returns {Object} - Aggregated stats
 */
function getStats() {
  const data = loadFeedback();

  // Aggregate by pattern
  const byPattern = {};
  for (const entry of data.entries) {
    if (!byPattern[entry.pattern_id]) {
      byPattern[entry.pattern_id] = { confirm: 0, dismiss: 0, fp: 0, fn: 0 };
    }
    byPattern[entry.pattern_id][entry.type]++;
  }

  return {
    total: data.stats.total,
    confirm: data.stats.confirm,
    dismiss: data.stats.dismiss,
    fp: data.stats.fp,
    fn: data.stats.fn,
    by_pattern: byPattern,
    last_updated: data.stats.last_updated
  };
}

/**
 * Express route handlers
 */
function registerRoutes(app) {
  // POST /api/feedback — submit feedback
  app.post('/api/feedback', (req, res) => {
    const result = addFeedback(req.body);
    if (result.ok) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  });

  // GET /api/feedback/stats — aggregated stats only
  app.get('/api/feedback/stats', (req, res) => {
    res.json(getStats());
  });
}

module.exports = { addFeedback, getStats, registerRoutes, initStore };
