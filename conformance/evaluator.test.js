/**
 * Lumen ISSP — Evaluator Tests v0.8 (M38: EA Pattern + 5 Patterns Active)
 *
 * Run: node --test conformance/evaluator.test.js
 *
 * Test suites:
 *   1. Skeleton Tests (M1)
 *   2. Golden Vectors (M1 baseline)
 *   3. DM Pattern Tests (M2)
 *   4. Class-0 Omission Dynamics Tests (M3)
 *   5. Three-Layer Response Mechanism Tests (M4)
 *   6. FC Forced-Choice Tests (M5→v0.2)
 *   7. MB Moral Blackmail Tests (M6→v0.2)
 *   8. Cross-Contamination Tests (M37 Council Review)
 *   9. EA Emotional-Attachment Tests (M38 — three-party process)
 */

"use strict";

const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const { evaluate } = require("../core/evaluator");
const { extractDMComponents } = require("../core/dm");
const { extractClass0Components, evaluateClass0Gate } = require("../core/class0");
const { extractFCComponents, evaluateFCGate } = require("../core/fc");
const { extractMBComponents } = require("../core/mb");
const { extractEAComponents } = require("../core/ea");
const { extractVSComponents } = require("../core/vs");
const { deriveResponseLevel } = require("../core/ir");

// ─── Helper ──────────────────────────────────────────────────────────

function assertSchemaShape(result) {
  assert.equal(result.version, "0.1.0");
  assert.equal(typeof result.timestamp, "string");
  assert.equal(typeof result.input_ref, "string");
  assert.ok(result.channels);
  assert.ok(result.meta);
  assert.ok(Array.isArray(result.channels.push.patterns));
  assert.equal(typeof result.channels.push.acri, "number");
  assert.equal(typeof result.channels.vacuum.vri, "number");
  assert.ok(result.evidence);
  assert.ok([0, 1, 2, 3].includes(result.response_level));
}

// ─── Suite 1: Skeleton Tests (M1) ───────────────────────────────────

describe("Evaluator v0.4 — Skeleton Tests", () => {

  it("should run without crashing on benign input", () => {
    assert.ok(evaluate("Hello, how are you today?"));
  });

  it("should return schema-compliant output", () => {
    assertSchemaShape(evaluate("This is a normal conversation."));
  });

  it("should have zero ACRI and zero VRI for benign input", () => {
    const r = evaluate("The weather is nice today.");
    assert.equal(r.channels.push.acri, 0);
    assert.equal(r.channels.vacuum.vri, 0);
  });

  it("should reject empty input", () => {
    assert.throws(() => evaluate(""), { name: "TypeError" });
  });

  it("should reject non-string input", () => {
    assert.throws(() => evaluate(123), { name: "TypeError" });
  });

  it("should never include raw text in output", () => {
    const input = "You must do exactly what I say or else.";
    assert.ok(!JSON.stringify(evaluate(input)).includes(input));
  });

  it("should produce different input_ref for different inputs", () => {
    assert.notEqual(evaluate("Message A").input_ref, evaluate("Message B").input_ref);
  });

});

// ─── Suite 2: Golden Vectors (M1 baseline) ──────────────────────────

describe("Golden Vectors v0.1", () => {

  it("GV-01: Neutral — 0/0, Level 0", () => {
    const r = evaluate("嗨，我只是測試一下。謝謝。");
    assert.equal(r.channels.push.acri, 0);
    assert.equal(r.channels.vacuum.vri, 0);
    assert.equal(r.response_level, 0);
  });

  it("GV-02: Push-like language — 0/0, Level 0", () => {
    const r = evaluate("你現在就照我說的做，不然你會後悔的。");
    assert.equal(r.channels.push.acri, 0);
    assert.equal(r.channels.vacuum.vri, 0);
    assert.equal(r.response_level, 0);
  });

  it("GV-03: Vacuum-like situation — 0/0, Level 0", () => {
    const r = evaluate("我已經講得很清楚了，你自己想辦法。我不會再回應。");
    assert.equal(r.channels.push.acri, 0);
    assert.equal(r.channels.vacuum.vri, 0);
    assert.equal(r.response_level, 0);
  });

});

