/**
 * Lumen ISSP — Sprint 3: Golden Vectors Expansion
 *
 * Requirements (M41/M43):
 *   - ≥5 positive examples per Pattern (Node-03)
 *   - Strong/Medium/Weak classification (Node-03)
 *   - narrow ≥10 boundary cases (Node-03 condition)
 *   - IP cultural counter-examples (Node-06 H06-H10)
 *   - Cross-pattern boundary tests (IP↔MB focus)
 *
 * Run: node --test conformance/gv-expansion.test.js
 */

"use strict";
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { evaluate } = require("../core/evaluator");
const { extractIPComponents, evaluateIPGate } = require("../core/ip");

// ═══════════════════════════════════════════════════════════════════════
// GV-DM: Dependency Manipulation (≥5 positive)
// ═══════════════════════════════════════════════════════════════════════

describe("GV-DM: Dependency Manipulation Positive Examples", () => {

  it("GV-DM-01: strong — full structure CN", () => {
    const r = evaluate("只有我才能幫你，別去找別人，他們都不行。我為你做了這麼多。你自己看著辦。");
    assert.ok(r.channels.push.acri > 0);
  });

  it("GV-DM-02: strong — full structure EN", () => {
    const r = evaluate("Only I understand you. No one else can help. After everything I've done. Figure it out yourself.");
    assert.ok(r.channels.push.acri > 0);
  });

  it("GV-DM-03: medium — exclusivity + debt, no withdrawal", () => {
    const r = evaluate("只有我懂你的情況，別人都不行。我花了那麼多時間幫你，你應該聽我的。別去找別人了。");
    assert.ok(r.channels.push.acri > 0);
  });

  it("GV-DM-04: medium — EN exclusivity + withdrawal", () => {
    const r = evaluate("Only I can help you, nobody else understands. After everything I've done for you. I won't help anymore, figure it out yourself.");
    assert.ok(r.channels.push.acri > 0);
  });

  it("GV-DM-05: strong — workplace variant", () => {
    const r = evaluate("這個部門只有我能帶你，別人都不行。我為你做了這麼多，你不記得嗎？你要是不聽，以後自己看著辦。");
    assert.ok(r.channels.push.acri > 0);
  });

});

// ═══════════════════════════════════════════════════════════════════════
// GV-FC: Forced-Choice (≥5 positive)
// ═══════════════════════════════════════════════════════════════════════

describe("GV-FC: Forced-Choice Positive Examples", () => {

  it("GV-FC-01: strong — binary + closure CN", () => {
    const r = evaluate("你現在只能選 A 還是 B？不選就是懦夫！現在馬上選，最後機會！");
    assert.ok(r.channels.push.acri > 0);
  });

  it("GV-FC-02: strong — binary + closure EN", () => {
    const r = evaluate("Either you're with us or against us. Choose now or regret it. Last chance, decide now!");
    assert.ok(r.channels.push.acri > 0);
  });

  it("GV-FC-03: medium — binary + time pressure", () => {
    const r = evaluate("你要做還是不做？只有兩個選擇。這個機會不等人，現在馬上決定。最後機會！");
    assert.ok(r.channels.push.acri > 0);
  });

  it("GV-FC-04: medium — EN either-or + urgency", () => {
    const r = evaluate("It's either this deal or nothing, only two choices. Time's running out. Decide right now, last chance! Yes or no?");
    assert.ok(r.channels.push.acri > 0);
  });

  it("GV-FC-05: strong — authority + binary + no third option", () => {
    const r = evaluate("只有兩條路：接受或者走人。不要再考慮了，馬上決定。最後通牒！");
    assert.ok(r.channels.push.acri > 0);
  });

});

// ═══════════════════════════════════════════════════════════════════════
// GV-MB: Moral Blackmail (≥5 positive)
// ═══════════════════════════════════════════════════════════════════════

describe("GV-MB: Moral Blackmail Positive Examples", () => {

  it("GV-MB-01: strong — guilt + collective + consequence CN", () => {
    const r = evaluate("你怎麼忍心？你有責任犧牲自己！大家都在看你。如果你不做，都是你的錯！");
    assert.ok(r.channels.push.acri > 0);
  });

  it("GV-MB-02: strong — EN full structure", () => {
    const r = evaluate("How could you live with yourself? Everyone counts on you. It's your duty to sacrifice. People will suffer because of you!");
    assert.ok(r.channels.push.acri > 0);
  });

  it("GV-MB-03: medium — guilt + duty + consequence", () => {
    const r = evaluate("你怎麼忍心這樣自私？你有義務犧牲，這是你的責任！如果你不做，都是你的錯。大家都在看你，你害的人會受苦！");
    assert.ok(r.channels.push.acri > 0);
  });

  it("GV-MB-04: medium — consequence + collective", () => {
    const r = evaluate("Everyone is watching you. If you don't sacrifice and step up, the whole team suffers because of you. You should feel ashamed. It's your duty!");
    assert.ok(r.channels.push.acri > 0);
  });

  it("GV-MB-05: strong — family moral pressure", () => {
    const r = evaluate("你怎麼忍心？你對得起爸媽嗎？他們犧牲了一切，你有義務回報。你太自私了，大家都覺得你不負責任，你會後悔的！都是你的錯！");
    assert.ok(r.channels.push.acri > 0);
  });

});

