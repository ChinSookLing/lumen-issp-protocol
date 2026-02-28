const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  MODES,
  checkActivation,
  validateOutput,
  generateExplanation,
  MIN_HISTORICAL_CASES,
} = require("../../src/forecast/explanation-engine");

// ============================================================
// A. Mode Gate Tests (OFF / SAFE / FULL)
// ============================================================
describe("Explanation Mode Gate", () => {
  const fakeForecast = { pattern: "MB", trendBand: "MEDIUM", slope: 0.02 };

  it("OFF mode — always returns not allowed", () => {
    const r = checkActivation({ forecast: fakeForecast, historicalCases: 100, mode: MODES.OFF });
    assert.equal(r.allowed, false);
    assert.ok(r.reason.includes("OFF"));
  });

  it("SAFE mode — allowed when forecast + enough cases", () => {
    const r = checkActivation({ forecast: fakeForecast, historicalCases: 30, mode: MODES.SAFE });
    assert.equal(r.allowed, true);
    assert.ok(r.reason.includes("SAFE"));
  });

  it("FULL mode — allowed but requires human sign-off", () => {
    const r = checkActivation({ forecast: fakeForecast, historicalCases: 30, mode: MODES.FULL });
    assert.equal(r.allowed, true);
    assert.ok(r.reason.includes("FULL"));
  });

  it("No forecast — not allowed even in SAFE mode", () => {
    const r = checkActivation({ forecast: null, historicalCases: 100, mode: MODES.SAFE });
    assert.equal(r.allowed, false);
    assert.ok(r.reason.includes("Forecast must trigger first"));
  });

  it("Insufficient historical cases — not allowed", () => {
    const r = checkActivation({ forecast: fakeForecast, historicalCases: 2, mode: MODES.SAFE });
    assert.equal(r.allowed, false);
    assert.ok(r.reason.includes("at least"));
  });
});

// ============================================================
// B. Anti-Labeling Validation (§2.6)
// ============================================================
describe("Anti-Labeling Output Validation", () => {
  it("clean text passes", () => {
    const r = validateOutput("Structure MB shows increasing trend");
    assert.equal(r.clean, true);
    assert.equal(r.violations.length, 0);
  });

  it("'you are' detected as violation", () => {
    const r = validateOutput("You are manipulating others");
    assert.equal(r.clean, false);
    assert.ok(r.violations.length > 0);
  });

  it("'you should' detected as violation", () => {
    const r = validateOutput("You should block this person");
    assert.equal(r.clean, false);
  });

  it("'this person' detected as violation", () => {
    const r = validateOutput("This person is dangerous");
    assert.equal(r.clean, false);
  });

  it("'the manipulator' detected as violation", () => {
    const r = validateOutput("The manipulator uses guilt");
    assert.equal(r.clean, false);
  });
});

// ============================================================
// C. SAFE Mode Output Tests (§7.9 compliance)
// ============================================================
describe("SAFE Mode Explanation Generation", () => {
  const fakeForecast = { pattern: "MB", trendBand: "HIGH", slope: 0.045 };
  const fakeEvidence = [
    { source: "evt_001", description: "guilt_invoke component elevated" },
    { source: "evt_002", description: "collective_pressure component detected" },
  ];

  it("OFF mode — returns null", () => {
    const r = generateExplanation({
      forecast: fakeForecast, evidence: fakeEvidence,
      mode: MODES.OFF, historicalCases: 50,
    });
    assert.equal(r, null);
  });

  it("SAFE mode — returns structured explanation", () => {
    const r = generateExplanation({
      forecast: fakeForecast, evidence: fakeEvidence,
      mode: MODES.SAFE, historicalCases: 50,
    });
    assert.notEqual(r, null);
    assert.equal(r.mode, "SAFE");
  });

  it("§7.9.1 — hypothesis marked as ISSP_REASONING_HYPOTHESIS", () => {
    const r = generateExplanation({
      forecast: fakeForecast, evidence: fakeEvidence,
      mode: MODES.SAFE, historicalCases: 50,
    });
    assert.ok(r.hypothesis.includes("[ISSP_REASONING_HYPOTHESIS]"));
  });

  it("§7.9.2 — at least one alternative hypothesis", () => {
    const r = generateExplanation({
      forecast: fakeForecast, evidence: fakeEvidence,
      mode: MODES.SAFE, historicalCases: 50,
    });
    assert.ok(r.alternative_hypotheses.length >= 1);
    assert.ok(r.alternative_hypotheses[0].includes("[ISSP_REASONING_HYPOTHESIS]"));
  });

  it("§7.9.3 — evidence is traceable", () => {
    const r = generateExplanation({
      forecast: fakeForecast, evidence: fakeEvidence,
      mode: MODES.SAFE, historicalCases: 50,
    });
    assert.equal(r.evidence.length, 2);
    assert.ok(r.evidence[0].source);
    assert.ok(r.evidence[0].description);
  });

  it("§7.9.4 — requires human review flag set", () => {
    const r = generateExplanation({
      forecast: fakeForecast, evidence: fakeEvidence,
      mode: MODES.SAFE, historicalCases: 50,
    });
    assert.equal(r.requires_human_review, true);
  });

  it("§7.9.5 — disclaimer present (not for punishment)", () => {
    const r = generateExplanation({
      forecast: fakeForecast, evidence: fakeEvidence,
      mode: MODES.SAFE, historicalCases: 50,
    });
    assert.ok(r.disclaimer.includes("not be used for punishment"));
  });

  it("no evidence — returns null", () => {
    const r = generateExplanation({
      forecast: fakeForecast, evidence: [],
      mode: MODES.SAFE, historicalCases: 50,
    });
    assert.equal(r, null);
  });

  it("untraceable evidence — returns null", () => {
    const r = generateExplanation({
      forecast: fakeForecast, evidence: [{ bad: "data" }],
      mode: MODES.SAFE, historicalCases: 50,
    });
    assert.equal(r, null);
  });

  it("metadata includes constraint references", () => {
    const r = generateExplanation({
      forecast: fakeForecast, evidence: fakeEvidence,
      mode: MODES.SAFE, historicalCases: 50,
    });
    assert.deepEqual(r.metadata.constraints, ["§7.9.1", "§7.9.2", "§7.9.3", "§7.9.4", "§7.9.5"]);
  });
});