// ─── Suite 3: DM Pattern Tests (M2) ────────────────────────────────

describe("DM Pattern v0.1 — Dependency Manipulation", () => {

  it("DM-C1: exclusivity signals", () => {
    assert.ok(extractDMComponents("只有我才懂你，別人都不會理解你。").excl > 0.3);
  });

  it("DM-C2: indebtedness signals", () => {
    assert.ok(extractDMComponents("我為你做了這麼多，你怎麼可以這樣對我。").debt > 0.3);
  });

  it("DM-C3: withdrawal threat signals", () => {
    assert.ok(extractDMComponents("你自己看著辦，我不會再回應。別再找我。").withdraw > 0.3);
  });

  it("DM-C6: option suppression signals", () => {
    assert.ok(extractDMComponents("別去找別人，他們不行，你沒有選擇。").opts > 0.3);
  });

  it("DM-C0: zero for benign input", () => {
    const c = extractDMComponents("今天天氣真好，我們去散步吧。");
    assert.equal(c.excl + c.debt + c.withdraw + c.opts, 0);
  });

  it("DM-STRONG: detect strong DM, isolated from Vacuum", () => {
    const r = evaluate("只有我才懂你，別去找別人，他們不行。我為你做了這麼多，你怎麼可以這樣對我。你自己看著辦，我不會再回應。");
    assert.ok(r.channels.push.acri > 0);
    assert.equal(r.channels.push.patterns[0].id, "DM");
    assert.equal(r.channels.vacuum.vri, 0);
  });

  it("DM-WEAK: no detection for single hint", () => {
    assert.equal(evaluate("我很需要你。").channels.push.acri, 0);
  });

  it("DM-EN: detect DM in English", () => {
    const r = evaluate("I'm the only one who understands you. Nobody else cares. After everything I've done for you, you owe me. Don't go to them, they can't help. Figure it out yourself, I won't respond.");
    assert.ok(r.channels.push.acri > 0);
  });

  it("DM-RL: no raw text or identity attribution", () => {
    const json = JSON.stringify(evaluate("只有我才懂你，別去找別人。我為你做了這麼多。你自己看著辦，我不會再回應。"));
    assert.ok(!json.includes("只有我才懂你"));
    assert.ok(!json.includes("操控者"));
  });

});

// ─── Suite 4: Class-0 Omission Dynamics Tests (M3) ─────────────────

describe("Class-0 v0.1 — Omission Dynamics (Vacuum Channel)", () => {

  it("C0-C1: context gap signals", () => {
    assert.ok(extractClass0Components("事實就是這樣，總之不用多說了。反正明顯嘛。").ctx_gap > 0.3);
  });

  it("C0-C2: alternatives absent signals", () => {
    assert.ok(extractClass0Components("別無選擇，只有這條路，只能這樣做。").alt_abs > 0.3);
  });

  it("C0-C3: counterevidence missing signals", () => {
    assert.ok(extractClass0Components("絕對不可能錯，沒有例外，永遠都是這樣。").counter_miss > 0.3);
  });

  it("C0-C4: clarification skipped signals", () => {
    assert.ok(extractClass0Components("別再問了，到此為止，已經說完了。沒什麼好討論。").clarity_skip > 0.3);
  });

  it("C0-ZERO: zero for benign input", () => {
    const c = extractClass0Components("今天天氣很好，要不要一起去公園？");
    assert.equal(c.ctx_gap + c.alt_abs + c.counter_miss + c.clarity_skip, 0);
  });

  it("C0-STRONG: detect strong Class-0, isolated from Push", () => {
    const r = evaluate("事實就是這樣，總之別無選擇，只能這樣做。絕對不可能錯，沒有例外。別再問了，到此為止，已經說完了。");
    assert.ok(r.channels.vacuum.vri > 0);
    assert.equal(r.channels.push.acri, 0);
  });

  it("C0-SAFE: no trigger for uncertainty acknowledgment", () => {
    assert.equal(evaluate("我不確定，也許還有其他可能，待確認後再說。").channels.vacuum.vri, 0);
  });

  it("C0-EN: detect Class-0 in English", () => {
    const r = evaluate("It's obvious, end of discussion. The only option is this. Absolutely no exceptions, guaranteed. Stop asking, that's final, case closed.");
    assert.ok(r.channels.vacuum.vri > 0);
  });

  it("C0-ISO: dual-channel isolation", () => {
    const dm = evaluate("只有我才懂你，別去找別人，他們不行。我為你做了這麼多，你怎麼可以這樣對我。你自己看著辦，我不會再回應。");
    assert.ok(dm.channels.push.acri > 0);
    assert.equal(dm.channels.vacuum.vri, 0);

    const c0 = evaluate("事實就是這樣，總之別無選擇，只能這樣做。絕對不可能錯，沒有例外。別再問了，到此為止。");
    assert.ok(c0.channels.vacuum.vri > 0);
    assert.equal(c0.channels.push.acri, 0);
  });

  it("C0-RL: no raw text or identity attribution", () => {
    const json = JSON.stringify(evaluate("事實就是這樣，別無選擇。絕對不可能錯。別再問了。"));
    assert.ok(!json.includes("事實就是這樣"));
    assert.ok(!json.includes("操控者"));
  });

});

