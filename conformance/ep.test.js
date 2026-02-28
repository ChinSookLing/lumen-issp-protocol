/**
 * Lumen ISSP — Sprint 5: emotional-provocation Tests
 *
 * Requirements (M47):
 *   - 5 strong + 5 medium + 5 weak = 15 EP cases
 *   - Node-06 H16-H20 cultural counter-examples
 *   - ≥6 cross-pattern negatives (FC/MB/DM/EA/GC/IP)
 *   - Node-03 CI: C1-only, booster linearity, SUM boundary
 *   - Medium-Strength Protocol v1.0 annotations
 *   - Retreat protocol test hooks
 *
 * Run: node --test conformance/ep.test.js
 */

"use strict";
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { evaluate } = require("../core/evaluator");
const { extractEPComponents } = require("../core/ep");

// ═══════════════════════════════════════════════════════════════════════
// STRONG (Level 2-3, score 0.6-1.0)
// ═══════════════════════════════════════════════════════════════════════

describe("EP-STRONG: Emotional-Provocation Full Structure", () => {

  it("EP-S01: CN full — bait + escalation + forced + label", () => {
    const r = evaluate("你敢不敢回答？懦夫！大家都知道你不敢。沉默就是承認你錯了。你就是沒用的廢物。");
    assert.ok(r.channels.push.acri > 0.5, `acri=${r.channels.push.acri}`);
    assert.ok(r.channels.push.patterns.some(p => p.id === "emotional_provocation"));
  });

  it("EP-S02: EN full structure", () => {
    const r = evaluate("Are you scared? Coward! Everyone knows you won't dare answer. Silence means you admit it. Pathetic. Say something!");
    assert.ok(r.channels.push.acri > 0.5, `acri=${r.channels.push.acri}`);
    assert.ok(r.channels.push.patterns.some(p => p.id === "emotional_provocation"));
  });

  it("EP-S03: CN escalation dominant", () => {
    const r = evaluate("你有種就回答，不敢回答嗎？大家都看到了，你完了。怎麼不說話？是不是心虛？你就是膽小鬼。");
    assert.ok(r.channels.push.acri > 0, `acri=${r.channels.push.acri}`);
  });

  it("EP-S04: EN forced-response dominant", () => {
    const r = evaluate("Answer me! Why won't you respond? Nothing to say? Cat got your tongue? Silence means you agree. You'll regret not answering. Everyone sees you're too scared to say it. Coward.");
    assert.ok(r.channels.push.acri > 0, `acri=${r.channels.push.acri}`);
  });

  it("EP-S05: CN bait + shame chain", () => {
    const r = evaluate("你算什麼？就這點本事？大家都知道你不行。你說不說？不說就是默認了。果然不敢，丟人。");
    assert.ok(r.channels.push.acri > 0, `acri=${r.channels.push.acri}`);
  });

});

// ═══════════════════════════════════════════════════════════════════════
// MEDIUM (Level 1-2, score 0.3-0.6)
// Medium-Strength Protocol: annotated with missing component
// ═══════════════════════════════════════════════════════════════════════