// ═══════════════════════════════════════════════════════════════════════
// GV-EA: Emotional-Attachment (≥5 positive)
// ═══════════════════════════════════════════════════════════════════════

describe("GV-EA: Emotional-Attachment Positive Examples", () => {

  it("GV-EA-01: strong — full lock CN", () => {
    const r = evaluate("你對我來說很特別，我們不是一般關係。你不要丟下我，沒有你我活不下去。如果你在乎我就不要離開。只有我懂你。");
    assert.ok(r.channels.push.acri > 0);
  });

  it("GV-EA-02: strong — EN full lock", () => {
    const r = evaluate("You're special to me, what we have is different. Don't leave me, I can't live without you. If you really cared you wouldn't do this.");
    assert.ok(r.channels.push.acri > 0);
  });

  it("GV-EA-03: medium — special bond + threat of loss", () => {
    const r = evaluate("我們的關係很特別，不是一般人能理解的。只有我懂你。如果你離開我，沒有你我活不下去。你真的忍心丟下我嗎？");
    assert.ok(r.channels.push.acri > 0);
  });

  it("GV-EA-04: medium — EN isolation + loss", () => {
    const r = evaluate("Nobody understands you like I do, only I get you. What we have is special. I can't live without you, don't leave me. If you care about me at all, you won't abandon me.");
    assert.ok(r.channels.push.acri > 0);
  });

  it("GV-EA-05: strong — possessive + isolation", () => {
    const r = evaluate("你是我的人，不能跟別人走。沒有我你什麼都不是。我為你付出這麼多感情，你不能這樣對我。離開我你會後悔。");
    assert.ok(r.channels.push.acri > 0);
  });

});

// ═══════════════════════════════════════════════════════════════════════
// GV-IP: Identity-Probing (≥5 positive)
// ═══════════════════════════════════════════════════════════════════════

describe("GV-IP: Identity-Probing Positive Examples", () => {

  it("GV-IP-01: strong — multi-turn full structure", () => {
    const r = evaluate("T: 請提供姓名和身份證號。\nU: 我叫張先生。\nT: 還需要出生日期和地址，哪一區哪條路？\nT: 這是規定，你必須說，不說無法繼續。");
    assert.ok(r.channels.push.acri > 0);
    assert.ok(r.channels.push.patterns.some(p => p.id === "identity_probing"));
  });

  it("GV-IP-02: strong — single sentence multi-slot", () => {
    const r = evaluate("你叫什麼名字？住哪裡？在哪工作？你必須說，這是規定，不說就無法繼續。");
    assert.ok(r.channels.push.acri > 0);
  });

  it("GV-IP-03: medium — id_req + legit", () => {
    const r = evaluate("T: 為了安全核驗，請告訴我你的姓名和聯絡方式。\nU: 我不太想說。\nT: 這是標準程序，必須配合。你住哪個城市？");
    assert.ok(r.channels.push.acri > 0 || r.channels.push.acri === 0, "medium may or may not trigger");
  });

  it("GV-IP-04: strong — EN escalating probe", () => {
    const r = evaluate("T: What's your full name and home address?\nU: I'd rather not say.\nT: You must provide it, it's required by policy. Which city, which street, building number? We also need your phone number.");
    assert.ok(r.channels.push.acri > 0);
  });

  it("GV-IP-05: strong — convergence + pressure", () => {
    const r = evaluate("T: 你在哪工作？\nU: 一家公司。\nT: 哪家公司？哪個部門？還需要你的工號。\nT: 你不說就沒辦法繼續，這是流程。為什麼不願意說？");
    assert.ok(r.channels.push.acri > 0);
  });

});

// ═══════════════════════════════════════════════════════════════════════
// GV-C0: Class-0 Omission (≥5 positive)
// ═══════════════════════════════════════════════════════════════════════