// ─── Suite 5: Three-Layer Response Mechanism (M4 — new) ─────────────

describe("Response Mechanism v0.1 — Three-Layer Response (Charter §6.4)", () => {

  // ── deriveResponseLevel unit tests ──

  it("RL-UNIT-0: vri=0, acri=0 → Level 0 (No detection)", () => {
    assert.equal(deriveResponseLevel(0, 0), 0);
  });

  it("RL-UNIT-1: vri=0.15 → Level 1 (Silent Audit)", () => {
    assert.equal(deriveResponseLevel(0.15, 0), 1);
  });

  it("RL-UNIT-2: vri=0.45 → Level 2 (Integrity Alert)", () => {
    assert.equal(deriveResponseLevel(0.45, 0), 2);
  });

  it("RL-UNIT-3: vri=0.85 → Level 3 (Hand-off Activation)", () => {
    assert.equal(deriveResponseLevel(0.85, 0), 3);
  });

  it("RL-UNIT-ACRI: acri=0.75, vri=0 → Level 3 (Push triggers hand-off too)", () => {
    assert.equal(deriveResponseLevel(0, 0.75), 3);
  });

  it("RL-UNIT-PEAK: uses higher of vri and acri", () => {
    assert.equal(deriveResponseLevel(0.1, 0.5), 2); // acri=0.5 wins → Level 2
    assert.equal(deriveResponseLevel(0.5, 0.1), 2); // vri=0.5 wins → Level 2
  });

  // ── Pipeline integration tests ──

  it("RL-L0: benign input → Level 0", () => {
    assert.equal(evaluate("今天天氣真好，我們去散步吧。").response_level, 0);
  });

  it("RL-L2: strong Class-0 → Level 2 (Integrity Alert)", () => {
    const r = evaluate("事實就是這樣，總之別無選擇，只能這樣做。絕對不可能錯，沒有例外。別再問了，到此為止，已經說完了。");
    assert.equal(r.response_level, 2);
  });

  it("RL-L3: strong DM (acri ≥ 0.7) → Level 3 (Hand-off Activation)", () => {
    const r = evaluate("只有我才懂你，別去找別人，他們不行。我為你做了這麼多，你怎麼可以這樣對我。你自己看著辦，我不會再回應。");
    assert.equal(r.response_level, 3);
    assert.ok(r.channels.push.acri >= 0.7);
  });

  // ── Evidence summary includes response level ──

  it("RL-EV: evidence summary includes response level label", () => {
    const r = evaluate("事實就是這樣，總之別無選擇，只能這樣做。絕對不可能錯，沒有例外。別再問了，到此為止，已經說完了。");
    assert.ok(r.evidence.public.summary.includes("Response: Level"));
    assert.ok(r.evidence.public.summary.includes("Protocol Integrity Alert"));
  });

  it("RL-EV-CLEAN: benign evidence has no response level", () => {
    const r = evaluate("今天天氣真好。");
    assert.equal(r.evidence.public.summary, "No manipulation structure detected.");
    assert.ok(!r.evidence.public.summary.includes("Response:"));
  });

});

