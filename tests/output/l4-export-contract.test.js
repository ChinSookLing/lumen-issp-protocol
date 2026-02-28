const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function loadJson(relPath) {
  const p = path.resolve(process.cwd(), relPath);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

// Optional: use Ajv if present in repo deps.
let Ajv = null;
try {
  Ajv = require('ajv');
} catch (_) {
  Ajv = null;
}

function validateWithAjv(schema, data) {
  if (!Ajv) return { ok: null, errors: ["Ajv not installed"] };
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);
  const ok = validate(data);
  return { ok, errors: validate.errors || [] };
}

function minimalTierChecks(doc) {
  const base = [
    "schema_version","export_id","created_at_utc","tier","scenario","time_scale",
    "engine_version","policy_version","schema_set","evidence_refs","signals",
    "contains_raw_text","disclaimer"
  ];
  for (const k of base) assert.ok(k in doc, `missing field: ${k}`);

  assert.ok(Array.isArray(doc.evidence_refs) && doc.evidence_refs.length > 0, "evidence_refs must be non-empty");

  if (doc.tier === "TIER_0") {
    assert.equal(doc.contains_raw_text, false, "TIER_0 must not contain raw text");
  }
  if (doc.tier === "TIER_1") {
    assert.equal(doc.contains_raw_text, false, "TIER_1 must not contain raw text");
    assert.equal(doc.hitl_trigger, true, "TIER_1 requires hitl_trigger=true");
    assert.equal(doc.redaction_passed, true, "TIER_1 requires redaction_passed=true");
    assert.equal(doc.pii_redaction_applied, true, "TIER_1 requires pii_redaction_applied=true");
    assert.ok(typeof doc.access_log_ref === "string" && doc.access_log_ref.length > 0, "TIER_1 requires access_log_ref");
  }
  if (doc.tier === "TIER_2") {
    assert.ok(typeof doc.access_log_ref === "string" && doc.access_log_ref.length > 0, "TIER_2 requires access_log_ref");
    assert.ok(Number.isInteger(doc.ttl_days) && doc.ttl_days >= 1, "TIER_2 requires ttl_days >= 1");
    assert.ok(doc.encryption && doc.encryption.enabled === true, "TIER_2 requires encryption.enabled=true");
    assert.ok(doc.legal_basis || doc.council_authorization_ref, "TIER_2 requires legal_basis OR council_authorization_ref");
  }
}

test("L4 Export schema file parses", () => {
  const schema = loadJson("schemas/l4-export-v0.1.json");
  assert.equal(schema.title, "L4 Export Envelope v0.1");
});

test("Tier 0 export sample passes contract checks", () => {
  const schema = loadJson("schemas/l4-export-v0.1.json");
  const sample = loadJson("tests/fixtures/l4-export-tier0.sample.json");

  const ajvRes = validateWithAjv(schema, sample);
  if (ajvRes.ok === false) assert.fail(`Ajv schema validation failed: ${JSON.stringify(ajvRes.errors)}`);

  minimalTierChecks(sample);
  assert.equal(sample.tier, "TIER_0");
});

test("Tier 1 export sample enforces HITL + redaction + access log", () => {
  const schema = loadJson("schemas/l4-export-v0.1.json");
  const sample = loadJson("tests/fixtures/l4-export-tier1.sample.json");

  const ajvRes = validateWithAjv(schema, sample);
  if (ajvRes.ok === false) assert.fail(`Ajv schema validation failed: ${JSON.stringify(ajvRes.errors)}`);

  minimalTierChecks(sample);
  assert.equal(sample.tier, "TIER_1");
});

test("Tier 2 export sample validates required authorization + encryption + TTL", () => {
  const schema = loadJson("schemas/l4-export-v0.1.json");
  const sample = loadJson("tests/fixtures/l4-export-tier2.sample.json");

  const ajvRes = validateWithAjv(schema, sample);
  if (ajvRes.ok === false) assert.fail(`Ajv schema validation failed: ${JSON.stringify(ajvRes.errors)}`);

  minimalTierChecks(sample);
  assert.equal(sample.tier, "TIER_2");
});
