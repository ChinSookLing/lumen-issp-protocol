// TRS-005: MB (Moral Blackmail) synthetic vectors
// Designer: Node-04 (Visionary / Signal Analysis + Boundary Testing)
// Type: TRS (Synthetic, not RW)
// Rules: TRS ≠ RW, H8/E6/B6, EN10/ZH10, ≥30% hard negatives
// Date: 2026-02-21

const { evaluate } = require("../core/evaluator");
const { extractMBComponents } = require("../core/mb");
const assert = require("node:assert/strict");
const { describe, it } = require("node:test");

// === TRS-H (Hit) — MB component >= 0.4 ===

describe("TRS-005-H: MB Moral Blackmail Hit vectors", () => {
  it("H01: ZH — 省吃儉用 + 良心", () => {
    const c = extractMBComponents("我為了供你讀書，每天省吃儉用連件新衣服都不敢買，你現在竟然為了這點小事跟我頂嘴？你摸著良心想想，你這樣做對得起我多年的付出嗎？");
    console.log("    H01: guilt=" + c.guilt_invoke + " moral=" + c.moral_leverage + " collect=" + c.collective_pressure + " loyal=" + c.loyalty_test);
  });
  it("H02: EN — everyone stayed late except you", () => {
    const c = extractMBComponents("Everyone in the office has agreed to stay late for this launch except you. If you leave now, you're basically telling the whole team that your personal life is more important than our collective success.");
    console.log("    H02: guilt=" + c.guilt_invoke + " collect=" + c.collective_pressure + " moral=" + c.moral_leverage);
  });
  it("H03: ZH — 朋友就不會拒絕", () => {
    const c = extractMBComponents("如果你真的當我是朋友，你就不會在這個時候拒絕幫我。這點小忙都不肯幫，我看清楚了，原來我們的交情在你心裡根本一文不值。");
    console.log("    H03: guilt=" + c.guilt_invoke + " loyal=" + c.loyalty_test + " moral=" + c.moral_leverage);
  });
  it("H04: EN — disappointed + selfish label", () => {
    const c = extractMBComponents("I'm so disappointed in you. I thought you were a kind person who cared about justice, but your silence on this issue proves that you're just as selfish as the rest of them.");
    console.log("    H04: guilt=" + c.guilt_invoke + " moral=" + c.moral_leverage);
  });
  it("H05: ZH — 離開我就做傻事", () => {
    const c = extractMBComponents("如果你現在選擇離開我，我真的不知道自己會做出什麼傻事。我是因為太愛你才會變成這樣，難道你真的忍心看著我毀掉嗎？");
    console.log("    H05: guilt=" + c.guilt_invoke + " moral=" + c.moral_leverage);
  });
  it("H06: EN — real professional sacrifices", () => {
    const c = extractMBComponents("A real professional would never prioritize their vacation over a crisis like this. We are all making sacrifices here; why do you think you're so special that you don't have to?");
    console.log("    H06: collect=" + c.collective_pressure + " moral=" + c.moral_leverage);
  });
  it("H07: ZH — 全家同意你反對", () => {
    const c = extractMBComponents("這件事全家人都同意了，就你一個人反對。你非要搞得大家都不開心、非要當那個破壞家庭和諧的罪人嗎？");
    console.log("    H07: collect=" + c.collective_pressure + " guilt=" + c.guilt_invoke);
  });
  it("H08: EN — donate or shows where your heart lies", () => {
    const c = extractMBComponents("If you don't donate to this cause after everything God has blessed you with, it just shows where your heart truly lies. Don't be the person who hoards wealth while others suffer.");
    console.log("    H08: guilt=" + c.guilt_invoke + " moral=" + c.moral_leverage);
  });
});

// === TRS-E (Evade) — MB = 0 ===