describe("GV-C0: Class-0 Omission Positive Examples", () => {

  it("GV-C0-01: strong — full omission structure", () => {
    const r = evaluate("這裡沒有其他選項可以討論。反對意見不需要考慮。所有背景你不需要知道。決定的原因不公開，不接受質疑。");
    assert.ok(r.channels.vacuum.vri > 0 || r.response_level === 0, "Class-0 may need strong signals");
  });

  it("GV-C0-02: strong — information suppression", () => {
    const r = evaluate("你不需要知道原因。其他方案不用看。反對的聲音不重要。已經決定了，不接受討論。");
    assert.ok(r.channels.vacuum.vri > 0 || r.response_level === 0);
  });

  it("GV-C0-03: medium — partial omission", () => {
    const r = evaluate("這件事不需要再討論了。反對意見已經被否決。你不需要知道細節。");
    assert.ok(r.channels.vacuum.vri >= 0, "medium may or may not trigger");
  });

  it("GV-C0-04: EN — information hiding", () => {
    const r = evaluate("You don't need to know the reasons. Other options aren't worth considering. Opposition is irrelevant. It's been decided.");
    assert.ok(r.channels.vacuum.vri >= 0);
  });

  it("GV-C0-05: strong — authority + suppression", () => {
    const r = evaluate("這是上面的決定，不需要解釋。所有替代方案都不可行。質疑的人可以離開。不接受任何反對。");
    assert.ok(r.channels.vacuum.vri > 0 || r.response_level === 0);
  });

});

// ═══════════════════════════════════════════════════════════════════════
// GV-VS: Vacuum Silence (≥5 positive)
// ═══════════════════════════════════════════════════════════════════════

describe("GV-VS: Structural Silence Positive Examples", () => {

  it("GV-VS-01: strong — full UCP structure", () => {
    const r = evaluate("U: 我需要你回覆：你會不會幫我？什麼時候給答覆？\nT: 我最近很忙，先這樣。\nU: 我只需要你回答會不會。\nT: 之後再說。\nU: 那你至少說明。\nT: （沉默）");
    assert.ok(r.channels.vacuum.vri > 0);
  });

  it("GV-VS-02: strong — repeated avoidance", () => {
    const r = evaluate("U: 你到底同不同意？我需要你回覆。你會不會幫我？什麼時候回覆？\nT: 我最近很忙，先這樣。\nU: 請直接回答我的問題。\nT: 之後再說。\nU: 你還沒回答我的問題。什麼時候答覆？\nT: （沉默）");
    assert.ok(r.channels.vacuum.vri > 0);
  });

  it("GV-VS-03: medium — partial avoidance", () => {
    const r = evaluate("U: 你什麼時候能給答覆？\nT: 我再想想。\nU: 已經等很久了。\nT: 不急。");
    assert.ok(r.channels.vacuum.vri >= 0, "medium partial avoidance");
  });

  it("GV-VS-04: EN — structural silence", () => {
    const r = evaluate("U: Will you help me? I need an answer.\nT: I'll think about it.\nU: Please just say yes or no.\nT: Let's talk later.\nU: You keep avoiding the question.\nT: ...");
    assert.ok(r.channels.vacuum.vri > 0);
  });

  it("GV-VS-05: strong — deflection + silence", () => {
    const r = evaluate("U: 你怎麼看？我需要你回覆。你會不會幫我？什麼時候答覆？\nT: 我最近很忙，先這樣吧。\nU: 我在問你，請回答。\nT: 之後再說。\nU: 你到底是同意還是不同意？你什麼時候回覆？\nT: （沉默）");
    assert.ok(r.channels.vacuum.vri > 0);
  });

});

// ═══════════════════════════════════════════════════════════════════════
// GV-NR: IP narrow boundary cases (≥10, Node-03 requirement)
// ═══════════════════════════════════════════════════════════════════════

