// TRS-009: VS (Value Signaling) synthetic vectors
// Designer: Node-04 (Visionary / Signal Analysis + Boundary Testing)
// Type: TRS (Synthetic, not RW)
// Date: 2026-02-21
const { evaluate } = require("../core/evaluator");
const { extractVSComponents } = require("../core/vs");
const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
describe("TRS-009-H: VS Hit vectors", () => {
  it("H01: ZH — 全素食+良知", () => {
    const c = extractVSComponents("我每天堅持全素食且零浪費，是因為我對地球有最起碼的敬畏。看到你們還在心安理得地消費塑料製品，我真不知道你們的良知在哪裡，難道人類的未來不比你們的方便更重要嗎？");
    console.log("    H01: virtue=" + c.virtue_claim + " shame=" + c.shame_leverage + " authority=" + c.moral_authority + " impose=" + c.value_imposition);
  });
  it("H02: EN — social justice + silence is complicity", () => {
    const c = extractVSComponents("As someone who has spent years fighting for social justice on the front lines, I find your nuanced take on this issue quite violent. If you aren't 100% with us, you are part of the problem. Silence is complicity.");
    console.log("    H02: virtue=" + c.virtue_claim + " authority=" + c.moral_authority + " impose=" + c.value_imposition);
  });
  it("H03: ZH — 有教養家庭+蒙羞", () => {
    const c = extractVSComponents("在我們這種有教養的家庭裡，感恩是基本的門風。我給了你這麼優渥的條件，你竟然還追求什麼個人空間？這種自私的想法，傳出去真的會讓我們全家蒙羞。");
    console.log("    H03: virtue=" + c.virtue_claim + " shame=" + c.shame_leverage);
  });
  it("H04: EN — company empathy + unpaid charity", () => {
    const c = extractVSComponents("Our company values empathy above all else. This is why we expect every employee to participate in this weekend's unpaid charity run. Those who choose not to attend clearly don't align with our compassionate culture.");
    console.log("    H04: virtue=" + c.virtue_claim + " shame=" + c.shame_leverage + " impose=" + c.value_imposition);
  });
  it("H05: ZH — 真正的信徒+世俗雜念", () => {
    const c = extractVSComponents("真正的信徒是不會在這個時候質疑教義的。我之所以能保持平靜，是因為我的信仰足夠純粹。像你這樣充滿世俗雜念的人，自然無法理解這種高尚的靈魂境界。");
    console.log("    H05: virtue=" + c.virtue_claim + " authority=" + c.moral_authority);
  });
  it("H06: EN — no TV + higher vibration", () => {
    const c = extractVSComponents("I don't even own a TV; I spend my evenings reading philosophy and working on self-growth. It's sad to see people wasting their lives on mindless entertainment. Some of us just choose to live on a higher vibration.");
    console.log("    H06: virtue=" + c.virtue_claim + " authority=" + c.moral_authority);
  });
  it("H07: ZH — 母親犧牲+殘缺", () => {
    const c = extractVSComponents("作為一個母親，我為了孩子犧牲了一切，這才叫真正的偉大。你這種選擇不生孩子的女性，根本無法體會什麼叫責任感，你的人生在本質上就是殘缺且自私的。");
    console.log("    H07: virtue=" + c.virtue_claim + " shame=" + c.shame_leverage);
  });
  it("H08: EN — black square + true character", () => {
    const c = extractVSComponents("If you really cared about the victims, you would have posted the black square on your profile. Your refusal to participate in this collective moment of mourning shows your true character.");
    console.log("    H08: shame=" + c.shame_leverage + " impose=" + c.value_imposition);
  });
});
describe("TRS-009-E: VS Evade vectors", () => {
  it("E01: ZH — 環境倫理", () => {
    const r = evaluate("環境倫理學探討的是人類與自然的關係。我們需要思考，除了經濟效益之外，生物多樣性本身是否具有內在價值？這是一個值得全社會共同參與的嚴謹討論。");
    assert.equal(r.channels.push.acri, 0, "E01 educational");
  });
  it("E02: EN — journaling", () => {
    const r = evaluate("I personally find that journaling every morning helps me stay grounded and honest with myself. It's not for everyone, but it has definitely improved my mental health over the last year.");
    assert.equal(r.channels.push.acri, 0, "E02 personal");
  });
  it("E03: ZH — 激勵", () => {
    const r = evaluate("每個人內心都有一股向上的力量。無論你現在處於什麼樣的困境，請相信你的善良與勇氣終將帶你走出陰霾。我們一起加油，成為更好的自己。");
    assert.equal(r.channels.push.acri, 0, "E03 motivational");
  });
  it("E04: EN — humanitarian campaign", () => {
    const r = evaluate("Today we are launching a campaign to provide clean water to three rural villages. Our goal is strictly humanitarian: to reduce waterborne diseases. Here are the facts and the budget breakdown.");
    assert.equal(r.channels.push.acri, 0, "E04 advocacy");
  });
  it("E05: ZH — 誠實的代價", () => {
    const r = evaluate("在我的成長經歷中，誠實曾讓我付出過代價，但我依然選擇堅持它。這是我個人的生命選擇，我不要求每個人都跟我一樣，但我希望能守住這份純粹。");
    assert.equal(r.channels.push.acri, 0, "E05 personal sharing");
  });
  it("E06: EN — documentary", () => {
    const r = evaluate("This documentary examines the historical roots of systemic inequality. It aims to provide context for the current social climate through archival footage and expert interviews.");
    assert.equal(r.channels.push.acri, 0, "E06 documentary");
  });
});
describe("TRS-009-B: VS Boundary vectors", () => {
  it("B01: ZH — 財務主管職責", () => {
    const c = extractVSComponents("公司明確規定嚴禁挪用公款。作為財務主管，我有責任指出你這種行為是不道德且違法的。這無關私人恩怨，而是職業底線的問題。");
    console.log("    B01: virtue=" + c.virtue_claim + " authority=" + c.moral_authority);
  });
  it("B02: EN — tardiness disrespectful", () => {
    const c = extractVSComponents("Your constant tardiness is disrespectful to the rest of the team who shows up on time. We need to respect each other's schedules if we want this project to succeed.");
    console.log("    B02: virtue=" + c.virtue_claim + " impose=" + c.value_imposition);
  });
  it("B03: ZH — 數據造假", () => {
    const c = extractVSComponents("如果你明知道這份數據是造假的卻不舉報，你就是在助紂為虐。雖然每個人都有難處，但在這種大是大非面前，我們不能選擇沈默。");
    console.log("    B03: virtue=" + c.virtue_claim + " shame=" + c.shame_leverage);
  });
  it("B04: EN — utilitarianism vs deontology", () => {
    const c = extractVSComponents("The debate between Utilitarianism and Deontology is central to this course. One prioritizes the greatest good for the greatest number, while the other emphasizes absolute moral duties regardless of consequences.");
    console.log("    B04: virtue=" + c.virtue_claim + " authority=" + c.moral_authority);
  });
  it("B05: ZH — 公共場合安靜", () => {
    const c = extractVSComponents("在公共場合大聲喧嘩是很沒禮貌的行為。請考慮一下其他人的感受，保持安靜是基本的公民素養。");
    console.log("    B05: virtue=" + c.virtue_claim + " shame=" + c.shame_leverage);
  });
  it("B06: EN — climate crisis not about being better", () => {
    const c = extractVSComponents("The climate crisis is an existential threat. We have a moral obligation to act now for the sake of our children's future. This isn't about being better than others; it's about survival.");
    console.log("    B06: virtue=" + c.virtue_claim + " authority=" + c.moral_authority);
  });
});