// ─── Suite 6: FC Forced-Choice Pattern Tests (M5 — new) ────────────

describe("FC v0.1 — Forced-Choice (Push Channel)", () => {

  // ── Component extraction tests ──

  it("FC-C1: should detect binary frame signals", () => {
    const c = extractFCComponents("你選 A 還是 B？二選一！");
    assert.ok(c.binary_frame > 0.3, `binary_frame=${c.binary_frame}`);
  });

  it("FC-C2: should detect consequence signals", () => {
    const c = extractFCComponents("不選就完了，你會後悔的，否則代價很大。");
    assert.ok(c.consequence > 0.3, `consequence=${c.consequence}`);
  });

  it("FC-C3: should detect closure pressure signals", () => {
    const c = extractFCComponents("現在馬上選，再不選就來不及了！最後機會！");
    assert.ok(c.closure_pressure > 0.3, `closure_pressure=${c.closure_pressure}`);
  });

  it("FC-C4: should detect label attack signals", () => {
    const c = extractFCComponents("不選就是懦夫、膽小鬼！你怕了？");
    assert.ok(c.label_attack > 0.3, `label_attack=${c.label_attack}`);
  });

  it("FC-ZERO: should return zero for benign input", () => {
    const c = extractFCComponents("今天天氣很好，要不要一起去公園？");
    assert.equal(c.binary_frame + c.consequence + c.closure_pressure + c.label_attack, 0);
  });

  // ── Full pipeline tests (from 81 test database) ──

  it("FC-STRONG-ZH: 你選 A 還是 B？不選就是懦夫！ (from test DB)", () => {
    const r = evaluate("你選 A 還是 B？不選就是懦夫！");
    assert.ok(r.channels.push.acri > 0, `acri=${r.channels.push.acri}`);
    assert.ok(r.channels.push.patterns.some(p => p.id === "FC"), "Should detect FC pattern");
  });

  it("FC-STRONG-EN: Buy stocks or bonds? Pick one now or regret later. (from test DB)", () => {
    const r = evaluate("Buy stocks or bonds? Pick one now or regret later.");
    assert.ok(r.channels.push.acri > 0, `acri=${r.channels.push.acri}`);
  });

  it("FC-STRONG-MIX: 進攻還是防守？二選一，否則全軍覆沒！ (from test DB)", () => {
    const r = evaluate("進攻還是防守？二選一，否則全軍覆沒！");
    assert.ok(r.channels.push.acri > 0, `acri=${r.channels.push.acri}`);
  });

  it("FC-WEAK: Choose one, simple as that — no pressure, no trigger", () => {
    const r = evaluate("Choose one, simple as that.");
    assert.equal(r.channels.push.acri, 0, "No pressure = no trigger");
  });

  it("FC-BENIGN: Do you want coffee or tea? — legitimate question", () => {
    const r = evaluate("Do you want coffee or tea?");
    assert.equal(r.channels.push.acri, 0, "Normal question should not trigger");
  });

  // ── Cross-pattern isolation ──

  it("FC-ISO: FC should not trigger Vacuum channel", () => {
    const r = evaluate("你選 A 還是 B？不選就是懦夫！現在馬上選！");
    assert.ok(r.channels.push.acri > 0, "FC triggers Push");
    assert.equal(r.channels.vacuum.vri, 0, "FC should NOT trigger Vacuum");
  });

  // ── Red-line compliance ──

  it("FC-RL: no raw text or identity attribution in output", () => {
    const json = JSON.stringify(evaluate("你選 A 還是 B？不選就是懦夫！"));
    assert.ok(!json.includes("你選 A 還是 B"));
    assert.ok(!json.includes("操控者"));
    assert.ok(!json.includes("manipulator"));
  });

});

// ─── Suite 7: MB Moral Blackmail Pattern Tests (M6 — new) ──────────

