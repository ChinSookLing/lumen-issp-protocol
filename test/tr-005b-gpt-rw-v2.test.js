// TR-005b Golden Tests — Node-05-C12~C22 v2 (Chain-RW)
// Source: Node-05 (Reddit forum posts, second batch)
// Date: 2026-02-19

const { pipeline } = require('../src/pipeline/dispatcher');
const assert = require('node:assert');
const { describe, it } = require('node:test');

describe("TR-005b: Node-05 RW v2 — FC Chain-RW", () => {
  it("C12-v2: PIP terminated early — Gate >= 1", () => {
    const r = pipeline("I was terminated with 30 days left in my 90-day PIP. One goal deadline was in four days, but I was cut before I could complete it. I didnt get a chance to hit the remaining targets.");
    assert.ok(r.event._detection.gate_hits.push.hit_count >= 1, "Gate >= 1");
  });

  it("C14-v2: either sign or leave — binary frame", () => {
    const r = pipeline("You either want to live there or not. Sign the lease and move in, or find another place. The short window is framed as your problem, not the agencys.");
    assert.ok(r.event._detection.gate_hits.push.hit_count >= 1, "Gate >= 1");
  });

  it("C15-v2: 24h standard processing — Gate >= 1", () => {
    const r = pipeline("24 hours is our standard processing time. We assumed you were excited and wanted to sign as soon as possible. Only after pushback were a few more days offered.");
    assert.ok(r.event._detection.gate_hits.push.hit_count >= 1, "Gate >= 1");
  });
});

describe("TR-005b: Node-05 RW v2 — MB loyalty Chain-RW", () => {
  it("C19-v2: remember Judas — guilt + intimidation", () => {
    const r = pipeline("Just remember what happened to Judas. The message functions as guilt and intimidation rather than discussion. Boundary is punished via spiritual threat framing.");
    assert.ok(r.event._detection.gate_hits.push.hit_count >= 1, "Gate >= 1");
  });

  it("C20-v2: prove youre supportive — loyalty loop", () => {
    const r = pipeline("She asked again if I had doubts and implied I could step down. I kept reaffirming I would go and would always be there. The dynamic becomes prove youre supportive rather than resolve misunderstanding.");
    assert.ok(r.event._detection.gate_hits.push.hit_count >= 1, "Gate >= 1");
  });

  it("C22-v2: if you really cared — moral gate + like-chasing", () => {
    const r = pipeline("If you really cared, you would call or send help instead of posting. Instead, youre chasing likes. The frame equates care with one prescribed action path.");
    assert.ok(r.event._detection.gate_hits.push.hit_count >= 2, "Gate >= 2");
  });
});
