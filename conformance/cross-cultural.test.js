const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { evaluate } = require("../core/evaluator");

function parseJsonl(file) {
  const raw = fs.readFileSync(file, "utf8");
  return raw.split(/\r?\n/).filter(Boolean).map((line, i) => {
    try { return JSON.parse(line); }
    catch (e) { throw new Error(`Invalid JSONL line ${i + 1}: ${e.message}`); }
  });
}

describe("Cross-Cultural Test Suite v1 — 54 vectors", () => {
  const file = path.join(process.cwd(), "golden", "cross-cultural-v1.jsonl");
  const vectors = parseJsonl(file);

  it("corpus has 54 vectors", () => {
    assert.equal(vectors.length, 54);
  });

  it("all 5 dimensions represented", () => {
    const dims = new Set(vectors.map(v => v.case_id.slice(0, 2)));
    assert.ok(dims.has("FR"), "missing FR");
    assert.ok(dims.has("DE"), "missing DE");
    assert.ok(dims.has("EA"), "missing EA");
    assert.ok(dims.has("OC"), "missing OC");
    assert.ok(dims.has("LM"), "missing LM");
  });

  it("all vectors run without throwing", () => {
    for (const v of vectors) {
      assert.doesNotThrow(() => { evaluate(v.text); }, `vector ${v.case_id} threw`);
    }
  });

  it("all outputs are valid objects with channels", () => {
    for (const v of vectors) {
      const out = evaluate(v.text);
      assert.ok(out && typeof out === "object", `${v.case_id}: not object`);
      assert.ok(out.channels, `${v.case_id}: missing channels`);
    }
  });

  it("trigger vectors produce some detection (baseline)", () => {
    const triggers = vectors.filter(v => v.should_trigger);
    let detected = 0;
    for (const v of triggers) {
      const out = evaluate(v.text);
      if (out.channels.push && out.channels.push.acri > 0) detected++;
    }
    assert.ok(detected >= 1, `Cross-cultural baseline: ${detected}/${triggers.length}`);
  });

  it("benign vectors mostly clean", () => {
    const benign = vectors.filter(v => !v.should_trigger);
    let clean = 0;
    for (const v of benign) {
      const out = evaluate(v.text);
      if (!out.channels.push || out.channels.push.acri === 0) clean++;
    }
    assert.ok(clean >= Math.floor(benign.length * 0.5), `Only ${clean}/${benign.length} clean`);
  });
});