describe("EP-MED: Emotional-Provocation Medium Strength", () => {

  it("MED-EP-01: bait + forced, missing escalation", () => {
    // Missing: escalation_pressure — no public shaming / consequence
    const c = extractEPComponents("你敢不敢回答？你說不說？怎麼不說話？");
    assert.ok(c.bait_or_taunt >= 0.4, `bait=${c.bait_or_taunt}`);
    assert.ok(c.forced_response_frame >= 0.4, `forced=${c.forced_response_frame}`);
    assert.ok(c.escalation_pressure === 0, `escalation should be 0: ${c.escalation_pressure}`);
  });

  it("MED-EP-02: escalation + forced, missing bait", () => {
    // Missing: bait_or_taunt — no mockery/provocation
    const c = extractEPComponents("大家都看到了。你完了。怎麼不說話？沉默就是承認。");
    assert.ok(c.escalation_pressure >= 0.4, `escalation=${c.escalation_pressure}`);
    assert.ok(c.forced_response_frame >= 0.4, `forced=${c.forced_response_frame}`);
  });

  it("MED-EP-03: bait + escalation, missing forced response", () => {
    // Missing: forced_response_frame — no "answer me / silence = loss"
    const c = extractEPComponents("你有種嗎？膽小鬼！大家都知道你不行。你會後悔的。");
    assert.ok(c.bait_or_taunt >= 0.4, `bait=${c.bait_or_taunt}`);
    assert.ok(c.escalation_pressure >= 0.4, `escalation=${c.escalation_pressure}`);
  });

  it("MED-EP-04: EN medium — bait + forced, no escalation", () => {
    const c = extractEPComponents("Too scared to answer? Say something! Nothing to say? Coward.");
    assert.ok(c.bait_or_taunt >= 0.4, `bait=${c.bait_or_taunt}`);
    assert.ok(c.forced_response_frame >= 0.4, `forced=${c.forced_response_frame}`);
  });

  it("MED-EP-05: EN medium — escalation + label, weak forced", () => {
    const c = extractEPComponents("Everyone knows you're a joke. You'll regret this. Pathetic. Worthless.");
    assert.ok(c.escalation_pressure >= 0.4, `escalation=${c.escalation_pressure}`);
    assert.ok(c.label_or_shame_hook >= 0.4, `label=${c.label_or_shame_hook}`);
  });

});

// ═══════════════════════════════════════════════════════════════════════
// WEAK (Level 0-1 — should NOT trigger)
// ═══════════════════════════════════════════════════════════════════════

describe("EP-WEAK: Weak Signals (should NOT trigger)", () => {

  it("WEAK-EP-01: single bait, nothing else", () => {
    assert.equal(evaluate("你有種嗎？").channels.push.acri, 0);
  });

  it("WEAK-EP-02: mild teasing", () => {
    assert.equal(evaluate("哈哈你真的很搞笑。").channels.push.acri, 0);
  });

  it("WEAK-EP-03: EN single dare", () => {
    assert.equal(evaluate("I dare you to try.").channels.push.acri, 0);
  });

  it("WEAK-EP-04: competitive encouragement", () => {
    assert.equal(evaluate("Come on, you can do better than that!").channels.push.acri, 0);
  });

  it("WEAK-EP-05: label without structure", () => {
    assert.equal(evaluate("你就是懦夫。").channels.push.acri, 0);
  });

});

// ═══════════════════════════════════════════════════════════════════════
// GROK CULTURAL COUNTER-EXAMPLES (H16-H20)
// ═══════════════════════════════════════════════════════════════════════

describe("EP-CULTURE: Node-06 Cultural Counter-Examples", () => {

  it("H16: JB friends — normal teasing", () => {
    assert.equal(evaluate("你怎麼這麼沒用啊？哈哈").channels.push.acri, 0);
  });

  it("H17: Chinese family — should trigger EA not EP", () => {
    const r = evaluate("你再這樣我就不理你了");
    assert.ok(!r.channels.push.patterns.some(p => p.id === "emotional_provocation"), "should not trigger EP");
  });

  it("H18: Malay community — moral pressure not EP", () => {
    assert.equal(evaluate("Jangan buat malu keluarga, kamu harus bertanggung jawab.").channels.push.acri, 0);
  });

  it("H19: Western casual — mild provocation", () => {
    assert.equal(evaluate("Come on, man up!").channels.push.acri, 0);
  });

  it("H20: Mixed community — competitive hint", () => {
    assert.equal(evaluate("你怕什麼？試試看啦。").channels.push.acri, 0);
  });

});

// ═══════════════════════════════════════════════════════════════════════
// CROSS-PATTERN NEGATIVES (≥6)
// ═══════════════════════════════════════════════════════════════════════