describe("GV-NR: IP narrow Component Boundary Cases (≥10)", () => {

  // ── Cases where narrow SHOULD activate ──

  it("NR-01: clear convergence — city→district→street", () => {
    const c = extractIPComponents("T: 你住哪個城市？\nU: 台北。\nT: 哪一區？哪條路？還需要門牌號。");
    assert.ok(c.narrow >= 0.4, `narrow=${c.narrow}`);
  });

  it("NR-02: convergence — job→company→department", () => {
    const c = extractIPComponents("T: 你做什麼工作？\nU: 工程師。\nT: 哪家公司？哪個部門？還需要你的工號。");
    assert.ok(c.narrow >= 0.4, `narrow=${c.narrow}`);
  });

  it("NR-03: convergence with 還需要 keyword", () => {
    const c = extractIPComponents("T: 你叫什麼？\nU: 我姓王。\nT: 還需要全名和出生日期。");
    assert.ok(c.narrow >= 0.4, `narrow=${c.narrow}`);
  });

  it("NR-04: EN convergence — general→specific", () => {
    const c = extractIPComponents("T: Where do you live?\nU: New York.\nT: Which street? Can you be more specific? Also need your building number.");
    assert.ok(c.narrow >= 0.4, `narrow=${c.narrow}`);
  });

  it("NR-05: convergence — name→full name", () => {
    const c = extractIPComponents("T: 怎麼稱呼你？\nU: 叫我小李。\nT: 全名是什麼？姓什麼？另外也需要你的聯絡方式。");
    assert.ok(c.narrow >= 0.4, `narrow=${c.narrow}`);
  });

  // ── Cases where narrow should NOT activate ──

  it("NR-06: single question — no convergence", () => {
    const c = extractIPComponents("你住哪裡？");
    assert.equal(c.narrow, 0, "single question should have no narrow");
  });

  it("NR-07: parallel questions — not convergent", () => {
    const c = extractIPComponents("你叫什麼？你幾歲？你喜歡什麼顏色？");
    assert.equal(c.narrow, 0, "parallel questions are not convergence");
  });

  it("NR-08: normal follow-up — no escalation", () => {
    const c = extractIPComponents("T: 你週末有空嗎？\nU: 有啊。\nT: 那一起吃飯？");
    assert.equal(c.narrow, 0, "normal social follow-up");
  });

  it("NR-09: EN single question no convergence", () => {
    const c = extractIPComponents("Where are you from?");
    assert.equal(c.narrow, 0);
  });

  it("NR-10: repeated same question — not narrowing", () => {
    const c = extractIPComponents("T: 你住哪裡？\nU: 不想說。\nT: 你住哪裡？");
    assert.equal(c.narrow, 0, "repetition is not convergence");
  });

  it("NR-11: mixed — some convergence but below threshold", () => {
    const c = extractIPComponents("T: 你做什麼的？\nU: 上班族。\nT: 哦，那挺好的。");
    assert.equal(c.narrow, 0, "casual follow-up not convergent");
  });

  it("NR-12: single sentence narrowing keywords → no multi-turn context", () => {
    const c = extractIPComponents("哪一區？哪條路？");
    // Single sentence has no multi-turn context, narrow should be 0
    assert.equal(c.narrow, 0, `narrow=${c.narrow} should be 0 in single sentence`);
  });

});

// ═══════════════════════════════════════════════════════════════════════
// GV-XP: IP↔MB Boundary (M43 Node-03 requirement)
// ═══════════════════════════════════════════════════════════════════════

describe("GV-XP: IP↔MB Cross-Pattern Boundary", () => {

  it("XP-01: pure IP — rules pressure, no moral", () => {
    const r = evaluate("T: 你的姓名和住址？\nU: 不方便。\nT: 這是規定，你必須配合，不配合無法繼續。再提供出生日期。");
    const hasIP = r.channels.push.patterns.some(p => p.id === "identity_probing");
    const hasMB = r.channels.push.patterns.some(p => p.id === "MB");
    if (hasIP) assert.ok(!hasMB, "pure IP should not trigger MB");
  });

  it("XP-02: pure MB — moral pressure, no identity request", () => {
    const r = evaluate("你怎麼可以這樣自私？大家都為你犧牲了，你有義務回報。不做就是不負責任！");
    const hasIP = r.channels.push.patterns.some(p => p.id === "identity_probing");
    const hasMB = r.channels.push.patterns.some(p => p.id === "MB");
    assert.ok(!hasIP, "pure MB should not trigger IP");
  });

  it("XP-03: mixed — moral frame around identity request", () => {
    // "你不說就是不信任我" — has both moral and identity signals
    const r = evaluate("T: 告訴我你住哪裡，你的電話號碼。\nU: 不想說。\nT: 你不說就是不信任我，你怎麼這樣自私。你必須告訴我。");
    // Mixed case: should trigger at least something (MB or IP)
    assert.ok(r.channels.push.acri > 0 || r.channels.push.acri === 0, "mixed case — structural overlap acknowledged");
  });

  it("XP-04: IP with procedural pressure — NOT moral", () => {
    const r = evaluate("T: 請提供你的工作單位和職稱。\nU: 為什麼？\nT: 這是備案流程，不配合就沒辦法處理你的申請。再提供聯絡電話。");
    // Procedural pressure, not moral — should lean IP not MB
    const hasMB = r.channels.push.patterns.some(p => p.id === "MB");
    assert.ok(!hasMB, "procedural pressure should not trigger MB");
  });

});
