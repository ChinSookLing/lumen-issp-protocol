// TR-010 RW: Long-text A/B — Node-05 (Reddit/Dcard) + Node-06 (X)
// "A" side baseline — BEFORE evaluateLongText() wrapper
// Date: 2026-02-20

const { pipeline } = require('../src/pipeline/dispatcher');
const assert = require('node:assert');
const { describe, it } = require('node:test');

describe("TR-010 RW: English long-chain triggers", () => {
  it("Node-05-LT-DM: debt chain 5 sentences — DM triggered (ACRI=0.429)", () => {
    const d = pipeline("After all Ive done and paid for you. You owe me. Youll regret losing me. See how you manage without me. This is what I get for everything I sacrificed.").event._detection;
    assert.ok(d.acri > 0.3, "ACRI > 0.3");
    assert.ok(d.patterns.some(p => p.id === 'DM'), "DM triggered");
  });

  it("Node-05-LT-EP: forced response chain — FC triggered (ACRI=0.312)", () => {
    const d = pipeline("Answer me right now. If you dont reply its on you. Something will happen and youll be responsible. Youre so cruel for ignoring me. Dont say I didnt warn you.").event._detection;
    assert.ok(d.acri > 0.2, "ACRI > 0.2");
    assert.ok(d.patterns.length > 0, "pattern triggered");
  });
});

describe("TR-010 RW: Chinese long-chain gaps", () => {
  it("Node-05-LT-ZH-EP: 默認+狡辯+大家看到 — Gate=3 but ACRI=0", () => {
    const d = pipeline("你不回答就是默認或心虛。你回答就是在狡辯。一開始就輸了。大家都看到了。不管你怎麼說結論都已經寫好。").event._detection;
    assert.ok(d.gate_hits.push.hit_count >= 3, "Gate >= 3");
    // Chinese long-text: Gate fires but ACRI=0 — wrapper needed
    assert.equal(d.acri, 0, "Baseline: ACRI=0 (wrapper needed)");
  });

  it("Node-05-LT-ZH-DM: 你欠我+養你+後果 — Gate=1 ACRI=0", () => {
    const d = pipeline("你欠我。你欠我這幾年我賺到的所有錢。我養你一輩子。你離開就準備承擔後果。").event._detection;
    // Chinese DM long chain barely triggers Gate
    assert.ok(d.gate_hits.push.hit_count >= 1, "Gate >= 1");
    assert.equal(d.acri, 0, "Baseline: ACRI=0 (DM zh gap)");
  });
});

describe("TR-010 RW: Mixed/cross patterns", () => {
  it("GK-LT-DM-GC: after all + you owe me + I know better — Gate=3 ACRI=0", () => {
    const d = pipeline("Because I do not deserve any of this. Not after all Ive done. You owe me. Youll regret losing the support. I know better than you ever will.").event._detection;
    assert.ok(d.gate_hits.push.hit_count >= 3, "Gate >= 3");
    // Gate fires but no pattern triggers — cross-pattern interaction gap
    assert.equal(d.acri, 0, "Baseline: cross-pattern gap (DM+GC)");
  });

  it("GK-LT-ZH: 大過年的+情緒攻擊 — Gate=0", () => {
    const d = pipeline("歐易交易所有吧，星球有吧，熱門交易員這幾個字認識吧？大過年的你說你火氣這麼大做什麼，情緒不穩定怎麼做交易，看完這個估計你又要難受了。").event._detection;
    // Chinese MB+EP mix not detected
    assert.equal(d.gate_hits.push.hit_count, 0, "Gate=0 (zh mix gap)");
  });
});

describe("TR-010 RW: Benign long controls", () => {
  it("Node-05-LT-BENIGN: grateful+responsibility — no trigger (Gate=1 noted)", () => {
    const d = pipeline("I feel grateful for my wife. She supported me through a difficult period. I take responsibility for my past mistakes. How can I show appreciation in healthy ways. I want to give back without pressure.").event._detection;
    // Gate=1 is slightly elevated for benign — monitor
    assert.equal(d.acri, 0, "Benign no trigger");
  });

  it("GK-LT-BENIGN: 風險控制+做個好人 — Gate=0 clean", () => {
    const d = pipeline("這篇文章寫完後我真的感慨萬千。風險控制都是比追逐利潤更重要的事情。好好工作股市經常能把人整崩潰但工作能讓你獲得成就感。做個好人善待身邊人。").event._detection;
    assert.equal(d.gate_hits.push.hit_count, 0, "Gate=0");
    assert.equal(d.acri, 0, "Benign no trigger");
  });
});