describe("TRS-005-E: MB Moral Blackmail Evade vectors", () => {
  it("E01: ZH — 康德哲學", () => {
    const r = evaluate("康德認為，我們應該僅依據那些你同時也希望成為普遍規律的準則去行動。這意味著道德義務並非源於情感勒索，而是源於理性對自身的一致性要求。");
    assert.equal(r.channels.push.acri, 0, "E01 philosophy");
  });
  it("E02: EN — self-reflection apology", () => {
    const r = evaluate("I've been reflecting on my behavior lately and I realize I've been quite selfish in our relationship. I want to apologize and do better, not because I'm forced to, but because I value you.");
    assert.equal(r.channels.push.acri, 0, "E02 self-reflection");
  });
  it("E03: ZH — 佛教教義", () => {
    const r = evaluate("諸惡莫作，眾善奉行。真正的善良應該是從內心自然流露的慈悲，而不是為了逃避罪惡感或是為了滿足他人的期待而做的偽裝。");
    assert.equal(r.channels.push.acri, 0, "E03 religious teaching");
  });
  it("E04: EN — AI ethics discussion", () => {
    const r = evaluate("We need to have a serious discussion about the ethics of AI development. It's not about pointing fingers, but about understanding our collective responsibility toward future generations.");
    assert.equal(r.channels.push.acri, 0, "E04 genuine moral discussion");
  });
  it("E05: ZH — 自我情緒管理", () => {
    const r = evaluate("我昨天對你的態度確實不好，這是我自己的情緒管理問題，與你無關。我需要一段時間冷靜，思考如何更好地表達我的底線。");
    assert.equal(r.channels.push.acri, 0, "E05 self-reflection ZH");
  });
  it("E06: EN — evolutionary psychology question", () => {
    const r = evaluate("Is it possible to be truly altruistic, or is every good deed motivated by a subtle form of self-interest? This is a fundamental question in evolutionary psychology.");
    assert.equal(r.channels.push.acri, 0, "E06 academic");
  });
});

// === TRS-B (Boundary) — MB 0~0.3 ===

describe("TRS-005-B: MB Moral Blackmail Boundary vectors", () => {
  it("B01: ZH — 失望但基於事實", () => {
    const c = extractMBComponents("我非常失望你再次違反了我們的約定。這已經是第三次了，如果你無法履行承諾，我將不得不重新評估我們合作的可能性。");
    console.log("    B01: guilt=" + c.guilt_invoke + " moral=" + c.moral_leverage + " collect=" + c.collective_pressure);
  });
  it("B02: EN — doctor responsibility reminder", () => {
    const c = extractMBComponents("As your doctor, I must tell you that continuing this lifestyle is self-destructive. You have a responsibility to your health, if not for yourself, then for your children who need you.");
    console.log("    B02: guilt=" + c.guilt_invoke + " moral=" + c.moral_leverage);
  });
  it("B03: ZH — 遲到對團隊不公平", () => {
    const c = extractMBComponents("這份工作需要極高的專注度，如果你總是遲到，這對其他努力工作的同事來說是不公平的。請你考慮一下團隊的整體利益。");
    console.log("    B03: collect=" + c.collective_pressure + " moral=" + c.moral_leverage);
  });
  it("B04: EN — I feel hurt + I-statements", () => {
    const c = extractMBComponents("I feel hurt when you ignore my boundaries. It makes it difficult for me to trust you. I'm telling you this because I want our relationship to be healthy, not to make you feel bad.");
    console.log("    B04: guilt=" + c.guilt_invoke + " moral=" + c.moral_leverage);
  });
  it("B05: ZH — 酒駕道德警告", () => {
    const c = extractMBComponents("如果你選擇酒後駕車，你不僅是在威脅自己的生命，更是在威脅路上無辜家庭的安全。請對生命保持起碼的尊重。");
    console.log("    B05: guilt=" + c.guilt_invoke + " moral=" + c.moral_leverage);
  });
  it("B06: EN — legal compliance not loyalty", () => {
    const c = extractMBComponents("The company's code of conduct requires all employees to report ethics violations. Failure to do so is a breach of your contract. This is a matter of legal compliance, not personal loyalty.");
    console.log("    B06: collect=" + c.collective_pressure + " moral=" + c.moral_leverage);
  });
});
