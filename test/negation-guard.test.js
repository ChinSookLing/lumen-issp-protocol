/**
 * Negation Guard ×0.25 — M79 Decision 1c (B-class 5/5)
 * Test-first: these tests define acceptance criteria
 *
 * Negation patterns: not saying | don't mean | not implying | not suggesting
 * Distance: negation word within 5 words of guilt keyword
 * Coefficient: ×0.25
 *
 * Acceptance criteria:
 *   1. B03-style negated guilt → guilt falls into 0~0.3
 *   2. TRS-E self-guilt/therapy language → stays at 0
 *   3. Non-negated guilt → unchanged (no regression)
 */
"use strict";
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { extractDMComponents } = require("../core/dm");
const { extractMBComponents } = require("../core/mb");

describe("Negation Guard — DM guilt ×0.25", () => {
  // --- Should be guarded (negated guilt → ≤0.3) ---
  it("NG-DM-01: 'not saying you should feel guilty'", () => {
    const c = extractDMComponents("I'm not saying you should feel guilty, but I wish you understood why this matters to me.");
    console.log("    NG-DM-01 guilt=" + c.guilt);
    assert.ok(c.guilt <= 0.3, "negated guilt should be ≤0.3, got " + c.guilt);
  });
  it("NG-DM-02: 'don't mean to make you feel guilty'", () => {
    const c = extractDMComponents("I don't mean to make you feel guilty, I just want to talk about what happened.");
    console.log("    NG-DM-02 guilt=" + c.guilt);
    assert.ok(c.guilt <= 0.3, "negated guilt should be ≤0.3, got " + c.guilt);
  });
  it("NG-DM-03: 'not implying you should feel ashamed'", () => {
    const c = extractDMComponents("I'm not implying you should feel ashamed. I just want us to be honest.");
    console.log("    NG-DM-03 guilt=" + c.guilt);
    assert.ok(c.guilt <= 0.3, "negated guilt should be ≤0.3, got " + c.guilt);
  });
  it("NG-DM-04: ZH — '我不是要你覺得愧疚'", () => {
    const c = extractDMComponents("我不是要你覺得愧疚，只是希望你能理解我的感受。");
    console.log("    NG-DM-04 guilt=" + c.guilt);
    assert.ok(c.guilt <= 0.3, "negated ZH guilt should be ≤0.3, got " + c.guilt);
  });

  // --- Should NOT be guarded (genuine guilt pressure → unchanged) ---
  it("NG-DM-05: non-negated 'you should feel guilty' → unchanged", () => {
    const c = extractDMComponents("You should feel guilty for what you did to me.");
    console.log("    NG-DM-05 guilt=" + c.guilt);
    assert.ok(c.guilt >= 0.35, "non-negated guilt should stay high, got " + c.guilt);
  });
  it("NG-DM-06: non-negated 'after all I've done' → unchanged", () => {
    const c = extractDMComponents("After all I've done for you, this is how you repay me. You should be ashamed.");
    console.log("    NG-DM-06 guilt=" + c.guilt);
    assert.ok(c.guilt >= 0.35, "non-negated guilt should stay high, got " + c.guilt);
  });

  // --- Self-guilt must remain 0 (no regression) ---
  it("NG-DM-07: self-guilt 'I feel guilty' → stays 0", () => {
    const c = extractDMComponents("I feel guilty about what I said yesterday. I'm sorry—can we talk when you have time?");
    console.log("    NG-DM-07 guilt=" + c.guilt);
    assert.equal(c.guilt, 0, "self-guilt must stay 0, got " + c.guilt);
  });
  it("NG-DM-08: self-guilt 'I feel guilty that you had to carry' → stays 0", () => {
    const c = extractDMComponents("Thank you for your help—I feel guilty that you had to carry extra work, so I'll take the next shift.");
    console.log("    NG-DM-08 guilt=" + c.guilt);
    assert.equal(c.guilt, 0, "self-guilt must stay 0, got " + c.guilt);
  });
});

describe("Negation Guard — MB guilt_invoke ×0.25", () => {
  it("NG-MB-01: 'not saying you should feel guilty' → guilt_invoke ≤0.3", () => {
    const c = extractMBComponents("I'm not saying you should feel guilty, but I wish you understood why this matters to me.");
    console.log("    NG-MB-01 guilt_invoke=" + c.guilt_invoke);
    assert.ok(c.guilt_invoke <= 0.3, "negated MB guilt should be ≤0.3, got " + c.guilt_invoke);
  });
  it("NG-MB-02: non-negated 'don't you feel guilty' → unchanged", () => {
    const c = extractMBComponents("Don't you feel guilty about abandoning the group when we needed you most?");
    console.log("    NG-MB-02 guilt_invoke=" + c.guilt_invoke);
    assert.ok(c.guilt_invoke >= 0.35, "non-negated MB guilt should stay high, got " + c.guilt_invoke);
  });
});