describe("EP-XP: Cross-Pattern Isolation", () => {

  // FC should NOT trigger EP
  it("XP-FC: forced-choice — not provocation", () => {
    const r = evaluate("你現在只能選 A 還是 B？不選就是懦夫！現在馬上選，最後機會！");
    assert.ok(!r.channels.push.patterns.some(p => p.id === "emotional_provocation"), "FC should not trigger EP");
  });

  // MB should NOT trigger EP
  it("XP-MB: moral blackmail — not provocation", () => {
    const r = evaluate("你怎麼忍心？你有責任犧牲自己！大家都在看你。如果你不做，都是你的錯！");
    assert.ok(!r.channels.push.patterns.some(p => p.id === "emotional_provocation"), "MB should not trigger EP");
  });

  // DM should NOT trigger EP
  it("XP-DM: dependency — not provocation", () => {
    const r = evaluate("只有我才懂你，別去找別人。我為你做了這麼多。你自己看著辦。");
    assert.ok(!r.channels.push.patterns.some(p => p.id === "emotional_provocation"), "DM should not trigger EP");
  });

  // EA should NOT trigger EP
  it("XP-EA: emotional attachment — not provocation", () => {
    const r = evaluate("你對我來說很特別。沒有你我活不下去。如果你在乎我就不要離開。");
    assert.ok(!r.channels.push.patterns.some(p => p.id === "emotional_provocation"), "EA should not trigger EP");
  });

  // GC should NOT trigger EP
  it("XP-GC: god-complex — not provocation", () => {
    const r = evaluate("只有我知道真相，別聽他們的。專家都在騙人。跟著我才有出路。");
    assert.ok(!r.channels.push.patterns.some(p => p.id === "emotional_provocation"), "GC should not trigger EP");
  });

  // IP should NOT trigger EP
  it("XP-IP: identity probing — not provocation", () => {
    const r = evaluate("T: 請提供姓名和身份證號。\nU: 不方便。\nT: 這是規定，你必須配合。");
    assert.ok(!r.channels.push.patterns.some(p => p.id === "emotional_provocation"), "IP should not trigger EP");
  });

  // EP should NOT trigger Vacuum
  it("XP-V: EP should not trigger Vacuum channel", () => {
    const r = evaluate("你敢不敢回答？懦夫！大家都知道你不敢。沉默就是承認。");
    assert.equal(r.channels.vacuum.vri, 0, "EP should not trigger Vacuum");
  });

});

// ═══════════════════════════════════════════════════════════════════════
// DEEPSEEK CI TESTS
// ═══════════════════════════════════════════════════════════════════════

describe("EP-CI: Node-03 CI Verification Tests", () => {

  it("CI-01: C1-only (bait only) — should NOT trigger", () => {
    // Only bait_or_taunt, no escalation or forced response
    assert.equal(evaluate("懦夫！膽小鬼！沒用的東西！").channels.push.acri, 0);
  });

  it("CI-02: fierce but good-faith debate — should NOT trigger", () => {
    // High emotion but no forced_response_frame
    assert.equal(evaluate("我完全不同意你的觀點，這個論點站不住腳！").channels.push.acri, 0);
  });

  it("CI-03: booster-only — should NOT trigger", () => {
    // Only label/shame, no core structure
    assert.equal(evaluate("你這種人真的很丟人。").channels.push.acri, 0);
  });

});

// ═══════════════════════════════════════════════════════════════════════
// RED LINE
// ═══════════════════════════════════════════════════════════════════════

describe("EP-RL: Red Line Compliance", () => {

  it("RL-01: no raw text in output", () => {
    const json = JSON.stringify(evaluate("你敢不敢回答？懦夫！沉默就是承認。"));
    assert.ok(!json.includes("你敢不敢"));
    assert.ok(!json.includes("懦夫"));
    assert.ok(!json.includes("挑釁者"));
  });

});
