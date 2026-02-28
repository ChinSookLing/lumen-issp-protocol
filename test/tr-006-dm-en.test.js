// TR-006: DM English Deep Dive (DIAGNOSTIC BASELINE — Node-01-designed)
// Focus: debt + withdraw + opts coverage
// Status: Diagnostic only — awaiting Node-05/Node-06 RW vectors to upgrade
// Note: guilt component ACTIVATED (M77 passed 6/6) — Node-05+Node-06 spec implemented
// Date: 2026-02-20

const { pipeline } = require('../src/pipeline/dispatcher');
const { extractDMComponents } = require('../core/dm');
const assert = require('node:assert');
const { describe, it } = require('node:test');

describe("TR-006: DM debt escalation", () => {
  it("DM-001: after all + you owe me — debt should be >= 0.4", () => {
    const c = extractDMComponents("After all Ive done for you. You owe me your friendship.");
    assert.ok(c.debt >= 0.4, "debt >= 0.4");
  });

  it("DM-002: debt + cant reject — debt should be >= 0.65", () => {
    const c = extractDMComponents("After all Ive done for you. You owe me a chance. I did favors so you cant reject me.");
    assert.ok(c.debt >= 0.65, "debt >= 0.65");
  });

  it("DM-003: repay + dont appreciate — debt hit", () => {
    const c = extractDMComponents("I gave you everything and this is how you repay me. You dont appreciate anything.");
    assert.ok(c.debt >= 0.4, "debt >= 0.4");
  });

  it("DM-004: benign gratitude — no debt", () => {
    const c = extractDMComponents("I appreciate everything youve done. I just need some space right now.");
    assert.equal(c.debt, 0, "No debt");
    assert.equal(c.withdraw, 0, "No withdraw");
  });
});

describe("TR-006: DM withdraw threats", () => {
  it("DM-005: dont come crying — withdraw >= 0.4", () => {
    const c = extractDMComponents("Dont come crying to me when someone else doesnt treat you the way I did.");
    assert.ok(c.withdraw >= 0.4, "withdraw >= 0.4");
  });

  it("DM-006: see how you manage without me — withdraw >= 0.4", () => {
    const c = extractDMComponents("See how you manage without me. Youll miss me when Im gone.");
    assert.ok(c.withdraw >= 0.4, "withdraw >= 0.4");
  });

  it("DM-007: youll regret losing me — withdraw >= 0.4", () => {
    const c = extractDMComponents("Youll regret losing me. No one else will put up with you.");
    assert.ok(c.withdraw >= 0.4, "withdraw >= 0.4");
  });

  it("DM-008: benign goodbye — no withdraw", () => {
    const c = extractDMComponents("I think we should part ways. I wish you all the best.");
    assert.equal(c.withdraw, 0, "No withdraw");
  });
});

describe("TR-006: DM combo (debt + withdraw)", () => {
  it("DM-009: full combo — SUM >= 1.0", () => {
    const c = extractDMComponents("After all Ive done for you. You owe me. Dont come crying to me later. See how you manage without me.");
    const sum = c.debt + c.withdraw;
    assert.ok(sum >= 1.0, "debt + withdraw SUM >= 1.0");
  });

  it("DM-010: triple hit — highest coverage", () => {
    const c = extractDMComponents("After all Ive done for you. You owe me a chance. I did favors so you cant reject me. Dont come crying to me. Youll regret losing me.");
    assert.ok(c.debt >= 0.65, "strong debt");
    assert.ok(c.withdraw >= 0.4, "withdraw active");
  });

  it("DM-011: benign boundary — no trigger", () => {
    const c = extractDMComponents("I need to set some boundaries. This isnt working for either of us. Lets talk about it.");
    assert.equal(c.debt, 0, "No debt");
    assert.equal(c.withdraw, 0, "No withdraw");
  });
});

describe("TR-006: DM guilt gap evidence (M77 proposal support)", () => {
  it("DM-012: guilt language — guilt component now active (M77)", () => {
    const c = extractDMComponents("I sacrificed everything for you. You should be ashamed. After all the pain I went through.");
    assert.ok(c.guilt >= 0.4, "guilt activated — M77 passed, Node-05+Node-06 spec implemented");
  });

  it("DM-013: shame + disappointment — guilt now active (M77)", () => {
    const c = extractDMComponents("Im so disappointed in you. I thought you were better than this. You should feel guilty.");
    assert.ok(c.guilt >= 0.4, "guilt activated — M77 passed, Node-05+Node-06 spec implemented");
  });

  it("DM-014: benign empathy — all zero", () => {
    const c = extractDMComponents("I understand this is hard. Take your time. No pressure at all.");
    assert.equal(c.debt, 0);
    assert.equal(c.withdraw, 0);
    assert.equal(c.guilt, 0);
  });
});
