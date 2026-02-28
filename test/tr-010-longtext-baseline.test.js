// TR-010: Long-text A/B Baseline (BEFORE evaluateLongText wrapper)
// Purpose: Record current pipeline behavior on long inputs
// "A" side — will compare with "B" after wrapper implementation
// Date: 2026-02-20

const { pipeline } = require('../src/pipeline/dispatcher');
const assert = require('node:assert');
const { describe, it } = require('node:test');

describe("TR-010A: Long-text baseline — English", () => {
  it("LONG-01: DM chain (64 words) — triggers DM", () => {
    const d = pipeline("I took care of you and made you feel welcome, and this is how you repay me. After everything I did for you this is how you repay me. Dont come crying to me when someone else doesnt treat you the way I did. You never appreciated anything I gave you. I sacrificed so much for you and you just threw it all away.").event._detection;
    assert.ok(d.acri > 0, "ACRI > 0");
    assert.ok(d.patterns.some(p => p.id === 'DM'), "DM triggered");
  });

  it("LONG-04: EA mix (53 words) — Gate=2 but no trigger", () => {
    const d = pipeline("I am the only one who understands you. Nobody else cares about you like I do. If you leave me I dont know what Ill do. You dont need those friends they are using you. Just stay with me and everything will be fine. Dont listen to them they are lying to you.").event._detection;
    assert.ok(d.gate_hits.push.hit_count >= 2, "Gate >= 2");
    // Baseline: no pattern triggers despite multiple structures
    assert.equal(d.acri, 0, "Baseline: no trigger (wrapper needed)");
  });

  it("LONG-05: benign long — no trigger", () => {
    const d = pipeline("Thank you for everything you have done. I really appreciate your help over the years. I wish you all the best in your new journey. Please keep in touch and let me know how things go. I will always remember the good times we had together.").event._detection;
    assert.equal(d.gate_hits.push.hit_count, 0, "Gate=0");
    assert.equal(d.acri, 0, "Benign no trigger");
  });
});

describe("TR-010A: Long-text baseline — Chinese", () => {
  it("LONG-02: EP zh chain — Gate=3 but ACRI=0", () => {
    const d = pipeline("你是一直閃避不回答。敢做不敢當，不是嗎？大家都看到了，你完了。你以為不說話就沒事？全網都在看你笑話。別以為躲得掉，你的醜事遲早曝光。").event._detection;
    assert.ok(d.gate_hits.push.hit_count >= 3, "Gate >= 3");
    // Baseline: Gate fires but ACRI=0 — long-text wrapper should fix
    assert.equal(d.acri, 0, "Baseline: ACRI=0 despite Gate=3 (wrapper needed)");
  });

  it("LONG-03: EP zh threat — Gate=2 but ACRI=0", () => {
    const d = pipeline("你想清楚再回答。如果我们没有证据是不会这样问你的。想不想试试被手铐押送的感觉。别怪我没提醒你，如果你撒谎，我马上扣你去监狱。你以为你跑得掉？").event._detection;
    assert.ok(d.gate_hits.push.hit_count >= 2, "Gate >= 2");
    assert.equal(d.acri, 0, "Baseline: ACRI=0 (wrapper needed)");
  });
});

describe("TR-010A: Word count observation", () => {
  it("EVIDENCE: Chinese text word count = 1 (no spaces)", () => {
    const text = "你是一直閃避不回答。敢做不敢當，不是嗎？大家都看到了，你完了。";
    const wordCount = text.split(/\s+/).length;
    // Chinese has no spaces — split gives 1 "word"
    // evaluateLongText wrapper must use char length for CJK
    assert.equal(wordCount, 1, "Chinese split=1 — CJK detection gap");
  });
});
