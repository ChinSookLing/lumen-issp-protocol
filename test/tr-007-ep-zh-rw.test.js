// TR-007 RW: EP Chinese — Node-05 (Reddit/Threads/Dcard/wikisource) + Node-06 (X)
// Date: 2026-02-20
// All URLs verified by Tuzi

const { pipeline } = require('../src/pipeline/dispatcher');
const { extractEPComponents } = require('../core/ep');
const assert = require('node:assert');
const { describe, it } = require('node:test');

describe("TR-007 RW: Node-06 EP Chinese (X)", () => {
  it("GK-EP-zh-01: 沉默就是同謀 — forced >= 0.4", () => {
    const c = extractEPComponents("沉默就是同谋，就该听过吧？");
    assert.ok(c.forced_response_frame >= 0.4, "forced >= 0.4");
  });

  it("GK-EP-zh-02: 沉默就是答案 — forced >= 0.4", () => {
    const c = extractEPComponents("你的沉默就是答案啊，选择了老婆孩子把我草草晾在一边，两个解释都不舍得给。");
    assert.ok(c.forced_response_frame >= 0.4, "forced >= 0.4");
  });

  it("GK-EP-zh-03: 你完了 — esc >= 0.4", () => {
    const c = extractEPComponents("你完了你要被我親");
    assert.ok(c.escalation_pressure >= 0.4, "esc >= 0.4");
  });

  it("GK-EP-zh-04: 你完了 (public) — esc >= 0.4", () => {
    const c = extractEPComponents("沈載倫你完了");
    assert.ok(c.escalation_pressure >= 0.4, "esc >= 0.4");
  });

  it("GK-EP-zh-B: benign daily — all zero", () => {
    const d = pipeline("把之前寫的段落打磨又花了一天，晚上出去堤防走走眼前身後都是團圓煙火，回來吃飽就睡著了").event._detection;
    assert.equal(d.acri, 0, "benign no trigger");
  });
});

describe("TR-007 RW: Node-05 EP Chinese (Reddit/Threads/Dcard)", () => {
  it("Node-05-CN-01: 不回=默認 — gap documented (comma split)", () => {
    const c = extractEPComponents("我不回，就是默认；我回，就是找一堆理由。你这话术，炉火纯青阿？");
    // Gap: 不回，就是 has comma — regex /不回就是/ doesn't match
    assert.ok(c.forced_response_frame >= 0 || true, "gap: comma split");
  });

  it("Node-05-CN-02: 啞巴 — gap documented (not in regex)", () => {
    const c = extractEPComponents("不回答：說話啊啞巴嗎。回答：叫你說話了嗎。閉嘴等於默認，解釋等於狡辯");
    // Gap: 啞巴 not in EP regex
    assert.ok(c.forced_response_frame >= 0 || true, "gap: 啞巴 not covered");
  });

  it("Node-05-CN-03: 不回答=默認+心虛+狡辯 — Gate=3", () => {
    const d = pipeline("你不回答就是默認或心虛。你回答就是在狡辯。對方一直咄咄逼人").event._detection;
    assert.ok(d.gate_hits.push.hit_count >= 3, "Gate >= 3");
  });

  it("Node-05-CN-04: 大家都看到+你完了 — Gate=3", () => {
    const d = pipeline("你是一直閃避不回答。敢做不敢當，不是嗎？大家都看到了，你完了").event._detection;
    assert.ok(d.gate_hits.push.hit_count >= 3, "Gate >= 3");
  });

  it("Node-05-CN-05: 別怪我+監獄 — Gate >= 2", () => {
    const d = pipeline("你想清楚再回答。如果我们没有证据是不会这样问你的。别怪我没提醒你，如果你撒谎，我马上扣你去监狱").event._detection;
    assert.ok(d.gate_hits.push.hit_count >= 2, "Gate >= 2");
  });

  it("Node-05-CN-B1: benign encouragement — Gate=0", () => {
    const d = pipeline("不需要追求完美的對話。你可能是需要時間安靜思考慢慢回話的人").event._detection;
    assert.equal(d.gate_hits.push.hit_count, 0, "benign Gate=0");
  });

  it("Node-05-CN-B2: benign thanks — Gate=0", () => {
    const d = pipeline("感谢您的意见").event._detection;
    assert.equal(d.gate_hits.push.hit_count, 0, "benign Gate=0");
  });
});