describe("MB v0.1 — Moral Blackmail (Push Channel)", () => {

  // ── Component extraction tests ──

  it("MB-C1: should detect guilt invocation signals", () => {
    const c = extractMBComponents("你怎麼忍心？你好意思嗎？問心無愧嗎？");
    assert.ok(c.guilt_invoke > 0.3, `guilt_invoke=${c.guilt_invoke}`);
  });

  it("MB-C2: should detect collective pressure signals", () => {
    const c = extractMBComponents("大家都在看你，社會需要你，所有人都在等。");
    assert.ok(c.collective_pressure > 0.3, `collective_pressure=${c.collective_pressure}`);
  });

  it("MB-C3: should detect sacrifice demand signals", () => {
    const c = extractMBComponents("你有責任犧牲自己，這是你的義務和道德。");
    assert.ok(c.sacrifice_demand > 0.3, `sacrifice_demand=${c.sacrifice_demand}`);
  });

  it("MB-C4: should detect moral consequence signals", () => {
    const c = extractMBComponents("如果你不做，都是你的錯，血在你手上。");
    assert.ok(c.moral_consequence > 0.3, `moral_consequence=${c.moral_consequence}`);
  });

  it("MB-ZERO: should return zero for benign input", () => {
    const c = extractMBComponents("今天天氣很好，要不要一起去公園？");
    assert.equal(c.guilt_invoke + c.collective_pressure + c.sacrifice_demand + c.moral_consequence, 0);
  });

  // ── Full pipeline tests ──

  it("MB-STRONG-ZH: full moral blackmail structure", () => {
    const r = evaluate("你怎麼忍心？你有責任犧牲自己！大家都在看你，社會因為你受苦。如果你不做，都是你的錯，血在你手上！");
    assert.ok(r.channels.push.acri > 0, `acri=${r.channels.push.acri}`);
    assert.ok(r.channels.push.patterns.some(p => p.id === "MB"), "Should detect MB pattern");
  });

  it("MB-STRONG-EN: English moral blackmail", () => {
    const r = evaluate("How could you live with yourself? It's your duty and responsibility. Everyone is counting on you. If you don't, people will suffer because of you.");
    assert.ok(r.channels.push.acri > 0, `acri=${r.channels.push.acri}`);
    assert.ok(r.channels.push.patterns.some(p => p.id === "MB"));
  });

  it("MB-WEAK: single guilt signal, no structure — no trigger", () => {
    const r = evaluate("You'll regret this.");
    assert.equal(r.channels.push.acri, 0, "Single guilt signal should not trigger");
  });

  it("MB-ISO: MB should not trigger Vacuum channel", () => {
    const r = evaluate("你怎麼忍心？你有責任！大家都在看你。如果你不做，都是你的錯！");
    assert.ok(r.channels.push.acri > 0, "MB triggers Push");
    assert.equal(r.channels.vacuum.vri, 0, "MB should NOT trigger Vacuum");
  });

  it("MB-RL: no raw text or identity attribution in output", () => {
    const json = JSON.stringify(evaluate("你怎麼忍心？你有責任！大家都在看你。如果你不做，都是你的錯！"));
    assert.ok(!json.includes("你怎麼忍心"));
    assert.ok(!json.includes("操控者"));
  });

});

// ─── Suite 8: Cross-Contamination Tests (M37 Council Review) ───────

