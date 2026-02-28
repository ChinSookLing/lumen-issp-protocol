const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const { validateOutput } = require("../src/forecast/explanation-engine");
const { copyLint, buildSignalSummary } = require("../src/output/output-envelope");

const vectorsPath = path.resolve(__dirname, "fixtures/redline-regression-vectors.json");
const matrixPath = path.resolve(__dirname, "../config/redline-coverage-matrix.v1.json");

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

describe("Red-line regression vectors", () => {
  const vectors = loadJson(vectorsPath);

  it("explanation output vectors stay compliant", () => {
    for (const row of vectors.explanation_validate_output) {
      const result = validateOutput(row.text);
      assert.equal(
        result.clean,
        row.expect_clean,
        `vector ${row.id} mismatch: expected clean=${row.expect_clean}, got clean=${result.clean}`
      );
    }
  });

  it("copy lint vectors keep anti-weaponization/anti-labeling guard", () => {
    for (const row of vectors.output_copy_lint) {
      const errors = copyLint(row.text);
      const hasErrors = errors.length > 0;
      assert.equal(
        hasErrors,
        row.expect_errors,
        `vector ${row.id} mismatch: expected errors=${row.expect_errors}, got errors=${hasErrors}`
      );
    }
  });

  it("signal summary always includes signal keyword", () => {
    const summary = buildSignalSummary([{ id: "EP", score: 0.8 }], 2, 0.8);
    assert.match(summary.toLowerCase(), /signal/);
  });
});

describe("Red-line coverage matrix integrity", () => {
  const matrix = loadJson(matrixPath);

  it("required clause ids exist in entries", () => {
    const ids = new Set(matrix.entries.map((x) => x.clause_id));
    for (const required of matrix.required_clause_ids) {
      assert.equal(ids.has(required), true, `missing required clause in matrix: ${required}`);
    }
  });

  it("every clause keeps rule, test, and evidence refs", () => {
    for (const row of matrix.entries) {
      assert.ok(Array.isArray(row.rule_refs) && row.rule_refs.length > 0, `${row.clause_id} missing rule_refs`);
      assert.ok(Array.isArray(row.test_refs) && row.test_refs.length > 0, `${row.clause_id} missing test_refs`);
      assert.ok(
        Array.isArray(row.evidence_refs) && row.evidence_refs.length > 0,
        `${row.clause_id} missing evidence_refs`
      );
    }
  });
});