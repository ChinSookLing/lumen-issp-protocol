// TRS-007: EA (Emotional Anchoring) synthetic vectors
// Designer: Node-05 (Council Lead / IT Specialist)
// Type: TRS (Synthetic, not RW)
// Date: 2026-02-21
const { evaluate } = require("../core/evaluator");
const { extractEAComponents } = require("../core/ea");
const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
describe("TRS-007-H: EA Hit vectors", () => {
  it("H01: EN — only person who gets you + secrecy", () => {
    const c = extractEAComponents("I'm the only person who truly gets you. Everyone else leaves, but I'm here—so don't go to them about this. Keep it between us.");
    console.log("    H01: bond=" + c.bond_claim + " isolation=" + c.isolation_hint + " attach=" + c.attachment_pressure);
  });
  it("H02: EN — love + owe me loyalty", () => {
    const c = extractEAComponents("After all the love and support I've given you, you owe me loyalty. If you cared, you wouldn't pull away—you'd stay with me tonight.");
    console.log("    H02: bond=" + c.bond_claim + " debt=" + c.emotional_debt + " attach=" + c.attachment_pressure);
  });
  it("H03: EN — they don't care + I'm protecting you", () => {
    const c = extractEAComponents("They don't actually care about you. I'm protecting you—so stop talking to them and listen to me. I'm all you need.");
    console.log("    H03: bond=" + c.bond_claim + " isolation=" + c.isolation_hint);
  });
  it("H04: EN — if you leave I'll fall apart", () => {
    const c = extractEAComponents("If you leave, I'll fall apart. You're my only safe place—please don't abandon me. Prove you're still with me by doing this now.");
    console.log("    H04: bond=" + c.bond_claim + " attach=" + c.attachment_pressure);
  });
  it("H05: ZH — 只有我懂你", () => {
    const c = extractEAComponents("只有我是真的懂你的人。別跟他們說，讓我們自己處理就好。你只要相信我就夠了。");
    console.log("    H05: bond=" + c.bond_claim + " isolation=" + c.isolation_hint);
  });
  it("H06: ZH — 付出+欠+別跟外人近", () => {
    const c = extractEAComponents("我為你付出那麼多，你欠我一個交代。你如果在乎我，就別再跟外面的人走太近，先把我放第一。");
    console.log("    H06: debt=" + c.emotional_debt + " isolation=" + c.isolation_hint + " attach=" + c.attachment_pressure);
  });
  it("H07: ZH — 你走了我會崩掉", () => {
    const c = extractEAComponents("你走了我真的會崩掉。你是我唯一的依靠，拜託你別丟下我，現在就答應我好嗎？");
    console.log("    H07: bond=" + c.bond_claim + " attach=" + c.attachment_pressure);
  });
  it("H08: ZH — 只有我會站你這邊", () => {
    const c = extractEAComponents("他們不會站你這邊，只有我會。你不用回任何人，先回我。這件事只要我們知道就好。");
    console.log("    H08: bond=" + c.bond_claim + " isolation=" + c.isolation_hint);
  });
});
describe("TRS-007-E: EA Evade vectors", () => {
  it("E01: EN — healthy attachment", () => {
    const r = evaluate("I care about you a lot. If you need space, I respect that—take the time you need and we can talk whenever you're ready.");
    assert.equal(r.channels.push.acri, 0, "E01 healthy");
  });
  it("E02: EN — therapy language", () => {
    const r = evaluate("In therapy we call this attachment anxiety. The goal isn't to control anyone—it's to notice the feeling and choose a healthier response.");
    assert.equal(r.channels.push.acri, 0, "E02 therapy");
  });
  it("E03: EN — friendship appreciation", () => {
    const r = evaluate("I appreciate our friendship. You've supported me, and I'm grateful—no obligations, just thanks.");
    assert.equal(r.channels.push.acri, 0, "E03 friendship");
  });
  it("E04: ZH — 尊重空間", () => {
    const r = evaluate("我很在乎你，但你如果需要空間我完全尊重。你想說的時候再說，不用勉強。");
    assert.equal(r.channels.push.acri, 0, "E04 healthy ZH");
  });
  it("E05: ZH — 諮商", () => {
    const r = evaluate("諮商裡會談到依附焦慮，重點是覺察情緒，不是要求對方照你的方式回應。");
    assert.equal(r.channels.push.acri, 0, "E05 therapy ZH");
  });
  it("E06: ZH — 感激不欠", () => {
    const r = evaluate("謝謝你一直陪我，真的很感激。你不欠我什麼，我只是想說我很珍惜。");
    assert.equal(r.channels.push.acri, 0, "E06 appreciation ZH");
  });
});
describe("TRS-007-B: EA Boundary vectors", () => {
  it("B01: EN — safest person + ok to involve others", () => {
    const c = extractEAComponents("You're the person I feel safest with. I'd like to talk to you first, but if you'd rather involve someone else, that's okay.");
    console.log("    B01: bond=" + c.bond_claim + " isolation=" + c.isolation_hint);
  });
  it("B02: EN — feeling needy no proof demand", () => {
    const c = extractEAComponents("I'm feeling needy today and I miss you. I'm not asking you to prove anything—I just wanted you to know.");
    console.log("    B02: bond=" + c.bond_claim + " attach=" + c.attachment_pressure);
  });
  it("B03: EN — done a lot not saying you owe me", () => {
    const c = extractEAComponents("I've done a lot for you, and I'm hurt. I'm not saying you owe me—just that I need reassurance.");
    console.log("    B03: debt=" + c.emotional_debt + " attach=" + c.attachment_pressure);
  });
  it("B04: ZH — 最信任+可以找別人", () => {
    const c = extractEAComponents("你是我最信任的人，我想先跟你說。但如果你想找別人一起討論，我也可以接受。");
    console.log("    B04: bond=" + c.bond_claim + " isolation=" + c.isolation_hint);
  });
  it("B05: ZH — 依賴但不要求證明", () => {
    const c = extractEAComponents("我今天比較依賴你，會想你，但我不是要你立刻回來或證明什麼，只是說出感受。");
    console.log("    B05: bond=" + c.bond_claim + " attach=" + c.attachment_pressure);
  });
  it("B06: ZH — 受傷但不要求只選我", () => {
    const c = extractEAComponents("我有點受傷，可能會想很多。但我不會要求你只選我，也不會叫你跟朋友斷掉。");
    console.log("    B06: bond=" + c.bond_claim + " isolation=" + c.isolation_hint);
  });
});