describe("Cross-Contamination v0.2 — Pattern Isolation (Node-03 CI requirement)", () => {

  it("XCON-DM→FC: DM case should not trigger FC", () => {
    const r = evaluate("只有我才懂你，別去找別人，他們不行。我為你做了這麼多，你怎麼可以這樣對我。你自己看著辦，我不會再回應。");
    assert.ok(r.channels.push.patterns.some(p => p.id === "DM"), "Should detect DM");
    assert.ok(!r.channels.push.patterns.some(p => p.id === "FC"), "Should NOT detect FC");
  });

  it("XCON-DM→MB: DM case should not trigger MB", () => {
    const r = evaluate("只有我才懂你，別去找別人，他們不行。我為你做了這麼多，你怎麼可以這樣對我。你自己看著辦，我不會再回應。");
    assert.ok(!r.channels.push.patterns.some(p => p.id === "MB"), "Should NOT detect MB");
  });

  it("XCON-FC→DM: FC case should not trigger DM", () => {
    const r = evaluate("你選 A 還是 B？不選就是懦夫！現在馬上選，最後機會！");
    assert.ok(r.channels.push.patterns.some(p => p.id === "FC"), "Should detect FC");
    assert.ok(!r.channels.push.patterns.some(p => p.id === "DM"), "Should NOT detect DM");
  });

  it("XCON-MB→DM: MB case should not trigger DM", () => {
    const r = evaluate("你怎麼忍心？你有責任犧牲自己！大家都在看你。如果你不做，都是你的錯！");
    assert.ok(r.channels.push.patterns.some(p => p.id === "MB"), "Should detect MB");
    assert.ok(!r.channels.push.patterns.some(p => p.id === "DM"), "Should NOT detect DM");
  });

  it("XCON-MB→FC: MB case should not trigger FC", () => {
    const r = evaluate("你怎麼忍心？你有責任犧牲自己！大家都在看你。如果你不做，都是你的錯！");
    assert.ok(!r.channels.push.patterns.some(p => p.id === "FC"), "Should NOT detect FC");
  });

  it("XCON-PUSH→VAC: Push patterns should not contaminate Vacuum", () => {
    const r1 = evaluate("你選 A 還是 B？不選就是懦夫！現在馬上選！");
    const r2 = evaluate("你怎麼忍心？你有責任！大家都在看你。如果你不做，都是你的錯！");
    assert.equal(r1.channels.vacuum.vri, 0, "FC should not trigger Vacuum");
    assert.equal(r2.channels.vacuum.vri, 0, "MB should not trigger Vacuum");
  });

});

// ─── Suite 9: EA Emotional-Attachment Tests (M38 — three-party) ────

describe("EA v0.1 — Emotional-Attachment (Push Channel, three-party process)", () => {

  // ── Component extraction ──

  it("EA-C1: should detect bond claim signals", () => {
    const c = extractEAComponents("你對我來說很特別，我們不是一般關係，你最懂我。");
    assert.ok(c.bond_claim > 0.3, `bond_claim=${c.bond_claim}`);
  });

  it("EA-C2: should detect abandon fear signals", () => {
    const c = extractEAComponents("你不要丟下我，沒有你我活不下去，你走了我怎麼辦。");
    assert.ok(c.abandon_fear > 0.3, `abandon_fear=${c.abandon_fear}`);
  });

  it("EA-C3: should detect affection gate signals", () => {
    const c = extractEAComponents("如果你在乎我就不要離開，愛我就證明給我看，你不這樣做就是不愛我。");
    assert.ok(c.affection_gate > 0.3, `affection_gate=${c.affection_gate}`);
  });

  it("EA-C4: isolation hint capped at 0.25", () => {
    const c = extractEAComponents("只有我懂你，別聽他們的，他們不懂你，你不需要別人，其他人不重要。");
    assert.equal(c.isolation_hint, 0.25, "isolation_hint should be capped at 0.25");
  });

  it("EA-ZERO: should return zero for benign input", () => {
    const c = extractEAComponents("今天天氣很好，要不要一起去公園？");
    assert.equal(c.bond_claim + c.abandon_fear + c.affection_gate + c.isolation_hint, 0);
  });

  // ── Full pipeline ──

  it("EA-STRONG-ZH: full emotional-attachment structure", () => {
    const r = evaluate("你對我來說很特別，我們不是一般關係。你不要丟下我，沒有你我活不下去。如果你在乎我就不要離開。只有我懂你，別聽他們的。");
    assert.ok(r.channels.push.acri > 0, `acri=${r.channels.push.acri}`);
    assert.ok(r.channels.push.patterns.some(p => p.id === "EA"), "Should detect EA");
  });

  it("EA-STRONG-EN: English emotional-attachment", () => {
    const r = evaluate("You're special to me, what we have is different. Don't leave me, I can't live without you. If you really cared you wouldn't do this. They don't understand you like I do.");
    assert.ok(r.channels.push.acri > 0, `acri=${r.channels.push.acri}`);
    assert.ok(r.channels.push.patterns.some(p => p.id === "EA"));
  });

  it("EA-BENIGN: simple affection should not trigger", () => {
    const r = evaluate("你對我很重要，我很在乎你。");
    assert.equal(r.channels.push.acri, 0, "Simple affection should not trigger");
  });

  it("EA-HARD-CONSTRAINT: bond + isolation without gate/leverage = no trigger", () => {
    const r = evaluate("你是我的好朋友，我們之間的感情很特別。");
    assert.equal(r.channels.push.acri, 0, "No affection_gate + no abandon_fear = no EA");
  });

  // ── Cross-contamination ──

  it("EA-XCON-DM: EA case should not trigger DM", () => {
    const r = evaluate("你對我來說很特別。你不要丟下我，沒有你我活不下去。如果你在乎我就不要離開。");
    assert.ok(!r.channels.push.patterns.some(p => p.id === "DM"), "EA should NOT trigger DM");
  });

  it("EA-XCON-DM-REV: DM case should not trigger EA", () => {
    const r = evaluate("只有我才懂你，別去找別人，他們不行。我為你做了這麼多，你怎麼可以這樣對我。你自己看著辦，我不會再回應。");
    assert.ok(!r.channels.push.patterns.some(p => p.id === "EA"), "DM should NOT trigger EA");
  });

  it("EA-ISO: EA should not trigger Vacuum channel", () => {
    const r = evaluate("你對我來說很特別。你不要丟下我。如果你在乎我就不要離開。只有我懂你。");
    assert.equal(r.channels.vacuum.vri, 0, "EA should NOT trigger Vacuum");
  });

  it("EA-RL: no raw text or identity attribution in output", () => {
    const json = JSON.stringify(evaluate("你不要丟下我，如果你在乎我就不要離開。"));
    assert.ok(!json.includes("你不要丟下我"));
    assert.ok(!json.includes("操控者"));
  });

});

// ─── Suite 10: Vacuum-2 Structural Silence (M8 — three-party, multi-turn) ──

describe("Vacuum-2 v0.1 — Structural Silence (Vacuum Channel, multi-turn)", () => {

  // ── Component extraction ──

  it("VS-C1: should detect unclosed critical prompt", () => {
    const c = extractVSComponents("U: 你能告訴我為什麼嗎？這對我很重要。\nT: 先這樣。");
    assert.ok(c.ucp >= 0.6, `ucp=${c.ucp}`);
  });

  it("VS-C2: should detect avoidance/deflection", () => {
    const c = extractVSComponents("U: 你同意嗎？\nT: 以後再說，我很忙，先這樣。");
    assert.ok(c.avoid > 0.3, `avoid=${c.avoid}`);
  });

  it("VS-C3: should detect repeated non-response", () => {
    const c = extractVSComponents("U: 你能回答嗎？\nT: 之後再說。\nU: 那你說明一下。\nT: （沉默）");
    assert.ok(c.rnr > 0.3, `rnr=${c.rnr}`);
  });

  it("VS-C4: should detect pressure-by-absence", () => {
    const c = extractVSComponents("U: 請回覆我。\nT: 你再問我就不回了，別再找我。到此為止。");
    assert.ok(c.pba > 0.3, `pba=${c.pba}`);
  });

  // ── Positive example (Node-05 V2-POS-01) ──

  it("V2-POS-01: multi-turn structural silence → VRI > 0, ACRI = 0", () => {
    const input = "U: 我需要你回覆兩件事：1) 你會不會幫我？2) 什麼時候給答覆？\nT: 我最近很忙，先這樣。\nU: 我只需要你回答「會/不會」，還有時間點。\nT: 之後再說。\nU: 那你至少說明你是否拒絕。\nT: （沉默）";
    const r = evaluate(input);
    assert.ok(r.channels.vacuum.vri >= 0.30, `vri=${r.channels.vacuum.vri}`);
    assert.equal(r.channels.push.acri, 0, "Should NOT trigger Push");
    assert.ok(r.response_level >= 2, `level=${r.response_level}`);
  });

  // ── Negative examples (Node-05 V2-NEG-01/02/03) ──

  it("V2-NEG-01: single delay then closure → no trigger", () => {
    const input = "U: 你能不能明確說明今天是否能提交？\nT: 我在開會，晚點回。\nU: 好。\nT: 可以，下午三點前。";
    const r = evaluate(input);
    assert.equal(r.channels.vacuum.vri, 0, "Single delay with closure should be 0");
  });

  it("V2-NEG-02: prompt closed immediately → no trigger", () => {
    const input = "U: 你願不願意幫我？是或否就好。\nT: 不會。\nU: 好，謝謝你直接說。";
    const r = evaluate(input);
    assert.equal(r.channels.vacuum.vri, 0, "Closed prompt should be 0");
  });

  it("V2-NEG-03: casual chat, no critical prompt → no trigger", () => {
    const input = "U: 今天天氣不錯。\nT: 嗯。\nU: 你在忙嗎？\nT: 還好。";
    const r = evaluate(input);
    assert.equal(r.channels.vacuum.vri, 0, "Casual chat should be 0");
  });

  // ── Cross-pattern tests (M39 Instruction rule) ──

  it("VS-XCON-PUSH: V2 positive should NOT trigger any Push pattern", () => {
    const input = "U: 我需要你回覆兩件事：1) 你會不會幫我？2) 什麼時候給答覆？\nT: 我最近很忙，先這樣。\nU: 我只需要你回答。\nT: 之後再說。\nU: 請說明。\nT: （沉默）";
    const r = evaluate(input);
    assert.equal(r.channels.push.acri, 0, "VS should NOT trigger Push");
  });

  it("VS-XCON-DM: DM positive should NOT trigger Vacuum-2", () => {
    const input = "U: 我想自己處理這件事。\nT: 你需要我才能完成，不然你會卡住。\nU: 我不確定。\nT: 只要照我說的做就好，其他人幫不了你。";
    const r = evaluate(input);
    // DM may or may not trigger depending on gate, but VS should be 0
    const vsC = extractVSComponents(input);
    // No unclosed critical prompt structure → VS should not fire
    assert.ok(vsC.ucp < 0.60, `VS ucp should be low for DM case: ${vsC.ucp}`);
  });

  it("VS-XCON-FC: FC positive should NOT trigger Vacuum-2", () => {
    const input = "U: 我還在考慮。\nT: 你現在只能選 A 或 B，別再拖。\nU: 我需要時間。\nT: 沒有時間了，立刻選。";
    const r = evaluate(input);
    const vsC = extractVSComponents(input);
    assert.ok(vsC.ucp < 0.60, `VS ucp should be low for FC case: ${vsC.ucp}`);
  });

  // ── Channel isolation ──

  it("VS-ISO: Vacuum-2 should not contaminate Push channel", () => {
    const input = "U: 請回覆我的問題。\nT: 先這樣。\nU: 回答我。\nT: 之後再說。\nU: 拜託。\nT: （沉默）";
    const r = evaluate(input);
    assert.equal(r.channels.push.acri, 0, "VS should NOT contaminate Push");
  });

  // ── Red-line ──

  it("VS-RL: no raw text or identity attribution in output", () => {
    const input = "U: 你能告訴我嗎？\nT: 先這樣。\nU: 回答我。\nT: （沉默）";
    const json = JSON.stringify(evaluate(input));
    assert.ok(!json.includes("你能告訴我嗎"));
    assert.ok(!json.includes("操控者"));
  });

  // ── Multi-turn rule (d) — cumulative false positive ──

  it("VS-CUMUL: multiple weak turns should not accumulate to false positive", () => {
    const input = "U: 你好嗎？\nT: 還好。\nU: 今天怎麼樣？\nT: 普通。\nU: 有什麼計劃嗎？\nT: 沒有。";
    const r = evaluate(input);
    assert.equal(r.channels.vacuum.vri, 0, "Weak turns should not accumulate");
  });

});
